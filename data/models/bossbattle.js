const { Model } = require('sequelize');
const N = require('numeral');

class BossBattle extends Model {
    getBoss(lang = 'Eng') {
        return this.data.Boss[lang];
    }

    getHeroes(lang = 'Eng') {
        let heroNames = [];

        for (let heroName of this.data.Heroes) {
            heroNames.push(`• ${heroName[lang]}`);
        }

        return heroNames;
    }

    async getGoddessBlessings(lang = 'Eng') {
        let blessings = [];

        for(let blessing of await this.getBlessings()) {
            let blessingDesc = blessing.desc[lang];
            let v1 = blessing.data.BaseValue + (blessing.data.GrowValue * Math.floor(this.id / 5));
            blessingDesc = blessingDesc.replaceAll('[V1]', Math.round(v1 * 100) / 100);
            blessingDesc = blessingDesc.replaceAll('[V1P]', N(v1).format('0 %'));

            blessings.push(`• ${blessingDesc}`);
        }

        return blessings;
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