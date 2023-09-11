import { DataTypes, Model } from "sequelize";
import {sequelize} from "../../config/database"; // Import your Sequelize instance
import { User } from "./user"; // Import the User model

class Product extends Model {
  public id!: number;
  public title!: string;
  public price!: number;
  public image!: string;
  public userId!: number;

  // Define associations here
  static associate(models: any) {
    // A product belongs to a user
    Product.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user", // Alias for the association
    });
  }
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "products",
  }
);

export { Product };
