const { MessageEmbed } = require('discord.js');
const { Command } = require('discord-akairo');
const Pagination = require('discord-paginationembed');
const { Op } = require('sequelize');

const aliases = {
    // "Kor": "세계",
    "Eng": "Room",
    // "zhCN": "世界",
    // "zhTW": "世界",
    // "Jpn": "世界"
};

class RoomCommand extends Command {
    constructor() {
        super('room', {
           aliases: Object.values(aliases),
           args: [
                {
                    id: 'searchString',
                    type: 'string',
                    match: 'text',
                    default: ''
                },
                {
                    id: 'level',
                    match: 'option',
                    prefix: ['lvl:', 'l:'],
                    typee: 'number',
                    default: 1
                },
                {
                    id: 'upgrade',
                    match: 'option',
                    prefix: ['upg:', 'u:'],
                    typee: 'number',
                    default: 0
                }
            ]
        });
    }

    async exec(message, args) {
        let spriteUrl = this.client.cloudinary;
        let Room = this.client.models.Room;
        let lang = Object.keys(aliases).find(key => aliases[key].toLowerCase() == message.util.parsed.alias.toLowerCase());
        
        let result = await Room.findAll({
            where: {
                name: {
                    [lang]: {
                        [Op.like]: args.searchString
                    }
                }
            }
        });

        if (result.length == 0) {
            result = await Room.findAll({
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
            await result.forEach((room, i) => {
                items.push(`${i + 1} • ${room.name[lang]}`);
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
            let room = result[0];

            const embed = new MessageEmbed()
            .setColor('#f296fb')
            .setAuthor(room.name[lang], `${spriteUrl}CardRoom.png`)
            .setThumbnail(`${spriteUrl}${room.id}.png`)
            .setDescription(`• ${room.getDesc(lang, args.level, args.upgrade)}`);
            if (room.getRecipes().length > 0) {
                embed.addField('Recipe', room.getRecipes().join('\n'));
            }
            

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

module.exports = RoomCommand;