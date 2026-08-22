import {
  DataTypes,
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

class Discount extends Model<InferAttributes<Discount>, InferCreationAttributes<Discount>> {
  declare id: CreationOptional<number>;
  declare code: string;
  declare name: string;
  declare description: CreationOptional<string>;
  declare discountType: CreationOptional<'percentage' | 'fixed'>;
  declare discountValue: number;
  declare serviceIds: CreationOptional<number[]>;
  declare minOrderAmount: CreationOptional<number>;
  declare startDate: CreationOptional<string | null>;
  declare endDate: CreationOptional<string | null>;
  declare isActive: CreationOptional<boolean>;
  declare clientId: string;
  declare regionId: string;
  declare storeId: string;
}

Discount.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    code: { type: DataTypes.STRING(50), allowNull: false },
    name: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.STRING(500), allowNull: false, defaultValue: '' },
    discountType: {
      type: DataTypes.ENUM('percentage', 'fixed'),
      allowNull: false,
      defaultValue: 'percentage',
    },
    discountValue: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    serviceIds: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    minOrderAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    startDate: { type: DataTypes.DATEONLY, allowNull: true },
    endDate: { type: DataTypes.DATEONLY, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    clientId: { type: DataTypes.STRING(50), allowNull: false, defaultValue: '' },
    regionId: { type: DataTypes.STRING(50), allowNull: false, defaultValue: '' },
    storeId: { type: DataTypes.STRING(50), allowNull: false, defaultValue: '' },
  },
  {
    sequelize,
    tableName: 'discounts',
    timestamps: true,
    indexes: [
      { unique: true, name: 'discounts_code_tenant', fields: ['code', 'clientId', 'regionId', 'storeId'] },
    ],
  }
);

export default Discount;
