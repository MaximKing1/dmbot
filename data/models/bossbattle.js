const { Model } = require('sequelize');
const N = require('numeral');

class BossBattle extends Model {
    getBoss(lang = 'Eng') {
        return this.data.Boss[lang];
    }
    
    getHeroes(lang = 'Eng') {
        let heroNames = [];

        if (!this.data.Heroes) {
            for (let heroName of this.data.Heroes) {
                heroNames.push(`• ${heroName[lang]}`);
            }
        }

        return heroNames;
    }
}

module.exports = (sequelize, DataTypes) => {
    return BossBattle.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        data: DataTypes.JSON
    }, {
        sequelize,
        modelName: 'BossBattle'
    });
}