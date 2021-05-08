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
    Article.belongsTo(models.User);
    Article.hasMany(models.Comment, {
      foreignKey: 'articleId',
      as: 'Comment',
    });

};
  return Article;
};