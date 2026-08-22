import {
  DataTypes,
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

class GroomerRefreshToken extends Model<
  InferAttributes<GroomerRefreshToken>,
  InferCreationAttributes<GroomerRefreshToken>
> {
  declare id: CreationOptional<number>;
  declare groomerId: number;
  declare tokenHash: string;
  declare expiresAt: Date;
  declare revoked: CreationOptional<boolean>;
}

GroomerRefreshToken.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    groomerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    tokenHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
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
  },
  {
    sequelize,
    tableName: 'groomer_refresh_tokens',
    timestamps: true,
    indexes: [{ fields: ['groomerId'] }],
  }
);

export default GroomerRefreshToken;
