import { DataTypes, Model } from "sequelize";

import sequelize from "../config/database";

class Blog extends Model {
  declare uuid: string;
  declare title: string;
  declare content: string;
  declare authorId: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Blog.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
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
        model: "Users",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Blog",
  },
);

export default Blog;
