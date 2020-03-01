const { Model } = require('sequelize');
const N = require('numeral');

class Monster extends Model {
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
    return Monster.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        name: DataTypes.JSON,
        data: DataTypes.JSON
    }, {
        sequelize,
        modelName: 'Monster'
    });
}