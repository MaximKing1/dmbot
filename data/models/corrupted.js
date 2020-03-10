const { Model } = require('sequelize');
const N = require('numeral');

class Corrupted extends Model {
    getName(lang = 'Eng') {
        return `C. ${this.name[lang]}`;
    }

    getGrade() {
        let grade = [];
        if (this.data.Grade < 5) {
            for (let i = 0; i <= this.data.Grade; i ++) {
                grade.push('<:star_f01:683205939427541004>');
            }
        } else {
            for (let i = 5; i <= this.data.Grade; i ++) {
                grade.push('<:star_f02:683205939427672104>');
            }
        }
        return grade.join('');
    }
}

module.exports = (sequelize, DataTypes) => {
    return Corrupted.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        name: DataTypes.JSON,
        data: DataTypes.JSON
    }, {
        sequelize,
        modelName: 'Corrupted'
    });
}