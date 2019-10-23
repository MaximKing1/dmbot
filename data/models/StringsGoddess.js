module.exports = (sequelize, DataTypes) => {
	return sequelize.define('strings_goddess', {
		string_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		kor: DataTypes.STRING,
		eng: DataTypes.STRING,
		zhcn: DataTypes.STRING,
		zhtw: DataTypes.STRING,
		jpn: DataTypes.STRING,
	}, {
		freezeTableName: true,
		timestamps: false,
	});
};