import { NextFunction, Request, Response } from "express";
import { User } from "../models/user";
import { Product } from "../models/product";
import userRequest from "../interfaces/userRequest";
import fs from "fs/promises"; // Import the fs.promises module for file operations
import { deleteImage} from '../utils/deleteImage'

class ProductClass {

  async addProduct(req: userRequest, res: Response, next: NextFunction) {
    try {
      if (req.file) {
        req.body.image = req.file.path;
      }
      const { title, price, image } = req.body;
      const userId = req.user;
      const product = await Product.create({
        title,
        price,
        image,
        userId,
      });
      res.status(201).json({
        status: true,
        msg: "Product added successfully",
        product,
      });
    } catch (error) {
      console.log("Error creating Product:", error);
      res.status(500).json({
        status: false,
        msg: "Server error",
      });
    }
  }

  async getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await Product.findAll();
      res.status(200).json({
        status: true,
        msg: "All products retrieved successfully",
        results: products.length,
        products,
      });
    } catch (error) {
      console.log("Error retrieving products:", error);
      res.status(500).json({
        status: false,
        msg: "Server error",
      });
    }
  }

  async updateProduct(req: userRequest, res: Response, next: NextFunction) {
    try {      
      const { productId } = req.params;
      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({
          status: false,
          msg: "Product not found",
        });
      }
      if (product.userId !== req.user) {
        return res.status(403).json({
          status: false,
          msg: "Forbidden - You don't own this product",
        });
      }
      if (req.file) {

        req.body.image = req.file.path;        
        deleteImage(product.image)
          .then(() => {
            console.log("Image deleted successfully.");
          })
          .catch((error) => {
            console.error("Error deleting image:", error);
          });
      }
      const { title, price, image } = req.body;
      const updatedProduct = await Product.update(
        { title, price ,image},
        {
          where: { id: productId }
        }
      );

      res.status(200).json({
        status: true,
        msg: "Product updated successfully",
      });
    } catch (error) {
      console.log("Error updating product:", error);
      res.status(500).json({
        status: false,
        msg: "Server error...",
      });
    }
  }

  async deleteProduct(req: userRequest, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({
          status: false,
          msg: "Product not found",
        });
      }
      if (product.userId !== req.user) {
        return res.status(403).json({
          status: false,
          msg: "Forbidden - You don't own this product",
        });
      }
      await product.destroy();
      deleteImage(product.image)
        .then(() => {
          console.log("Image deleted successfully.");
        })
        .catch((error) => {
          console.error("Error deleting image:", error);
        });
      res.status(200).json({
        status: true,
        msg: "Product deleted successfully",
      });
    } catch (error) {
      console.log("Error deleting product:", error);
      res.status(500).json({
        status: false,
        msg: "Server error",
      });
    }
  }
}

const productController = new ProductClass ();
export default productController;
