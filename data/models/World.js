module.exports = (sequelize, DataTypes) => {
	return sequelize.define('world', {
		world_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		value: DataTypes.FLOAT,
		buff: DataTypes.STRING,
		chance: DataTypes.INTEGER,
		reducenormal: DataTypes.BOOLEAN,
		lock: DataTypes.BOOLEAN,
	}, {
		freezeTableName: true,
		timestamps: false,
	});
};
