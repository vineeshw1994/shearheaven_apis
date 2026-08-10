import request from 'supertest';
import { createApp } from '../src/app';
import { sequelize } from '../src/config/database';
import { syncModels, User } from '../src/models';
import { sendOtpEmail } from '../src/services/email.service';
import PendingSignup from '../src/models/PendingSignup';
import Otp from '../src/models/Otp';
import { hashToken } from '../src/utils/crypto';

const app = createApp();

const testUser = {
  name: 'John Doe',
  email: 'john@example.com',
  mobile: '9876543210',
  password: 'Password@123',
  confirmPassword: 'Password@123',
};

const otherUser = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  mobile: '9876543211',
  password: 'Password@123',
  confirmPassword: 'Password@123',
};

async function registerUser(userData: typeof testUser, otp = '482731') {
  await request(app).post('/api/auth/signup').send(userData);

  const otpHash = await hashToken(otp);
  await PendingSignup.update({ otpHash }, { where: { email: userData.email, verified: false } });

  return request(app)
    .post('/api/auth/verify-otp')
    .send({ email: userData.email, otp });
}

beforeAll(async () => {
  await sequelize.authenticate();
  await syncModels(true);
});

afterAll(async () => {
  await sequelize.close();
});

describe('Auth API', () => {
  describe('POST /api/auth/signup', () => {
    it('should send OTP and not register user yet', async () => {
      const res = await request(app).post('/api/auth/signup').send(testUser);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(testUser.email);
      expect(sendOtpEmail).toHaveBeenCalled();

      const user = await User.findOne({ where: { email: testUser.email } });
      expect(user).toBeNull();

      const pending = await PendingSignup.findOne({ where: { email: testUser.email, verified: false } });
      expect(pending).not.toBeNull();
    });

    it('should resend OTP for pending signup with same email', async () => {
      const res = await request(app).post('/api/auth/signup').send(testUser);
      expect(res.status).toBe(200);
    });

    it('should reject invalid data', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ ...testUser, email: 'invalid', confirmPassword: 'Mismatch@123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    it('should register user after valid OTP', async () => {
      const res = await registerUser(testUser);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email);

      const user = await User.findOne({ where: { email: testUser.email } });
      expect(user).not.toBeNull();
      expect(user!.emailVerified).toBe(true);
    });

    it('should reject duplicate email after registration', async () => {
      const res = await request(app).post('/api/auth/signup').send(testUser);
      expect(res.status).toBe(409);
    });

    it('should reject invalid OTP', async () => {
      await request(app).post('/api/auth/signup').send({
        ...otherUser,
        email: 'invalidotp@example.com',
        mobile: '9876543299',
      });

      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: 'invalidotp@example.com', otp: '000000' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject expired OTP', async () => {
      const email = 'expired@example.com';
      const otp = '123456';
      const otpHash = await hashToken(otp);

      await PendingSignup.create({
        name: 'Expired User',
        email,
        mobile: '9876543298',
        password: 'hashed',
        otpHash,
        expiresAt: new Date(Date.now() - 1000),
      });

      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email, otp });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it('should reject invalid login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'WrongPassword@123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/send-otp', () => {
    it('should send OTP email for existing unverified user', async () => {
      const unverifiedEmail = 'unverified@example.com';
      await User.create({
        name: 'Unverified',
        email: unverifiedEmail,
        mobile: '9876543297',
        password: await hashToken('Password@123'),
        emailVerified: false,
      });

      const res = await request(app)
        .post('/api/auth/send-otp')
        .send({ email: unverifiedEmail });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(sendOtpEmail).toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('should refresh access token', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: loginRes.body.data.refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout and revoke refresh token', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      const { accessToken, refreshToken } = loginRes.body.data;

      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken });

      expect(logoutRes.status).toBe(200);

      const refreshRes = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken });

      expect(refreshRes.status).toBe(401);
    });
  });
});

describe('Authentication Middleware', () => {
  it('should reject requests without token', async () => {
    const res = await request(app).get('/api/pets');
    expect(res.status).toBe(401);
  });

  it('should reject invalid token', async () => {
    const res = await request(app)
      .get('/api/pets')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(res.status).toBe(401);
  });
});

