const { Model } = require('sequelize');
const N = require('numeral');

class Skill extends Model {
    getName(lang = 'Eng') {
        return `${this.name[lang]} (${this.getGrade()})`;
    }

    getDesc(lang = 'Eng') {
        let desc = this.data.Type == 'eActive' ? '' : '(Passive) ';
        desc += this.desc[lang];
        desc = desc.replaceAll('[DMG]', `${this.data.Damage}(+${N(this.data.AtkFac).format('0.0')}ATK)`);
        desc = desc.replaceAll('[HEAL]', `${this.data.Heal}(+${N(this.data.AtkFac).format('0.0')}ATK)`);
        desc = desc.replaceAll('[VATK]', `${this.data.VATK}(=${N(this.data.VATK).format('0.0')}ATK)`);
        desc = desc.replaceAll('[V1]', this.data.Value01);
        desc = desc.replaceAll('[V1P]', N(this.data.Value01).format('0 %'));
        desc = desc.replaceAll('[V2]', this.data.Value02);
        desc = desc.replaceAll('[V2P]', N(this.data.Value02).format('0 %'));
        desc = desc.replaceAll('[REPEAT]', this.data.Repeat);
        desc = desc.replaceAll('[CHARGE]', this.data.Charge);

        if (!this.data.BuffID.includes('eNone')) {
            const strArray1 = this.data.BuffID.split('/');
            const strArray2 = this.data.BLvFac.split(',');
            let arrBuffKey = [strArray1.length];
            let arrBuffValue = [strArray1.length];
            let arrBuffAtkFac = [strArray1.length];
            for (let i = 0; i < strArray1.length; i++) {
                const strArray3 = strArray1[i].split(',');
                arrBuffKey[i] = strArray3[0];
                arrBuffValue[i] = strArray3[1];
                arrBuffAtkFac[i] = 0.0;
            }
            for (let i = 0; i < strArray2.length; i++) {
                arrBuffAtkFac[i] = strArray2[i];
            }

            for(let i = 0; i < arrBuffValue.length; i++) {
                desc = desc.replaceAll(`[BV${i != 0 ? i + 1 : ''}]`, arrBuffValue[i] + (arrBuffAtkFac[i] <= 0.0 ? '' : `(+${arrBuffAtkFac[i]}ATK)`));
            }
        }

        if(!this.data.StartBuffID.includes('eNone')) {
            const strArray1 = this.data.StartBuffID.split('/');
            const strArray2 = this.data.SBLvFac.split(',');
            let arrBuffKey = [strArray1.length];
            let arrBuffValue = [strArray1.length];
            let arrBuffAtkFac = [strArray1.length];
            for (let i = 0; i < strArray1.length; i++) {
                const strArray3 = strArray1[i].split(',');
                arrBuffKey[i] = strArray3[0];
                arrBuffValue[i] = strArray3[1];
                arrBuffAtkFac[i] = 0.0;
            }
            for (let i = 0; i < strArray2.length; i++) {
                arrBuffAtkFac[i] = strArray2[i];
            }

            for(let i = 0; i < arrBuffValue.length; i++) {
                desc = desc.replaceAll(`[SBV${i != 0 ? i + 1 : ''}]`, arrBuffValue[i] + (arrBuffAtkFac[i] <= 0.0 ? '' : `(+${arrBuffAtkFac[i]}ATK)`));
            }
        }

        return desc;
    }

    getGrade() {
        let grade;
        switch(this.data.Grade) {
            case 0:
                grade = 'D';
                break;
            case 1:
                grade = 'C';
                break;
            case 2:
                grade = 'B';
                break;
            case 3:
                grade = 'A';
                break;
            case 4:
                grade = 'S';
                break;
            case 5:
                grade = 'SS';
                break;
            default:
                grade = 'D';
        }
        return grade;
    }
}

module.exports = (sequelize, DataTypes) => {
    return Skill.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        name: DataTypes.JSON,
        desc: DataTypes.JSON,
        data: DataTypes.JSON
    }, {
        sequelize,
        modelName: 'Skill'
    });
}