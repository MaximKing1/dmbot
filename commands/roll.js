const { MessageEmbed } = require('discord.js');
const { Command } = require('discord-akairo');
const Pagination = require('discord-paginationembed');
const { Op } = require('sequelize');

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

        let dice = await roll(num, size);

        message.channel.send(`${message.author} 🎲\n**Result:** ${num}d${size} (${dice[1].join(', ')})\n**Total:** ${dice[0]}`);
    }
}

function roll(num, size) {
    return new Promise(resolve => {
      let result = [];
      let total = 0;
  
      for (let i = 0; i < num; i++) {
        let rng = Math.floor(Math.random() * size) + 1;
        result.push(rng);
        total += rng;
      }
  
      resolve([total, result]);
    });
  }

module.exports = RollCommand;