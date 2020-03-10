const { MessageEmbed } = require('discord.js');
const { Command } = require('discord-akairo');
const Pagination = require('discord-paginationembed');
const { Op } = require('sequelize');

const aliases = {
    // "Kor": "몬스터",
    "Eng": "DarkLord",
    // "zhCN": "怪兽",
    // "zhTW": "怪獸",
    // "Jpn": "魔物"
};

class DarkLordCommand extends Command {
    constructor() {
        super('darklord', {
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
        let DarkLord = this.client.models.DarkLord;
        let lang = Object.keys(aliases).find(key => aliases[key].toLowerCase() == message.util.parsed.alias.toLowerCase());
        
        let result = await DarkLord.findAll({
            where: {
                name: {
                    [lang]: {
                        [Op.like]: args.searchString
                    }
                }
            }
        });

        if (result.length == 0) {
            result = await DarkLord.findAll({
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
            await result.forEach((darklord, i) => {
                items.push(`${i + 1} • ${darklord.name[lang]}`);
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
            let darklord = result[0];

            let icon = `${spriteUrl}${darklord.data.Sprite}_icon.png`;
            let idle = `${spriteUrl}${darklord.data.Sprite}_idle01.png`;
            let desc = [];
            desc.push(`<:card_hp:683194281447653432> ${darklord.data.HPBase}`);
            desc.push(`<:card_st:683194281195733009> ${darklord.data.AtkBase}`);
            desc.push(`<:card_df:683194281199927306> ${darklord.data.DefBase}`);
            const embed0 = new MessageEmbed()
            .setColor('#f296fb')
            .setAuthor(darklord.name[lang], icon)
            .setThumbnail(idle)
            .setDescription(`${desc.join('')}`);

            const embed1 = new MessageEmbed()
            .setColor('#f296fb')
            .setAuthor(darklord.name[lang], icon)
            .setThumbnail(idle)
            let powerNames = [];
            for(let power of (await darklord.getPowers()).sort((a, b) => a.data.Cost - b.data.Cost)) {
                embed1.addField(`**${power.getName(lang)}**`, `• ${power.getDesc(lang)}`);
                powerNames.push(`• ${power.getName(lang)}`);
            }
            embed0.addField('Boss Skills', powerNames.join('\n'));

            const embed2 = new MessageEmbed()
            .setColor('#f296fb')
            .setAuthor(darklord.name[lang], icon)
            .setThumbnail(idle)
            let rebirthNames = [];
            for(let rebirth of (await darklord.getRebirths()).sort((a, b) => a.data.Lv - b.data.Lv)) {
                embed2.addField(`**${rebirth.getName(lang)}**`, `• ${rebirth.getDesc(lang)}`);
                rebirthNames.push(`• ${rebirth.getName(lang)}`);
            }
            embed0.addField('Rebirth', rebirthNames.join('\n'));

            const embed3 = new MessageEmbed()
            .setColor('#f296fb')
            .setAuthor(darklord.name[lang], icon)
            .setThumbnail(idle)
            let awakeningNames = [];
            for(let awakening of (await darklord.getAwakenings()).sort((a, b) => a.data.Lv - b.data.Lv)) {
                embed3.addField(`**${awakening.getName(lang)}**`, `• ${awakening.getDesc(lang)}`);
                awakeningNames.push(`• ${awakening.getName(lang)}`);
            }
            embed0.addField('Awakening', awakeningNames.join('\n'));

            const pagedEmbed = new Pagination.Embeds()
            .setArray([embed0, embed1, embed2, embed3])
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

module.exports = DarkLordCommand;