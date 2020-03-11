const { MessageEmbed } = require('discord.js');
const { Command } = require('discord-akairo');
const Pagination = require('discord-paginationembed');
const { Op } = require('sequelize');

const aliases = {
    // "Kor": "키워드",
    "Eng": "Keyword",
    // "zhCN": "关键词",
    // "zhTW": "關鍵字",
    // "Jpn": "キーワード"
};

class KeywordCommand extends Command {
    constructor() {
        super('keyword', {
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
        let Keyword = this.client.models.Keyword;
        let lang = Object.keys(aliases).find(key => aliases[key].toLowerCase() == message.util.parsed.alias.toLowerCase());
        
        let result = await Keyword.findAll({
            where: {
                name: {
                    [lang]: {
                        [Op.like]: args.searchString
                    }
                }
            }
        });

        if (result.length == 0) {
            result = await Keyword.findAll({
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
            await result.forEach((keyword, i) => {
                items.push(`${i + 1} • ${keyword.name[lang]}`);
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
            let keyword = result[0];

            let subDesc = [];
            keyword.data.forEach((data, i) => {
                subDesc.push(`${data.Stack} • ${keyword.getSubDesc(lang)[i]}`);
            });

            const embed = new MessageEmbed()
            .setColor('#f296fb')
            .setAuthor(keyword.name[lang], `${spriteUrl}${keyword.id}_0.png`)
            .setDescription(`• ${keyword.getDesc(lang)}`)
            .addField('Stack', subDesc.join('\n'));

            const pagedEmbed = new Pagination.Embeds()
            .setArray([embed])
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

module.exports = KeywordCommand;