describe('Pet CRUD API', () => {
  let accessToken: string;
  let otherAccessToken: string;
  let petId: number;
  const testImagePath = `${__dirname}/fixtures/test-pet.png`;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    accessToken = loginRes.body.data.accessToken;

    await registerUser(otherUser);
    const otherLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: otherUser.email, password: otherUser.password });
    otherAccessToken = otherLogin.body.data.accessToken;
  });

  it('should reject create pet without token', async () => {
    const res = await request(app)
      .post('/api/pets')
      .field('petName', 'Buddy')
      .attach('profilePicture', testImagePath);

    expect(res.status).toBe(401);
  });

  it('should reject create pet without profile picture', async () => {
    const res = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('petName', 'Buddy')
      .field('breed', 'Labrador Retriever')
      .field('weight', 'Medium');

    expect(res.status).toBe(400);
  });

  it('should create a pet with profile picture', async () => {
    const res = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('petName', 'Buddy')
      .field('breed', 'Labrador Retriever')
      .field('weight', 'Medium')
      .field('age', '3')
      .field('gender', 'male')
      .field('allVaccinatedCurrent', 'true')
      .attach('profilePicture', testImagePath);

    expect(res.status).toBe(201);
    expect(res.body.data.pet.petName).toBe('Buddy');
    expect(res.body.data.pet.profilePicture).toBeDefined();
    petId = res.body.data.pet.id;
  });

  it('should get all pets for authenticated user', async () => {
    const res = await request(app)
      .get('/api/pets')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.userId).toBeDefined();
    expect(res.body.data.pets.length).toBeGreaterThan(0);
  });

  it('should get pet by id', async () => {
    const res = await request(app)
      .get(`/api/pets/${petId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.pet.id).toBe(petId);
  });

  it('should update pet with profile picture', async () => {
    const res = await request(app)
      .put(`/api/pets/${petId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .field('petName', 'Buddy Updated')
      .field('breed', 'Labrador Retriever')
      .field('weight', 'Medium')
      .attach('profilePicture', testImagePath);

    expect(res.status).toBe(200);
    expect(res.body.data.pet.petName).toBe('Buddy Updated');
  });

  it('should prevent access to another user pet', async () => {
    const res = await request(app)
      .get(`/api/pets/${petId}`)
      .set('Authorization', `Bearer ${otherAccessToken}`);

    expect(res.status).toBe(403);
  });

  it('should delete pet', async () => {
    const res = await request(app)
      .delete(`/api/pets/${petId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
  });
});

describe('JSON Data APIs', () => {
  it('GET /api/groomers', async () => {
    const res = await request(app).get('/api/groomers');
    expect(res.status).toBe(200);
    expect(res.body.data.Groomers).toBeDefined();
    expect(res.body.data.Bathers).toBeDefined();
    expect(res.body.data.ClientID).toBeDefined();
  });

  it('GET /api/holidays', async () => {
    const res = await request(app).get('/api/holidays');
    expect(res.status).toBe(200);
    expect(res.body.data.HolidayList.length).toBeGreaterThan(0);
  });

  it('GET /api/service-hours', async () => {
    const res = await request(app).get('/api/service-hours');
    expect(res.status).toBe(200);
    expect(res.body.data.HolidayList).toBeDefined();
  });

  it('GET /api/service-packages', async () => {
    const res = await request(app).get('/api/service-packages');
    expect(res.status).toBe(200);
    expect(res.body.data.Breeds).toBeDefined();
    expect(res.body.data.Packages).toBeDefined();
    expect(res.body.data.AddOns).toBeDefined();
    expect(res.body.data['Walk In Services']).toBeDefined();
  });

  it('GET /api/breeds', async () => {
    const res = await request(app).get('/api/breeds');
    expect(res.status).toBe(200);
    expect(res.body.data.breeds.length).toBeGreaterThan(0);
  });

  it('GET /api/pet-weights', async () => {
    const res = await request(app).get('/api/pet-weights');
    expect(res.status).toBe(200);
    expect(res.body.data.petWeights.length).toBeGreaterThan(0);
  });
});
