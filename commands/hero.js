const { MessageEmbed } = require('discord.js');
const { Command } = require('discord-akairo');
const Pagination = require('discord-paginationembed');
const { Op } = require('sequelize');

const spriteUrl = 'https://res.cloudinary.com/hq0ppy0db/image/upload/v1571737090/Sprites/';
const aliases = {
    // "Kor": "용사",
    "Eng": "Hero",
    // "zhCN": "勇士",
    // "zhTW": "勇士",
    // "Jpn": "勇士"
};

class HeroCommand extends Command {
    constructor() {
        super('hero', {
           aliases: Object.values(aliases),
           args: [
                {
                    id: 'searchString',
                    type: 'string',
                    match: 'text',
                    default: ''
                }, {
                    id: 'corrupt',
                    match: 'flag',
                    flag: '-c'
                }
            ]
        });
    }

    async exec(message, args) {
        let Hero = this.client.models.Hero;
        let lang = Object.keys(aliases).find(key => aliases[key].toLowerCase() == message.util.parsed.alias.toLowerCase());
        //console.log(args.corrupt);

        let result = await Hero.findAll({
            where: {
                name: {
                    [lang]: {
                        [Op.like]: args.searchString
                    }
                }
            }
        });

        if (result.length == 0) {
            result = await Hero.findAll({
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
            await result.forEach((hero, i) => {
                items.push(`${i + 1}\t•\t${hero.name[lang]}`);
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
            let hero = result[0];

            let icon = `${spriteUrl}${hero.data.Sprite}_icon.png`;
            let idle = `${spriteUrl}${hero.data.Sprite}_idle01.png`;
            const embed0 = new MessageEmbed()
            .setColor('#f296fb')
            .setAuthor(hero.name[lang], icon)
            .setThumbnail(idle);

            const embed1 = new MessageEmbed()
            .setColor('#f296fb')
            .setAuthor(hero.name[lang], icon)
            .setThumbnail(idle);
            let skillNames = [];
            for(let skill of await hero.getSkills()) {
                embed1.addField(`**${skill.getName(lang)}**`, `• ${skill.getDesc(lang)}`);
                skillNames.push(`• ${skill.getName(lang)}`);
            }
            embed0.addField('Skills', skillNames.join('\n'));

            let bestTools = [];
            for(let bestTool of await hero.getBestTool()) {
                bestTools.push(`${bestTool.name[lang]}`);
            }
            let niceTools = [];
            for(let niceTool of await hero.getNiceTool()) {
                niceTools.push(`${niceTool.name[lang]}`);
            }
            let desc = [];
            desc.push(`<:tl_6:683189304591122450> ${bestTools.length > 0 ? bestTools.join('') : 'None'}`);
            desc.push(`<:tl_5:683189304809619499> ${niceTools.join('')}`);
            embed0.setDescription(`${hero.getGrade()}\n\n${desc.join('\n')}`);

            const pagedEmbed = new Pagination.Embeds()
            .setArray([embed0, embed1])
            .setAuthorizedUsers([message.author.id])
            .setChannel(message.channel)
            .setPageIndicator(false)
            .setDeleteOnTimeout(true)
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
            });
        }
    }
}

module.exports = HeroCommand;