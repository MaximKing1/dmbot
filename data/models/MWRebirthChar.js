module.exports = (sequelize, DataTypes) => {
	return sequelize.define('mwrebirthchar', {
		mwrebirthchar_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		lv: DataTypes.INTEGER,
		mawang: DataTypes.STRING,
		value: DataTypes.FLOAT,
		v2: DataTypes.FLOAT,
	}, {
		freezeTableName: true,
		timestamps: false,
	});
};