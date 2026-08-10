import {
  DataTypes,
  Model,
  Optional,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

export interface OtpAttributes {
  id: number;
  email: string;
  otpHash: string;
  expiresAt: Date;
  verified: boolean;
  attempts: number;
  clientId: string;
  regionId: string;
  storeId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type OtpCreationAttributes = Optional<
  OtpAttributes,
  'id' | 'verified' | 'attempts' | 'clientId' | 'regionId' | 'storeId' | 'createdAt' | 'updatedAt'
>;

class Otp extends Model<InferAttributes<Otp>, InferCreationAttributes<Otp>> {
  declare id: CreationOptional<number>;
  declare email: string;
  declare otpHash: string;
  declare expiresAt: Date;
  declare verified: CreationOptional<boolean>;
  declare attempts: CreationOptional<number>;
  declare clientId: CreationOptional<string>;
  declare regionId: CreationOptional<string>;
  declare storeId: CreationOptional<string>;
}

Otp.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    otpHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    attempts: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
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
    tableName: 'otps',
    timestamps: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['expiresAt'] },
      { fields: ['clientId', 'regionId', 'storeId'] },
    ],
  }
);

export default Otp;
