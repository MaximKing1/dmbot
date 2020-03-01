const { Model } = require('sequelize');
const N = require('numeral');

class Status extends Model {
    getDesc(lang = 'Eng') {
        return this.desc[lang];
    }
}

module.exports = (sequelize, DataTypes) => {
    return Status.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        name: DataTypes.JSON,
        desc: DataTypes.JSON,
        data: DataTypes.JSON
    }, {
        sequelize,
        modelName: 'Status'
    });
}