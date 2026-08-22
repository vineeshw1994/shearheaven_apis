import {
  DataTypes,
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

export type StoreContentKey =
  | 'contact-info'
  | 'about-us'
  | 'help-support'
  | 'privacy-policy'
  | 'terms-conditions';

class StoreContent extends Model<InferAttributes<StoreContent>, InferCreationAttributes<StoreContent>> {
  declare id: CreationOptional<number>;
  declare contentKey: StoreContentKey;
  declare title: string;
  declare body: string;
  declare metadata: CreationOptional<Record<string, unknown>>;
  declare clientId: string;
  declare regionId: string;
  declare storeId: string;
  declare isActive: CreationOptional<boolean>;
}

StoreContent.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    contentKey: {
      type: DataTypes.ENUM(
        'contact-info',
        'about-us',
        'help-support',
        'privacy-policy',
        'terms-conditions'
      ),
      allowNull: false,
    },
    title: { type: DataTypes.STRING(200), allowNull: false, defaultValue: '' },
    body: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
    metadata: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
    clientId: { type: DataTypes.STRING(50), allowNull: false, defaultValue: '' },
    regionId: { type: DataTypes.STRING(50), allowNull: false, defaultValue: '' },
    storeId: { type: DataTypes.STRING(50), allowNull: false, defaultValue: '' },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  {
    sequelize,
    tableName: 'store_content',
    timestamps: true,
    indexes: [
      {
        unique: true,
        name: 'store_content_key_tenant',
        fields: ['contentKey', 'clientId', 'regionId', 'storeId'],
      },
    ],
  }
);

export default StoreContent;
