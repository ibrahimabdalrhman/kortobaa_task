import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'mysql', 
  host:"127.0.0.1", 
  username:  process.env.DB_USER,
  password:  process.env.DB_PASS,
  database:  process.env.DB_NAME,
});

sequelize
  .sync()
  .then(() => {
    console.log("Database synchronized successfully");
  })
  .catch((error) => {
    console.error("Error synchronizing database:", error);
  });
  
export { sequelize };
