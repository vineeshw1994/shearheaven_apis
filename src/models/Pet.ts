import {
  DataTypes,
  Model,
  Optional,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../config/database';

export interface PetAttributes {
  id: number;
  userId: number;
  profilePicture: string | null;
  petName: string;
  breed: string;
  weight: string;
  age: number | null;
  dateOfBirth: Date | null;
  gender: string;
  notesAllergies: string | null;
  allVaccinatedCurrent: boolean;
  lastVaccinatedDate: Date | null;
  behaviorNotes: string | null;
  clientId: string;
  regionId: string;
  storeId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PetCreationAttributes = Optional<
  PetAttributes,
  | 'id'
  | 'profilePicture'
  | 'age'
  | 'dateOfBirth'
  | 'notesAllergies'
  | 'allVaccinatedCurrent'
  | 'lastVaccinatedDate'
  | 'behaviorNotes'
  | 'clientId'
  | 'regionId'
  | 'storeId'
  | 'createdAt'
  | 'updatedAt'
>;

class Pet extends Model<InferAttributes<Pet>, InferCreationAttributes<Pet>> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare profilePicture: CreationOptional<string | null>;
  declare petName: string;
  declare breed: string;
  declare weight: string;
  declare age: CreationOptional<number | null>;
  declare dateOfBirth: CreationOptional<Date | null>;
  declare gender: string;
  declare notesAllergies: CreationOptional<string | null>;
  declare allVaccinatedCurrent: CreationOptional<boolean>;
  declare lastVaccinatedDate: CreationOptional<Date | null>;
  declare behaviorNotes: CreationOptional<string | null>;
  declare clientId: CreationOptional<string>;
  declare regionId: CreationOptional<string>;
  declare storeId: CreationOptional<string>;
}

Pet.init(
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
    profilePicture: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    petName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    breed: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    weight: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'unknown'),
      allowNull: false,
      defaultValue: 'unknown',
    },
    notesAllergies: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    allVaccinatedCurrent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    lastVaccinatedDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    behaviorNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'pets',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['clientId', 'regionId', 'storeId'] },
    ],
  }
);

export default Pet;
