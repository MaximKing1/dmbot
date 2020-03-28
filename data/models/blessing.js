const { Model } = require('sequelize');
const N = require('numeral');

class Blessing extends Model {
    getDesc(lang = 'Eng') {
        let desc = this.desc[lang];
        // desc = desc.replaceAll('[V1]', this.data.Value);
        // desc = desc.replaceAll('[V1P]', N(this.data.Value).format('0 %'));
        // desc = desc.replaceAll('[V2]', this.data.V2);
        // desc = desc.replaceAll('[V2P]', N(this.data.V2).format('0 %'));

        return desc;
    }
}

module.exports = (sequelize, DataTypes) => {
    return Blessing.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        desc: DataTypes.JSON,
        data: DataTypes.JSON
    }, {
        sequelize,
        modelName: 'Blessing'
    });
}