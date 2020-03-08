const { MessageEmbed } = require('discord.js');
const { Command } = require('discord-akairo');
const Pagination = require('discord-paginationembed');
const { Op } = require('sequelize');

const spriteUrl = process.env.CLOUDINARY_SPRITEURL;
const aliases = {
    // "Kor": "유물",
    "Eng": "Relic",
    // "zhCN": "神器",
    // "zhTW": "神器",
    // "Jpn": "遺物"
};

class RelicCommand extends Command {
    constructor() {
        super('relic', {
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
        let Relic = this.client.models.Relic;
        let lang = Object.keys(aliases).find(key => aliases[key].toLowerCase() == message.util.parsed.alias.toLowerCase());
        
        let result = await Relic.findAll({
            where: {
                name: {
                    [lang]: {
                        [Op.like]: args.searchString
                    }
                }
            }
        });

        if (result.length == 0) {
            result = await Relic.findAll({
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
            await result.forEach((relic, i) => {
                items.push(`${i + 1}\t•\t${relic.name[lang]}`);
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
            let relic = result[0];

            const embed = new MessageEmbed()
            .setColor('#f296fb')
            .setAuthor(relic.name[lang], `${spriteUrl}${relic.id}.png`)
            .setDescription(`• ${relic.getDesc(lang)}`);

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

module.exports = RelicCommand;