const { MessageEmbed } = require('discord.js');
const { Command } = require('discord-akairo');
const Pagination = require('discord-paginationembed');
const { Op } = require('sequelize');

const aliases = {
    // "Kor": "몬스터",
    "Eng": "Monster",
    // "zhCN": "怪兽",
    // "zhTW": "怪獸",
    // "Jpn": "魔物"
};

class MonsterCommand extends Command {
    constructor() {
        super('monster', {
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
        let spriteUrl = this.client.cloudinary;
        let Monster = this.client.models.Monster;
        let lang = Object.keys(aliases).find(key => aliases[key].toLowerCase() == message.util.parsed.alias.toLowerCase());
        
        let result = await Monster.findAll({
            where: {
                name: {
                    [lang]: {
                        [Op.like]: args.searchString
                    }
                }
            }
        });

        if (result.length == 0) {
            result = await Monster.findAll({
                where: {
                    name: {
                        [lang]: {
                            [Op.substring]: args.searchString
                        }
                    }
                }
            });
        }

        if (result[0].name['Eng'] == 'Gargoyle Girl') {
            result = [result[0]];
        }

        if (result.length > 1) {
            let embeds = [];
            let items = [];
            await result.forEach((monster, i) => {
                items.push(`${i + 1} • ${monster.name[lang]}`);
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
            .setDeleteOnTimeout(true)
            .setTimeout(60000);

            message.reply('', { files: pagedEmbed.currentEmbed.files }).then(reply => {
                pagedEmbed.setClientAssets({ message: reply }).build();
                message.delete();
            });
        } else if (result.length == 1) {
            let monster = result[0];

            let icon = `${spriteUrl}${monster.data.Sprite}_icon.png`;
            let idle = `${spriteUrl}${monster.data.Sprite}_idle01.png`;
            let desc = [];
            desc.push(`<:card_hp:683194281447653432> ${monster.data.HPBase}`);
            desc.push(`<:card_st:683194281195733009> ${monster.data.AtkBase}`);
            desc.push(`<:card_df:683194281199927306> ${monster.data.DefBase}`);
            const embed0 = new MessageEmbed()
            .setColor('#f296fb')
            .setAuthor(monster.name[lang], icon)
            .setThumbnail(idle)
            .setDescription(`${monster.getGrade()}\n\n${desc.join('')}`);

            const embed1 = new MessageEmbed()
            .setColor('#f296fb')
            .setAuthor(monster.name[lang], icon)
            .setThumbnail(idle)
            let skillNames = [];
            for(let skill of await monster.getSkills()) {
                embed1.addField(`**${skill.getName(lang)}**`, `• ${skill.getDesc(lang)}`);
                skillNames.push(`• ${skill.getName(lang)}`);
            }
            embed0.addField('Skills', skillNames.join('\n'));

            const embed2 = new MessageEmbed()
            .setColor('#f296fb')
            .setAuthor(monster.name[lang], icon)
            .setThumbnail(idle)
            let keywordNames = [];
            for(let keyword of await monster.getKeywords()) {
                embed2.addField(`**${keyword.name[lang]}**`, `• ${keyword.getDesc(lang)}`);
                keywordNames.push(`• ${keyword.name[lang]}`);
            }
            embed0.addField('Keywords', `${keywordNames.join('\n')}`);

            const pagedEmbed = new Pagination.Embeds()
            .setArray([embed0, embed1, embed2])
            .setAuthorizedUsers([message.author.id])
            .setChannel(message.channel)
            .setPageIndicator(false)
            .setDeleteOnTimeout(true)
            .setTimeout(60000)
            .setDisabledNavigationEmojis(['JUMP'])
            .setFooter(' ')
            .addFunctionEmoji('📌', (user, instance) => {
                if (user == message.author) {
                    pagedEmbed.setDeleteOnTimeout(!pagedEmbed.deleteOnTimeout)
                    .setFooter(pagedEmbed.deleteOnTimeout ? ' ' : ' 📌');
                }
            });

            message.reply('•', { files: pagedEmbed.currentEmbed.files }).then(reply => {
                pagedEmbed.setClientAssets({ message: reply }).build();
                message.delete();
            });
        }
    }
}

module.exports = MonsterCommand;