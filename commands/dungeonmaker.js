const { MessageEmbed } = require('discord.js');
const { Command } = require('discord-akairo');
const Pagination = require('discord-paginationembed');
var chance = require('chance').Chance();

class DungeonMakerCommand extends Command {
    constructor() {
        super('dungeonmaker', {
           aliases: ['dungeonmaker', 'dm', 'help'],
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
        let commands = [];
        commands.push('!boss *<day>*');
        commands.push('!darklord *<name>*');
        commands.push('!hero *<name>*');
        commands.push('!hero -c *<name>* (Shows corrupted hero info)');
        commands.push('!keyword *<name>*');
        commands.push('!monster *<name>*');
        commands.push('!power *<name>*');
        commands.push('!relic *<name>*');
        commands.push('!room *<name>*');
        commands.push('!skill *<name>*');
        commands.push('!status *<name>*');
        commands.push('!world *<name>*');

        const embed = new MessageEmbed()
        .setColor('#f296fb')
        .setAuthor('Dungeon Maker')
        .setDescription(commands.join('\n'));

        const pagedEmbed = new Pagination.Embeds()
        .setArray([embed])
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
    }
}

module.exports = DungeonMakerCommand;