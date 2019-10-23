module.exports = (sequelize, DataTypes) => {
	return sequelize.define('power', {
		power_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		replace: DataTypes.STRING,
		minlv: DataTypes.INTEGER,
		type: DataTypes.STRING,
		cost: DataTypes.INTEGER,
		dmg: DataTypes.FLOAT,
		atk: DataTypes.FLOAT,
		vatk: DataTypes.FLOAT,
		v1: DataTypes.FLOAT,
		v2: DataTypes.FLOAT,
		v3: DataTypes.FLOAT,
		buff: DataTypes.STRING,
		sound: DataTypes.STRING,
		effect: DataTypes.STRING,
		user: DataTypes.INTEGER,
	}, {
		freezeTableName: true,
		timestamps: false,
	});
};