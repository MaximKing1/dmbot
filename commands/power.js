const { MessageEmbed } = require('discord.js');
const { Command } = require('discord-akairo');
const Pagination = require('discord-paginationembed');
const { Op } = require('sequelize');

const spriteUrl = 'https://res.cloudinary.com/hq0ppy0db/image/upload/v1571737090/Sprites/';
const aliases = {
    // "Kor": "세계",
    "Eng": "Power",
    // "zhCN": "世界",
    // "zhTW": "世界",
    // "Jpn": "世界"
};

class PowerCommand extends Command {
    constructor() {
        super('power', {
           aliases: Object.values(aliases),
           args: [
                {
                    id: 'searchString',
                    type: 'string',
                    match: 'text'
                }
            ]
        });
    }

    async exec(message, args) {
        let Power = this.client.models.Power;
        let lang = Object.keys(aliases).find(key => aliases[key].toLowerCase() == message.util.alias.toLowerCase());
        
        let result = await Power.findAll({
            where: {
                name: {
                    [lang]: {
                        [Op.like]: args.searchString
                    }
                }
            }
        });

        if (result.length == 0) {
            result = await Power.findAll({
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
            await result.forEach((power, i) => {
                items.push(`${i + 1}\t•\t${power.name[lang]}`);
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
            let power = result[0];

            const embed = new MessageEmbed()
            .setColor('#f296fb')
            .setAuthor(`${power.name[lang]} (${power.data.Cost})`, `${spriteUrl}${power.id}.png`)
            .setDescription(`• ${power.getDesc(lang)}`);

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

module.exports = PowerCommand;