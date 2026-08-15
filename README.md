# Shear Heaven API

Production-ready **Node.js + TypeScript REST API** for the Shear Heaven pet grooming platform.

## Tech Stack

- Node.js + TypeScript
- Express.js
- MySQL + Sequelize ORM (`mysql2`)
- JWT authentication (access + refresh tokens)
- Nodemailer (Gmail SMTP) for OTP email verification
- Joi validation
- Swagger/OpenAPI documentation
- Jest + Supertest

## Project Structure

```text
src/
├── config/          # Database, mailer, env, swagger
├── controllers/     # Route handlers
├── services/        # Business logic
├── routes/          # API routes
├── models/          # Sequelize models
├── middleware/      # Auth, validation, upload, errors
├── utils/           # JWT, crypto, logger, responses
├── data/            # Static JSON data files
├── migrations/      # Sequelize migrations
├── types/           # TypeScript types
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

## Prerequisites

- Node.js 18+
- MySQL 8+
- Gmail App Password (for OTP emails)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Required variables:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=shear_heaven
DB_USER=root
DB_PASSWORD=your_password

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=shearheaven.dwg@gmail.com
SMTP_PASSWORD=your_gmail_app_password
SMTP_FROM_NAME=Shear Heaven
```

### 3. Create MySQL database

```sql
CREATE DATABASE shear_heaven CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Run migrations

```bash
npm run migrate
```

### 5. Start the server

Development:

```bash
npm run dev
```

Production:

```bash
npm run build
npm start
```

## API Documentation

Swagger UI is available at:

```text
http://localhost:5000/api-docs
```

## API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/send-otp` | Send OTP email |
| POST | `/api/auth/verify-otp` | Verify OTP |
| POST | `/api/auth/refresh-token` | Refresh access token |
| POST | `/api/auth/logout` | Logout (requires auth) |

### Data APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/groomers` | Get groomers |
| GET | `/api/holidays` | Get holidays |
| GET | `/api/service-hours` | Get service hours |
| GET | `/api/breeds` | Get breeds |
| GET | `/api/pet-weights` | Get pet weight ranges |
| GET | `/api/service-packages` | Get services, packages, and add-ons |

### Pets (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pets` | Create pet |
| GET | `/api/pets` | List user's pets |
| GET | `/api/pets/:id` | Get pet by ID |
| PUT | `/api/pets/:id` | Update pet |
| DELETE | `/api/pets/:id` | Delete pet |

Pet profile pictures are uploaded via `multipart/form-data` with field name `profilePicture`.

### Bookings (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/availability` | Get groomer working hours and available slots |
| POST | `/api/bookings` | Create a booking |

Prices and durations are taken from `src/data/service&packages.json`. `endTime` must equal `startTime` plus the calculated duration.

## Testing

Create a test database:

```sql
CREATE DATABASE shear_heaven_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Run tests:

```bash
npm test
```

## Security Features

- Helmet, CORS, rate limiting
- bcrypt password hashing
- JWT access + refresh tokens with revocation on logout
- OTP hashing and expiration (5 minutes)
- OTP rate limiting
- Joi request validation
- Centralized error handling (no secrets in responses)
- Sensitive data redaction in logs

## Multi-Tenant Fields

All database tables include `clientId`, `regionId`, and `storeId` columns. JSON data files also include `ClientId`, `RegionId`, and `StoreId` at the root level.

## License

ISC
