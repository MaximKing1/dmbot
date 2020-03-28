const { Model } = require('sequelize');
const N = require('numeral');

class Map extends Model {
    getEffects(lang = 'Eng') {
        let effects = [];

        for (let effect of this.data.Effects) {
            effects.push(`• ${effect[lang]}`);
        }

        return effects;
    }
}

module.exports = (sequelize, DataTypes) => {
    return Map.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        name: DataTypes.JSON,
        desc: DataTypes.JSON,
        data: DataTypes.JSON
    }, {
        sequelize,
        modelName: 'Map'
    });
}