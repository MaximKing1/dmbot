const { Model } = require('sequelize');
const N = require('numeral');

class Relic extends Model {
    getDesc(lang = 'Eng') {
        let desc = this.desc[lang];
        desc = desc.replaceAll('[V1]', this.data.Value01);
        desc = desc.replaceAll('[V1P]', N(this.data.Value01).format('0 %'));
        desc = desc.replaceAll('[V2]', this.data.Value02);
        desc = desc.replaceAll('[V2P]', N(this.data.Value02).format('0 %'));
        desc = desc.replaceAll('[MANACRYSTAL]', 'Mana Crystal');
        desc = desc.replaceAll('[EMPTY_MANACRYSTAL]', 'Empty Mana Crystal');

        return desc;
    }
}

module.exports = (sequelize, DataTypes) => {
    return Relic.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        name: DataTypes.JSON,
        desc: DataTypes.JSON,
        data: DataTypes.JSON
    }, {
        sequelize,
        modelName: 'Relic'
    });
}
