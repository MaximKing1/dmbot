const { MessageEmbed } = require('discord.js');
const { Command } = require('discord-akairo');
const Pagination = require('discord-paginationembed');
const { Op } = require('sequelize');

const aliases = {
    // "Kor": "세계",
    "Eng": "Boss",
    // "zhCN": "世界",
    // "zhTW": "世界",
    // "Jpn": "世界"
};

class BossBattleCommand extends Command {
    constructor() {
        super('bossbattle', {
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
        let BossBattle = this.client.models.BossBattle;
        let lang = Object.keys(aliases).find(key => aliases[key].toLowerCase() == message.util.parsed.alias.toLowerCase());
        
        let result = await BossBattle.findAll({
            where: {
                data: {
                    Day: {
                        [Op.like]: args.searchString
                    }
                }
            }
        });

        if (result.length == 0) {
            result = await BossBattle.findAll({
                where: {
                    data: {
                        Day: {
                            [Op.substring]: args.searchString
                        }
                    }
                }
            });
        }

        if (result.length > 1) {
            // let embeds = [];
            // let items = [];
            // await result.forEach((bossbattle, i) => {
            //     items.push(`${i + 1} • ${bossbattle.name[lang]}`);
            //     if (items.length == 10 || i == result.length - 1) {
            //         embeds.push(new MessageEmbed()
            //         .setColor('#f296fb')
            //         .setAuthor(`${args.searchString.length == 0 ? aliases[lang] : args.searchString.toUpperCase()} • ${result.length}`, `${spriteUrl}info_icon.png`)
            //         .setDescription(items.join('\n')));
            //         items = [];
            //     }
            // });

            // const pagedEmbed = new Pagination.Embeds()
            // .setArray(embeds)
            // .setAuthorizedUsers([message.author.id])
            // .setChannel(message.channel)
            // .setPageIndicator(false)
            // .setDisabledNavigationEmojis(['JUMP'])
            // .setDeleteOnTimeout(true)
            // .setTimeout(60000);

            // message.reply('', { files: pagedEmbed.currentEmbed.files }).then(reply => {
            //     pagedEmbed.setClientAssets({ message: reply }).build();
            //     message.delete();
            // });
        } else if (result.length == 1) {
            let bossbattle = result[0];

            const embed = new MessageEmbed()
            .setColor('#f296fb')
            .setAuthor(`Boss Battle • D+${bossbattle.data.Day}`)
            .addField('Score', bossbattle.data.Score)
            .addField('Boss', bossbattle.data.Day);

            const embed1 = new MessageEmbed()
            .setColor('#f296fb')
            .setAuthor(`Boss Battle • D+${bossbattle.getBoss()}`)
            .addField('Hero', bossbattle.getHeroes().join('\n'));

            let blessings = [];
            for(let blessing of await bossbattle.getBlessings()) {
                blessings.push(`${blessing.desc[lang]}`);
            }
            const embed2 = new MessageEmbed()
            .setColor('#f296fb')
            .setAuthor(`Boss Battle • D+${bossbattle.data.Day}`)
            .addField('Goddess Blessing', blessings.join('\n'))

            const pagedEmbed = new Pagination.Embeds()
            .setArray([embed, embed1, embed2])
            .setAuthorizedUsers([message.author.id])
            .setChannel(message.channel)
            .setPageIndicator(false)
            .setDeleteOnTimeout(true)
            .setTimeout(60000)
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
                message.delete();
            });
        }
    }
}

module.exports = BossBattleCommand;