'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Article extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Article.init({
    userId: {
      type: DataTypes.INTEGER,
      validate: {
          notEmpty: {
              msg: "利用者は必須です。"
          }
      }
    },
    title: {
      type: DataTypes.STRING,
      validate: {
          notEmpty: {
              msg: "タイトルは必須です。"
          },
          len: {
              args: [1, 50],
              msg: "1〜50字以内で入力してください"
          }
      }
    },
    image: DataTypes.STRING,
    detail: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Article',
  });
  Article.associate = function(models) {
    Article.belongsToMany(models.User, {
        through: 'Like',
        as: 'LikedUser',
        foreignKey: 'articleId'
    });
    Article.belongsToMany(models.Tag, {
      through: 'ArticleTag',
      as: 'Tag',
      foreignKey: 'articleId'
    });
    Article.belongsTo(models.User);

};
  return Article;
};