'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    User.init({
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        image: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'User',
    });
    User.associate = function(models) {
        User.belongsToMany(models.Event, {
            through: 'Join',
            as: 'Event',
            foreignKey: 'userId'
        });
        User.belongsToMany(models.Event, {
            through: 'Favorite',
            as: 'FavoriteEvent',
            foreignKey: 'userId'
        });
        User.belongsToMany(models.Article, {
            through: 'Like',
            as: 'ArticleLikes',
            foreignKey: 'userId'
        });
        User.hasMany(models.Article);
        User.hasMany(models.Comment, {
            foreignKey: 'userId',
            as: 'Comment',
        });
        User.belongsToMany(models.User, {
            through: 'Follow',
            as: 'follower',
            foreignKey: 'follower'
        });
        User.belongsToMany(models.User, {
            through: 'Follow',
            as: 'followee',
            foreignKey: 'followee'
        });
      
    };
    return User;
};