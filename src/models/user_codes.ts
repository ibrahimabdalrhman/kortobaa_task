import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database"; // Import your Sequelize instance
import { User } from "./user"; // Import your User model

class User_Codes extends Model {
  public id!: number;
  public verifyEmailCode?: string;
  public verifyEmailCodeExpiresAt?: Date;
  public resetPasswordCode?: string;
  public resetPasswordCodeExpiresAt?: Date;
  public resetPasswordCodeVerified!: boolean;
  public userId!: number;

  static associate(models: any) {
    User_Codes.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  }
}

User_Codes.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    verifyEmailCode: {
      type: DataTypes.STRING,
    },
    verifyEmailCodeExpiresAt: {
      type: DataTypes.DATE,
    },
    resetPasswordCode: {
      type: DataTypes.STRING,
    },
    resetPasswordCodeExpiresAt: {
      type: DataTypes.DATE,
    },
    resetPasswordCodeVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: "user_codes",
  }
);

export { User_Codes };
