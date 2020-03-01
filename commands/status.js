const { MessageEmbed } = require('discord.js');
const { Command } = require('discord-akairo');
const Pagination = require('discord-paginationembed');
const { Op } = require('sequelize');

const spriteUrl = 'https://res.cloudinary.com/hq0ppy0db/image/upload/v1571737090/Sprites/';
const aliases = {
    // "Kor": "스킬",
    "Eng": "Status",
    // "zhCN": "技能",
    // "zhTW": "技能",
    // "Jpn": "スキル"
};

class StatusCommand extends Command {
    constructor() {
        super('status', {
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
        let Status = this.client.models.Status;
        let lang = Object.keys(aliases).find(key => aliases[key].toLowerCase() == message.util.alias.toLowerCase());
        
        let result = await Status.findAll({
            where: {
                name: {
                    [lang]: {
                        [Op.like]: args.searchString
                    }
                }
            }
        });

        if (result.length == 0) {
            result = await Status.findAll({
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
            await result.forEach((status, i) => {
                items.push(`${i + 1}\t•\t${status.name[lang]}`);
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
            let status = result[0];

            const embed = new MessageEmbed()
            .setColor('#f296fb')
            .setAuthor(status.name[lang], `${spriteUrl}B_${status.id.substring(1).toUpperCase()}.png`)
            .setDescription(`• ${status.getDesc(lang)}`);

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

module.exports = StatusCommand;