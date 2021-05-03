'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Like.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
          model: 'User',
          key: 'id'
      }
    },
    articleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
          model: 'Article',
          key: 'id'
      }
  }
  }, {
    sequelize,
    modelName: 'Like',
  });
  return Like;
};