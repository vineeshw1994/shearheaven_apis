import {
  DataTypes,
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

class Offer extends Model<InferAttributes<Offer>, InferCreationAttributes<Offer>> {
  declare id: CreationOptional<number>;
  declare promoCode: string;
  declare title: string;
  declare description: CreationOptional<string>;
  declare discountType: CreationOptional<'percentage' | 'fixed'>;
  declare discountValue: number;
  declare minOrderAmount: CreationOptional<number>;
  declare maxUses: CreationOptional<number | null>;
  declare usedCount: CreationOptional<number>;
  declare startDate: CreationOptional<string | null>;
  declare endDate: CreationOptional<string | null>;
  declare isActive: CreationOptional<boolean>;
  declare clientId: string;
  declare regionId: string;
  declare storeId: string;
}

Offer.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    promoCode: { type: DataTypes.STRING(50), allowNull: false },
    title: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.STRING(500), allowNull: false, defaultValue: '' },
    discountType: {
      type: DataTypes.ENUM('percentage', 'fixed'),
      allowNull: false,
      defaultValue: 'percentage',
    },
    discountValue: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    minOrderAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    maxUses: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    usedCount: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    startDate: { type: DataTypes.DATEONLY, allowNull: true },
    endDate: { type: DataTypes.DATEONLY, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    clientId: { type: DataTypes.STRING(50), allowNull: false, defaultValue: '' },
    regionId: { type: DataTypes.STRING(50), allowNull: false, defaultValue: '' },
    storeId: { type: DataTypes.STRING(50), allowNull: false, defaultValue: '' },
  },
  {
    sequelize,
    tableName: 'offers',
    timestamps: true,
    indexes: [
      { unique: true, name: 'offers_promo_tenant', fields: ['promoCode', 'clientId', 'regionId', 'storeId'] },
    ],
  }
);

export default Offer;
