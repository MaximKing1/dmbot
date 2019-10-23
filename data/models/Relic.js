module.exports = (sequelize, DataTypes) => {
	return sequelize.define('relic', {
		relic_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		grade: DataTypes.INTEGER,
		value01: DataTypes.FLOAT,
		v1lv: DataTypes.FLOAT,
		value02: DataTypes.FLOAT,
		v2lv: DataTypes.FLOAT,
		special: DataTypes.STRING,
		lock: DataTypes.BOOLEAN,
		showdic: DataTypes.BOOLEAN,
		repeat: DataTypes.BOOLEAN,
		loop: DataTypes.BOOLEAN,
		event: DataTypes.BOOLEAN,
	}, {
		freezeTableName: true,
		timestamps: false,
	});
};
