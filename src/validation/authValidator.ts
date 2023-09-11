import Joi from "joi";
import {User }  from "../models/user";

type SignUpType = {
  name: string;
  email: string;
  password: string;
  image?: string;
};

type LoginType = {
  email: string;
  password: string;
};

type forgetPasswordType = {
  email: string;
};

export const signupValidation = Joi.object<SignUpType>().keys({
  name: Joi.string().required(),
  email: Joi.string()
    .email()
    .external(async (value) => {
      const user = await User.findOne({
        where: { email: value }
      });
      console.log(user);
      
      if (user) {
        throw new Error("Email already exists");
      }
    })
    .required(),
  password: Joi.string().required()
});

export const loginValidation = Joi.object<LoginType>().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const forgetPasswordValidation = Joi.object<forgetPasswordType>().keys({
  email: Joi.string().email().required(),
});
