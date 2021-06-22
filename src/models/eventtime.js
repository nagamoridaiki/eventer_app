'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EventTime extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  EventTime.init({
    start: DataTypes.INTEGER,
    end: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'EventTime',
  });
  EventTime.associate = function(models) {
    EventTime.hasMany(models.Event, {
      foreignKey: 'EventTimeId',
      as: 'Event',
  });
  }
  return EventTime;
};