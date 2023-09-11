import { Router } from 'express';
import authController from '../controllers/authController';
const router = Router();
import joiAsyncMiddleWare from "../middlewares/joiMiddleware";
import uploadToDiskStorage from "../middlewares/multer";
import auth from "../middlewares/auth";
import {
  signupValidation,
  loginValidation,
  forgetPasswordValidation,
} from "../validation/authValidator";


router.post(
  "/signup",
  joiAsyncMiddleWare(signupValidation),
  authController.signup
);

router.post(
  "/login",
  joiAsyncMiddleWare(loginValidation),
  authController.login
);

router.post(
  "/forgetpassword",
  joiAsyncMiddleWare(forgetPasswordValidation),
  authController.forgetPassword
);
router.post("/verifyResetCode", authController.verifyResetPasswordCode);

router.post("/resetpassword", authController.resetPassword);

router.patch(
  "/updateProfileImage",
  auth,
  uploadToDiskStorage.single('image'),
  authController.updateProfileImage
);

export default router;