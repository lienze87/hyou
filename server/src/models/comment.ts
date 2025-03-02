import { DataTypes, Model } from "sequelize";

import sequelize from "../config/database";

class Comment extends Model {
  declare id: number;
  declare content: string;
  declare authorId: number;
  declare blogId: number;
  declare mentionedUserIds: string[];
  declare quotedCommentId: number | null;
  declare quotedContent: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    blogId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Blogs",
        key: "id",
      },
    },
    mentionedUserIds: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    quotedCommentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Comments",
        key: "id",
      },
    },
    quotedContent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Comment",
  },
);

export default Comment;
