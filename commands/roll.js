const { MessageEmbed } = require('discord.js');
const { Command } = require('discord-akairo');
const Pagination = require('discord-paginationembed');
var chance = require('chance').Chance();

class RollCommand extends Command {
    constructor() {
        super('roll', {
           aliases: ['roll', 'r'],
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
        let num = args.searchString.length > 0 ? args.searchString.split('d')[0] : 1;
        let size = args.searchString.length > 0 ? args.searchString.split('d')[1] : 20;

        if (num > 300 || size < 1) {
            message.channel.send(`${message.author} 🎲\nInvalid input: Too many dice rolled.`);
            return;
        }

        if (!size) {
            if (num) {
                size = num;
                num = 1;
            } else {
                message.channel.send(`${message.author} 🎲\nInvalid input: No dice found to roll.`);
                return;
            }
        }

        let dice = roll(num, size);

        message.channel.send(`${message.author} 🎲\n**Result:** ${num}d${size} (${dice.values.join(', ')})\n**Total:** ${dice.total}`);
    }
}

function roll(num, size) {
    var result = chance.rpg(`${num}d${size}`);
    var sum = 0;

    for (var i of result) {
        sum += i;
    }

    return {
        values: result,
        total: sum
    };
  }

module.exports = RollCommand;