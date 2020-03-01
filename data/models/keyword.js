const { Model } = require('sequelize');
const N = require('numeral');

class Keyword extends Model {
    getDesc(lang = 'Eng') {
        return this.desc[lang];
    }

    getSubDesc(lang = 'Eng') {
        let subDescs = [];
        this.data.forEach(data => {
            let a = [];
            data.SubDesc.forEach(subDesc => {
                a.push(subDesc[lang]);
            });
            subDescs.push(a.join(', '));
        });
        return subDescs;
    }
}

module.exports = (sequelize, DataTypes) => {
    return Keyword.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        name: DataTypes.JSON,
        desc: DataTypes.JSON,
        data: DataTypes.JSON
    }, {
        sequelize,
        modelName: 'Keyword'
    });
}