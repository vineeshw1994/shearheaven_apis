import {
  DataTypes,
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

class ChatMessage extends Model<InferAttributes<ChatMessage>, InferCreationAttributes<ChatMessage>> {
  declare id: CreationOptional<number>;
  declare userId: CreationOptional<number | null>;
  declare groomerId: CreationOptional<number | null>;
  declare senderType: CreationOptional<'user' | 'groomer' | 'staff' | 'assistant'>;
  declare message: string;
  declare sessionId: string;
  declare clientId: CreationOptional<string>;
  declare regionId: CreationOptional<string>;
  declare storeId: CreationOptional<string>;
}

ChatMessage.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    groomerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    senderType: {
      type: DataTypes.ENUM('user', 'groomer', 'staff', 'assistant'),
      allowNull: false,
      defaultValue: 'user',
    },
    message: { type: DataTypes.TEXT, allowNull: false },
    sessionId: { type: DataTypes.STRING(100), allowNull: false },
    clientId: { type: DataTypes.STRING(50), allowNull: false, defaultValue: '' },
    regionId: { type: DataTypes.STRING(50), allowNull: false, defaultValue: '' },
    storeId: { type: DataTypes.STRING(50), allowNull: false, defaultValue: '' },
  },
  {
    sequelize,
    tableName: 'chat_messages',
    timestamps: true,
    indexes: [{ fields: ['sessionId'] }, { fields: ['userId'] }],
  }
);

export default ChatMessage;
