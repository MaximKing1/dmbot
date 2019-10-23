module.exports = (sequelize, DataTypes) => {
	return sequelize.define('torture_effect', {
		torture_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		best: DataTypes.STRING,
		nice: DataTypes.STRING,
		normal: DataTypes.STRING,
		bad: DataTypes.STRING,
		fail: DataTypes.STRING,
		immune: DataTypes.STRING,
	}, {
		freezeTableName: true,
		timestamps: false,
	});
};