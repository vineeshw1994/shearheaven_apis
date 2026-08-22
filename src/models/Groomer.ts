import {
  DataTypes,
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

class Groomer extends Model<InferAttributes<Groomer>, InferCreationAttributes<Groomer>> {
  declare id: CreationOptional<number>;
  declare groomerCode: string;
  declare firstName: string;
  declare lastName: string;
  declare email: CreationOptional<string>;
  declare password: CreationOptional<string>;
  declare mobile: CreationOptional<string>;
  declare role: string;
  declare highlights: CreationOptional<string>;
  declare type: CreationOptional<'Groomer' | 'Bather'>;
  declare isActive: CreationOptional<boolean>;
  declare multiBookingEnabled: CreationOptional<boolean>;
  declare slotBookingLimit: CreationOptional<number>;
  declare mustChangePassword: CreationOptional<boolean>;
  declare tempLoginId: CreationOptional<string>;
  declare clientId: string;
  declare regionId: string;
  declare storeId: string;
}

Groomer.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    groomerCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    mobile: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '',
    },
    role: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: '',
    },
    highlights: {
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: '',
    },
    type: {
      type: DataTypes.ENUM('Groomer', 'Bather'),
      allowNull: false,
      defaultValue: 'Groomer',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    multiBookingEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    slotBookingLimit: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },
    mustChangePassword: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    tempLoginId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    clientId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    regionId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    storeId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'groomers',
    timestamps: true,
    indexes: [
      {
        unique: true,
        name: 'groomers_code_tenant_unique',
        fields: ['groomerCode', 'clientId', 'regionId', 'storeId'],
      },
      { name: 'groomers_tenant', fields: ['clientId', 'regionId', 'storeId'] },
    ],
  }
);

export default Groomer;
