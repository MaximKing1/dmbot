const Sequelize = require('sequelize');

let e = {};
e.database = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASS, {
	dialect: 'sqlite',
	logging: false,
	storage: 'data/database.sqlite',
});
// # Database Models
e.Relic = e.database.import('data/models/relic');
e.World = e.database.import('data/models/world');
e.Status = e.database.import('data/models/status');
e.Skill = e.database.import('data/models/skill');
e.Power = e.database.import('data/models/power');
e.Rebirth = e.database.import('data/models/rebirth');
e.Awakening = e.database.import('data/models/awakening');
e.TortureTool = e.database.import('data/models/torturetool');
e.Keyword = e.database.import('data/models/keyword');
e.Monster = e.database.import('data/models/monster');
e.Hero = e.database.import('data/models/hero');
e.Corrupted = e.database.import('data/models/corrupted');
e.DarkLord = e.database.import('data/models/darklord');
e.Room = e.database.import('data/models/room');
e.Blessing = e.database.import('data/models/blessing');
e.BossBattle = e.database.import('data/models/bossbattle');

// # Associations
// Monster - Skill
e.Monster.belongsToMany(e.Skill, { through: 'MonsterSkills' });
e.Skill.belongsToMany(e.Monster, { through: 'MonsterSkills' });
// e.Monster - Keyword
e.Monster.belongsToMany(e.Keyword, { through: 'MonsterKeywords' });
e.Keyword.belongsToMany(e.Monster, { through: 'MonsterKeywords' });
// Hero - Skill
e.Hero.belongsToMany(e.Skill, { through: 'HeroSkills' });
e.Skill.belongsToMany(e.Hero, { through: 'HeroSkills' });
// Hero - TortureTool - Best
e.Hero.belongsToMany(e.TortureTool, { as: 'BestTool', through: 'HeroBestTools' });
e.TortureTool.belongsToMany(e.Hero, { as: 'BestHero', through: 'HeroBestTools' });
// Hero - TortureTool - Nice
e.Hero.belongsToMany(e.TortureTool, { as: 'NiceTool', through: 'HeroNiceTools' });
e.TortureTool.belongsToMany(e.Hero, { as: 'NiceHero', through: 'HeroNiceTools' });
// Hero - TortureTool - Normal
e.Hero.belongsToMany(e.TortureTool, { as: 'NormalTool', through: 'HeroNormalTools' });
e.TortureTool.belongsToMany(e.Hero, { as: 'NormalHero', through: 'HeroNormalTools' });
// Hero - TortureTool - Bad
e.Hero.belongsToMany(e.TortureTool, { as: 'BadTool', through: 'HeroBadTools' });
e.TortureTool.belongsToMany(e.Hero, { as: 'BadHero', through: 'HeroBadTools' });
// Hero - TortureTool - Fail
e.Hero.belongsToMany(e.TortureTool, { as: 'FailTool', through: 'HeroFailTools' });
e.TortureTool.belongsToMany(e.Hero, { as: 'FailHero', through: 'HeroFailTools' });
// Hero - TortureTool - Immune
e.Hero.belongsToMany(e.TortureTool, { as: 'ImmuneTool', through: 'HeroImmuneTools' });
e.TortureTool.belongsToMany(e.Hero, { as: 'ImmuneHero', through: 'HeroImmuneTools' });
// Corrupted - Skill
e.Corrupted.belongsToMany(e.Skill, { through: 'CorruptedSkills' });
e.Skill.belongsToMany(e.Corrupted, { through: 'CorruptedSkills' });
// Corrupted - Keyword
e.Corrupted.belongsToMany(e.Keyword, { through: 'CorruptedKeywords' });
e.Keyword.belongsToMany(e.Corrupted, { through: 'CorruptedKeywords' });
// DarkLord - Power
e.DarkLord.belongsToMany(e.Power, { through: 'DarkLordPowers' });
e.Power.belongsToMany(e.DarkLord, { through: 'DarkLordPowers' });
// DarkLord - Rebirth
e.DarkLord.belongsToMany(e.Rebirth, { through: 'DarkLordRebirths' });
e.Rebirth.belongsToMany(e.DarkLord, { through: 'DarkLordRebirths' });
// DarkLord - Awakening
e.DarkLord.belongsToMany(e.Awakening, { through: 'DarkLordAwakenings' });
e.Awakening.belongsToMany(e.DarkLord, { through: 'DarkLordAwakenings' });
// BossBattle - Blessings
e.BossBattle.belongsToMany(e.Blessing, { through: 'BossBattleBlessings' });
e.Blessing.belongsToMany(e.BossBattle, { through: 'BossBattleBlessings' });

module.exports = e;
