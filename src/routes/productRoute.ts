import { Router } from "express";
import productController from "../controllers/productController";
const router = Router();
import auth from '../middlewares/auth';
import uploadToDiskStorage from "../middlewares/multer";

router.get("/", auth, productController.getAllProducts);

router.use(auth);

router.post("/",
  uploadToDiskStorage.single("image"),
  productController.addProduct);


router
  .route("/:productId")
  .put(
    uploadToDiskStorage.single("image"),
    productController.updateProduct)
  
  .delete(productController.deleteProduct);

export default router;
