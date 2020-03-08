const { MessageEmbed } = require('discord.js');
const { Command } = require('discord-akairo');
const Pagination = require('discord-paginationembed');
const { Op } = require('sequelize');

const spriteUrl = 'https://res.cloudinary.com/hq0ppy0db/image/upload/v1571737090/Sprites/';
const aliases = {
    // "Kor": "스킬",
    "Eng": "Skill",
    // "zhCN": "技能",
    // "zhTW": "技能",
    // "Jpn": "スキル"
};

class SkillCommand extends Command {
    constructor() {
        super('skill', {
           aliases: Object.values(aliases),
           args: [
                {
                    id: 'searchString',
                    type: 'string',
                    match: 'text',
                    default: ''
                }
            ]
        });
    }

    async exec(message, args) {
        let Skill = this.client.models.Skill;
        let lang = Object.keys(aliases).find(key => aliases[key].toLowerCase() == message.util.parsed.alias.toLowerCase());
        
        let result = await Skill.findAll({
            where: {
                name: {
                    [lang]: {
                        [Op.like]: args.searchString
                    }
                }
            }
        });

        if (result.length == 0) {
            result = await Skill.findAll({
                where: {
                    name: {
                        [lang]: {
                            [Op.substring]: args.searchString
                        }
                    }
                }
            });
        }

        if (result.length > 1) {
            let embeds = [];
            let items = [];
            await result.forEach((skill, i) => {
                items.push(`${i + 1}\t•\t${skill.name[lang]}`);
                if (items.length == 10 || i == result.length - 1) {
                    embeds.push(new MessageEmbed()
                    .setColor('#f296fb')
                    .setAuthor(`${args.searchString.length == 0 ? aliases[lang] : args.searchString.toUpperCase()} • ${result.length}`, `${spriteUrl}info_icon.png`)
                    .setDescription(items.join('\n')));
                    items = [];
                }
            });

            const pagedEmbed = new Pagination.Embeds()
            .setArray(embeds)
            .setAuthorizedUsers([message.author.id])
            .setChannel(message.channel)
            .setPageIndicator(false)
            .setDisabledNavigationEmojis(['JUMP'])
            .setDeleteOnTimeout(true);

            message.reply('', { files: pagedEmbed.currentEmbed.files }).then(reply => {
                pagedEmbed.setClientAssets({ message: reply }).build();
            });
        } else if (result.length == 1) {
            let skill = result[0];

            const embed = new MessageEmbed()
            .setColor('#f296fb')
            .setAuthor(skill.getName(lang), `${spriteUrl}CardSkill.png`)
            .setDescription(`• ${skill.getDesc(lang)}`);

            const pagedEmbed = new Pagination.Embeds()
            .setArray([embed])
            .setAuthorizedUsers([message.author.id])
            .setChannel(message.channel)
            .setPageIndicator(false)
            .setDeleteOnTimeout(true)
            .setDisabledNavigationEmojis(['BACK', 'JUMP', 'FORWARD'])
            .setFooter(' ')
            .addFunctionEmoji('📌', (user, instance) => {
                if (user == message.author) {
                    pagedEmbed.setDeleteOnTimeout(!pagedEmbed.deleteOnTimeout)
                    .setFooter(pagedEmbed.deleteOnTimeout ? ' ' : ' 📌');
                }
            });

            message.reply('•', { files: pagedEmbed.currentEmbed.files }).then(reply => {
                pagedEmbed.setClientAssets({ message: reply }).build();
            });
        }
    }
}

module.exports = SkillCommand;