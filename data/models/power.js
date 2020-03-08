const { Model } = require('sequelize');
const N = require('numeral');

class Power extends Model {
    getName(lang = 'Eng') {
        return `${this.name[lang]} (${this.data.Cost})`;
    }

    getDesc(lang = 'Eng', fac = 10) {
        let desc = this.desc[lang];
        desc = desc.replaceAll('[DMG]', N(this.data.Dmg + (this.data.ATK * fac)).format('0'));
        desc = desc.replaceAll('[VATK]', `${N(this.data.VATK * fac).format('0')}(=${N(this.data.VATK).format('0.0')}ATK)`);
        desc = desc.replaceAll('[V1]', this.data.V1);
        desc = desc.replaceAll('[V1P]', N(this.data.V1).format('0 %'));
        desc = desc.replaceAll('[V2]', this.data.V2);
        desc = desc.replaceAll('[V2P]', N(this.data.V2).format('0 %'));
        desc = desc.replaceAll('[V3]', this.data.V3);
        desc = desc.replaceAll('[V3P]', N(this.data.V3).format('0 %'));

        if (!this.data.Buff.includes('eNone')) {
            const strArray1 = this.data.Buff.split('/');
            let arrBuffKey = [strArray1.length];
            let arrBuffValue = [strArray1.length];
            for (let i = 0; i < strArray1.length; i++) {
                const strArray2 = strArray1[i].split(',');
                arrBuffKey[i] = strArray2[0];
                arrBuffValue[i] = strArray2[1];
            }

            for(let i = 0; i < arrBuffValue.length; i++) {
                desc = desc.replaceAll(`[BV${i != 0 ? i + 1 : ''}]`, arrBuffValue[i]);
            }
        }

        return desc;
    }
}

module.exports = (sequelize, DataTypes) => {
    return Power.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        name: DataTypes.JSON,
        desc: DataTypes.JSON,
        data: DataTypes.JSON
    }, {
        sequelize,
        modelName: 'Power'
    });
}
