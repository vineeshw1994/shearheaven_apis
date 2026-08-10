import {
  DataTypes,
  Model,
  Optional,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

export interface PendingSignupAttributes {
  id: number;
  name: string;
  email: string;
  mobile: string;
  password: string;
  otpHash: string;
  expiresAt: Date;
  verified: boolean;
  attempts: number;
  clientId: string;
  regionId: string;
  storeId: string;
}

export type PendingSignupCreationAttributes = Optional<
  PendingSignupAttributes,
  'id' | 'verified' | 'attempts' | 'clientId' | 'regionId' | 'storeId'
>;

class PendingSignup extends Model<
  InferAttributes<PendingSignup>,
  InferCreationAttributes<PendingSignup>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare mobile: string;
  declare password: string;
  declare otpHash: string;
  declare expiresAt: Date;
  declare verified: CreationOptional<boolean>;
  declare attempts: CreationOptional<number>;
  declare clientId: CreationOptional<string>;
  declare regionId: CreationOptional<string>;
  declare storeId: CreationOptional<string>;
}

PendingSignup.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { isEmail: true },
    },
    mobile: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
    tableName: 'pending_signups',
    timestamps: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['mobile'] },
      { fields: ['expiresAt'] },
      { fields: ['clientId', 'regionId', 'storeId'] },
    ],
  }
);

export default PendingSignup;
