import Blog from "./blog";
import Comment from "./comment";
import User from "./user";

// 设置 Blog 的关联关系
Blog.hasMany(Comment, {
  foreignKey: 'blogId',
  as: 'comments',
});

Blog.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author',
});

// 设置 Comment 的关联关系
Comment.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author',
});

Comment.belongsTo(Blog, {
  foreignKey: 'blogId',
  as: 'blog',
});

Comment.belongsTo(Comment, {
  foreignKey: 'quotedCommentId',
  as: 'quotedComment',
});