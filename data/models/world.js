const { Model } = require('sequelize');
const N = require('numeral');

class World extends Model {
    getDesc(lang = 'Eng') {
        let desc = this.desc[lang];
        desc = desc.replaceAll('[V1P]', N(this.data.Value).format('0 %'));

        return desc;
    }
}

module.exports = (sequelize, DataTypes) => {
    return World.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        name: DataTypes.JSON,
        desc: DataTypes.JSON,
        data: DataTypes.JSON
    }, {
        sequelize,
        modelName: 'World'
    });
}
