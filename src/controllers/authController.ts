import { NextFunction, Request, Response } from "express";
import { User } from "../models/user";
import { User_Codes } from '../models/user_codes';
import bcrypt from "bcrypt";
import signToken from "../utils/signToken";
import userRequest from "../interfaces/userRequest";
import ApiError from "../utils/apiError";
import fs from "fs/promises"; // Import the fs.promises module for file operations
import crypto from "crypto";
import sendMail  from "../utils/sendMail";

class Auth {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, image } = req.body;

      const user = await User.create({
        name,
        email,
        password: await bcrypt.hash(password, 8),
        image,
      });
      const token = signToken({ id: user.id });
      res.status(201).json({
        status: true,
        msg: "Account created successfully",
        user,
        token,
      });
    } catch (error) {
      console.log("Error creating user:", error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({
        where: { email },
      });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({
          status: false,
          msg: "Invalid credentials",
        });
      }
      const token = signToken({ id: user.id });
      res.status(200).json({
        status: true,
        msg: "Login successful",
        user,
        token,
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({
        status: false,
        msg: "Server error",
      });
    }
  }

  async updateProfileImage(
    req: userRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user as number;

      if (!req.file) {
        return next(
          new ApiError("No image has been added, you can try again", 401)
        );
      }
      req.body.image = req.file.path;

      const user = await User.findByPk(userId);
      if (!user) {
        return next(new ApiError("User not found", 401));
      }
      if (user.image) {
        try {
          await fs.access(user.image);
          await fs.unlink(user.image);
        } catch (err) {
          console.error("Error deleting old image:", err);
        }
      }
      user.image = req.body.image;
      await user.save();
      res.status(201).json(user);
    } catch (err) {
      console.error("Error during login:", err);
      res.status(500).json({
        status: false,
        msg: "Server error",
      });
    }
  }

  async forgetPassword(req: userRequest, res: Response, next: NextFunction) {
    const email = req.body.email;
    try {
      const user = await User.findOne({
        where: { email },
      });
      if (!user) {
        return res.status(401).json({
          status: false,
          msg: "There is no account registered with this email",
        });
      }
      const randomBytes = crypto.randomBytes(3);
      const resetCode = randomBytes.toString("hex").toUpperCase();
      const expirationTimestamp = new Date();
      expirationTimestamp.setMinutes(expirationTimestamp.getMinutes() + 10);
      const userCodes = await User_Codes.findOne({
        where: { userId: user.id },
      });
      if (!userCodes) {
        await User_Codes.create({
          userId: user.id,
          resetPasswordCode: resetCode,
          resetPasswordCodeExpiresAt: expirationTimestamp,
        });
      } else {
        userCodes.resetPasswordCode = resetCode;
        userCodes.resetPasswordCodeExpiresAt = expirationTimestamp;
        userCodes.save();
      }
      const subject = `Password Reset - User Content Code`;
      const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #f4f4f4;
            padding: 10px;
            text-align: center;
        }
        .content {
            padding: 20px;
        }
        .footer {
            background-color: #f4f4f4;
            padding: 10px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Password Reset</h2>
        </div>
        <div class="content">
            <p>Dear ${user.name},</p>
            <p>You requested a password reset for your account. Here's your reset code:</p>
            <p><strong>Reset Code:</strong> ${resetCode}</p>
            <p>If you didn't request this reset, please disregard this message.</p>
            <p>If you need any assistance, feel free to contact our support team.</p>
        </div>
        <div class="footer">
            <p>Best regards,</p>
            <p>Kortobaa</p>
        </div>
    </div>
</body>
</html>
`;

      sendMail({ to: user.email, html, subject });
      res.status(200).json({
        status: true,
        msg: "Reset password code sent successfully",
      });
    } catch (error) {
      console.error("Error during forgetPassword:", error);
      res.status(500).json({
        status: false,
        msg: "Server error",
      });
    }
  }

  async verifyResetPasswordCode(req: userRequest, res: Response, next: NextFunction) {
    const resetCode = req.body.resetCode;
    try {
      const userCodes = await User_Codes.findOne({
        where: { resetPasswordCode: resetCode },
      });

      if (!userCodes) {
        return res.status(401).json({
          status: false,
          msg: "Invalid reset code",
        });
      }
      if (!userCodes.resetPasswordCodeExpiresAt) {
        return res.status(401).json({
          status: false,
          msg: "Reset code expiration information is missing",
        });
      }
      const currentTimestamp = new Date();
      if (currentTimestamp > userCodes.resetPasswordCodeExpiresAt) {
        return res.status(401).json({
          status: false,
          msg: "Reset code has expired",
        });
      }
      userCodes.resetPasswordCode = undefined;
      userCodes.resetPasswordCodeExpiresAt = undefined;
      userCodes.resetPasswordCodeVerified=true;
      await userCodes.save();

      res.status(200).json({
        status: true,
        msg: "Reset code verified successfully",
      });
    } catch (error) {
      console.error("Error during verifyResetPasswordCode:", error);
      res.status(500).json({
        status: false,
        msg: "Server error",
      });
    }
  }

  async resetPassword(req: userRequest, res: Response, next: NextFunction) {
    try {
      const email = req.body.email;
      const password = req.body.password;
      const user = await User.findOne({
        where: { email },
      });
      if (!user) {
        return res.status(401).json({
          status: false,
          msg: "There is no account registered with this email",
        });
      }
      const userCodes = await User_Codes.findOne({
        where: { userId: user.id },
      });
      if (!userCodes ||!userCodes.resetPasswordCodeVerified) {
        return res.status(401).json({
          status: false,
          msg: "Please re-send the code to the registered email and reset the password",
        });
      }

      userCodes.resetPasswordCodeVerified = false;
      await userCodes.save()

      user.password = await bcrypt.hash(password, 8);
      await user.save();
      
      res.status(200).json({
        status: true,
        message: "Password reset successfully",
      });

    } catch (err) {
      console.error("Error during verifyResetPasswordCode:", err);
      res.status(500).json({
        status: false,
        msg: "Server error",
      });
    }
  }
}

const authController = new Auth();
export default authController;
