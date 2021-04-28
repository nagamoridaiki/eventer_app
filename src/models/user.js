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
    };
    return User;
};