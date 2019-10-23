module.exports = (sequelize, DataTypes) => {
	return sequelize.define('mawang', {
		mawang_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		monid: DataTypes.DOUBLE,
		power: DataTypes.STRING,
		defskin: DataTypes.STRING,
		avbskin: DataTypes.STRING,
		previewskin: DataTypes.STRING,
		saleskin: DataTypes.STRING,
		nonesaleskin: DataTypes.STRING,
		beyondts: DataTypes.STRING,
	}, {
		freezeTableName: true,
		timestamps: false,
	});
};