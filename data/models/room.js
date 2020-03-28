const { Model } = require('sequelize');
const N = require('numeral');

class Room extends Model {
    getDesc(lang = 'Eng', level, upgrade) {
        let desc = this.desc[lang];
        desc = desc.replaceAll('[DMG]', `1~${N(getValue(this.data.Damage, this.data.DmgUp, level, upgrade)).format('0')}`);
        desc = desc.replaceAll('[V1]', N(getValue(this.data.Value1, this.data.Grow1, level, upgrade)).format('0'));
        desc = desc.replaceAll('[V1P]', N(getValue(this.data.Value1, this.data.Grow1, level, upgrade)).format('0 %'));
        desc = desc.replaceAll('[V2]', N(getValue(this.data.Value2, this.data.Grow1, level, upgrade)).format('0'));
        desc = desc.replaceAll('[V2P]', N(getValue(this.data.Value2, this.data.Grow1, level, upgrade)).format('0 %'));
        desc = desc.replaceAll('[MAX_SOUL]', N(getValue(this.data.Value2, this.data.Grow1, level, upgrade)).format('0'));

        if(!this.data.BuffBase.includes('eNone')) {
            const strArray1 = this.data.BuffBase.split('/');
            let arrBuffKey = [strArray1.length];
            let arrBuffValue = [strArray1.length];
            for (let i = 0; i < strArray1.length; i++) {
                const strArray2 = strArray1[i].split(',');
                arrBuffKey[i] = strArray2[0];
                arrBuffValue[i] = strArray2[1];
                // if (arrBuffKey[i] == 'eSlow' && arrBuffValue[i] > 0 && this.data.Type == 'eTrap') {
                //     const slowTrap = true;
                // } else if (arrBuffKey[i] == 'ePoison' && arrBuffValue[i] > 0 && this.data.Type == 'eTrap') {
                //     const slowPoison = true;
                // }
            }

            let arrBuffGrow = [arrBuffKey.length];
            if (this.data.BuffUpg != '0') {
                const strArray = this.data.BuffUpg.split(',');
                for (let i = 0; i < strArray.length; i++) {
                    arrBuffGrow[i] = strArray[i];
                }
            }

            for (let i = 0; i < arrBuffValue.length; i++) {
                desc = desc.replaceAll(`[BV${i != 0 ? i + 1 : ''}]`, arrBuffValue[i]);
            }
        }

        return desc;
    }

    getRecipes(lang = 'Eng') {
        let recipes = [];

        for (let recipe of this.data.Recipe) {
            recipes.push(`• ${recipe[lang]}`);
        }

        return recipes;
    }
}

function getValue(base, grow, level = 1, upgrade) {
    if(upgrade > 0) level++;
    let result = base + grow * level;
    return upgrade ? result * (1 + getUpgradeValue(upgrade)) : result;
}

function getUpgradeValue(upgrade) {
    return (upgrade <= 10 ? upgrade : 10) * 0.04;
}

module.exports = (sequelize, DataTypes) => {
    return Room.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        name: DataTypes.JSON,
        desc: DataTypes.JSON,
        data: DataTypes.JSON
    }, {
        sequelize,
        modelName: 'Room'
    });
}
