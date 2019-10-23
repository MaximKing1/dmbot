module.exports = (sequelize, DataTypes) => {
	return sequelize.define('skill', {
		skill_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		grade: DataTypes.INTEGER,
		learn: DataTypes.BOOLEAN,
		learnhero: DataTypes.BOOLEAN,
		user: DataTypes.STRING,
		type: DataTypes.STRING,
		target: DataTypes.STRING,
		damage: DataTypes.FLOAT,
		atkfac: DataTypes.FLOAT,
		heal: DataTypes.FLOAT,
		vatk: DataTypes.FLOAT,
		value01: DataTypes.FLOAT,
		v1lvfac: DataTypes.FLOAT,
		value02: DataTypes.FLOAT,
		repeat: DataTypes.INTEGER,
		charge: DataTypes.INTEGER,
		buffid: DataTypes.STRING,
		blvfac: DataTypes.STRING,
		startbuffid: DataTypes.STRING,
		sblvfac: DataTypes.STRING,
		removebuff: DataTypes.STRING,
		immunebuff: DataTypes.STRING,
	}, {
		freezeTableName: true,
		timestamps: false,
	});
};