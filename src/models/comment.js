'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Comment.init({
    articleId: {
      type: DataTypes.INTEGER,
      validate: {
          notEmpty: {
              msg: "投稿対象は必須です。"
          }
      },
      references: {
        model: 'Article',
        key: 'id'
      },
      onDelete: "CASCADE",
    },
    userId: {
      type: DataTypes.INTEGER,
      validate: {
          notEmpty: {
              msg: "利用者は必須です。"
          }
      }
    },
    body: {
      type: DataTypes.STRING,
      validate: {
          notEmpty: {
              msg: "コメント本文は必須です。"
          },
          len: {
              args: [1, 50],
              msg: "1〜50字以内で入力してください"
          }
      }
    },
  }, {
    sequelize,
    modelName: 'Comment',
  });
  Comment.associate = function(models) {
    Comment.belongsTo(models.Article, {foreignKey: 'articleId'});
    Comment.belongsTo(models.User, {foreignKey: 'userId'});

};

  return Comment;
};