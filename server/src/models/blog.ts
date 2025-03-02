import { DataTypes, Model } from "sequelize";

import sequelize from "../config/database";

class Blog extends Model {
  declare id: number;
  declare title: string;
  declare content: string;
  declare authorId: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Blog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: "Blog",
  },
);

export default Blog;