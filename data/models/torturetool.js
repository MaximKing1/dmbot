const { Model } = require('sequelize');
const N = require('numeral');

class TortureTool extends Model {
}

module.exports = (sequelize, DataTypes) => {
    return TortureTool.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        name: DataTypes.JSON,
        desc: DataTypes.JSON,
        data: DataTypes.JSON
    }, {
        sequelize,
        modelName: 'TortureTool'
    });
}
