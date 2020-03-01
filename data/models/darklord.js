const { Model } = require('sequelize');
const N = require('numeral');

class DarkLord extends Model {
}

module.exports = (sequelize, DataTypes) => {
    return DarkLord.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        name: DataTypes.JSON
    }, {
        sequelize,
        modelName: 'DarkLord'
    });
}