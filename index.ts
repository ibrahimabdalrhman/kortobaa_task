import express from 'express';
import cors from 'cors';
import { config } from "dotenv";
import errorMiddleware from "./src/middlewares/errorMiddleware";

config()
const app = express();

import authRoute from "./src/routes/authRoute";
import productRoute from "./src/routes/productRoute";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));


app.use("/api/auth", authRoute);
app.use("/api/product", productRoute);

app.all("*", (req, res, next) => {
  res
    .status(404)
    .json({
      status: false,
      message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    });
});

app.use(errorMiddleware);

const port = process.env.PORT || 3000 ;
app.listen(port, () => console.log(`server is running on ${port}...`));