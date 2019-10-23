module.exports = (sequelize, DataTypes) => {
	return sequelize.define('beyondts', {
		beyondts_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		percent: DataTypes.BOOLEAN,
		buff: DataTypes.STRING,
		value: DataTypes.FLOAT,
		max: DataTypes.INTEGER,
	}, {
		freezeTableName: true,
		timestamps: false,
	});
};