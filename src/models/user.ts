import { DataTypes, Model } from "sequelize";
import {sequelize} from "../../config/database"; // Import your Sequelize instance

class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public image!: string;
  static associate(models: any) {
    User.hasMany(models.Product, {
      foreignKey: "userId",
      as: "products",
    });
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: "default_image.jpg", // Set a default value
    },
  },
  {
    sequelize,
    tableName: "users",
  }
);

export { User };
