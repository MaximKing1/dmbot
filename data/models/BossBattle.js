module.exports = (sequelize, DataTypes) => {
	return sequelize.define('boss_battle', {
		cnt: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		day: DataTypes.INTEGER,
		score: DataTypes.DOUBLE,
		boss: DataTypes.INTEGER,
		hero: DataTypes.STRING,
		goddesskeys: DataTypes.STRING,
	}, {
		freezeTableName: true,
		timestamps: false,
	});
};