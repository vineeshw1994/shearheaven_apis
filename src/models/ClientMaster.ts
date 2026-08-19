import {
  DataTypes,
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

class ClientMaster extends Model<InferAttributes<ClientMaster>, InferCreationAttributes<ClientMaster>> {
  declare id: CreationOptional<number>;
  declare clientId: string;
  declare name: string;
  declare isActive: CreationOptional<boolean>;
}

ClientMaster.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'client_master',
    timestamps: true,
    indexes: [{ unique: true, fields: ['clientId'] }],
  }
);

export default ClientMaster;
