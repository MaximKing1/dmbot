module.exports = (sequelize, DataTypes) => {
	return sequelize.define('difficult', {
		level: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		difftype: DataTypes.STRING,
		value: DataTypes.FLOAT,
		exp: DataTypes.FLOAT,
		last: DataTypes.BOOLEAN,
	}, {
		freezeTableName: true,
		timestamps: false,
	});
};