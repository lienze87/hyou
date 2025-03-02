import { join } from "path";
import { Sequelize } from "sequelize";

const dbPath = join(__dirname, "./data/database.sqlite");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: process.env.NODE_ENV === "development" ? console.log : false,
});

sequelize.sync();
// sequelize.sync({ alter: true }); // 在原基础上更新
// sequelize.sync({ force: true }); // 删除再更新

export default sequelize;
