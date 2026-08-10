import {
  DataTypes,
  Model,
  Optional,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  mobile: string;
  password: string;
  emailVerified: boolean;
  clientId: string;
  regionId: string;
  storeId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | 'emailVerified' | 'clientId' | 'regionId' | 'storeId' | 'createdAt' | 'updatedAt'
>;

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare mobile: string;
  declare password: string;
  declare emailVerified: CreationOptional<boolean>;
  declare clientId: CreationOptional<string>;
  declare regionId: CreationOptional<string>;
  declare storeId: CreationOptional<string>;

  toSafeJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      mobile: this.mobile,
      emailVerified: this.emailVerified,
      clientId: this.clientId,
      regionId: this.regionId,
      storeId: this.storeId,
    };
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    mobile: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    clientId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '',
    },
    regionId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '',
    },
    storeId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '',
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['email'] },
      { unique: true, fields: ['mobile'] },
      { fields: ['clientId', 'regionId', 'storeId'] },
    ],
  }
);

export default User;
