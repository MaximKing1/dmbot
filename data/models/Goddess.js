module.exports = (sequelize, DataTypes) => {
	return sequelize.define('goddess', {
		goddess_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		repeat: DataTypes.BOOLEAN,
		fixvalue: DataTypes.FLOAT,
		basevalue: DataTypes.FLOAT,
		growvalue: DataTypes.FLOAT,
	}, {
		freezeTableName: true,
		timestamps: false,
	});
};