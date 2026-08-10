import {
  DataTypes,
  Model,
  Optional,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

export interface RefreshTokenAttributes {
  id: number;
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  revoked: boolean;
  clientId: string;
  regionId: string;
  storeId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type RefreshTokenCreationAttributes = Optional<
  RefreshTokenAttributes,
  'id' | 'revoked' | 'clientId' | 'regionId' | 'storeId' | 'createdAt' | 'updatedAt'
>;

class RefreshToken extends Model<
  InferAttributes<RefreshToken>,
  InferCreationAttributes<RefreshToken>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare tokenHash: string;
  declare expiresAt: Date;
  declare revoked: CreationOptional<boolean>;
  declare clientId: CreationOptional<string>;
  declare regionId: CreationOptional<string>;
  declare storeId: CreationOptional<string>;
}

RefreshToken.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    tokenHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    revoked: {
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
    tableName: 'refresh_tokens',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['revoked'] },
      { fields: ['expiresAt'] },
      { fields: ['clientId', 'regionId', 'storeId'] },
    ],
  }
);

export default RefreshToken;
