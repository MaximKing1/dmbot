module.exports = (sequelize, DataTypes) => {
	return sequelize.define('torture_tool', {
		tool_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		basic: DataTypes.BOOLEAN,
		day: DataTypes.INTEGER,
		value: DataTypes.FLOAT,
	}, {
		freezeTableName: true,
		timestamps: false,
	});
};