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
                    id: 'num',
                    type: /([0-9]+)d/i,
                    match: 'text'
                }, {
                    id: 'size',
                    type: /d([0-9]+)/i,
                    match: 'text',
                }, {
                    id: 'keep',
                    type: /k([0-9]+)/i,
                    match: 'text',
                }, {
                    id: 'add',
                    type: /\+([0-9]+)/i,
                    match: 'text',
                }, {
                    id: 'minus',
                    type: /\-([0-9]+)/i,
                    match: 'text',
                }, {
                    id: 'adv',
                    match: 'flag',
                    flag: 'adv'
                }, {
                    id: 'dis',
                    match: 'flag',
                    flag: 'dis'
                }, {
                    id: 'desc',
                    match: 'option',
                    flag: 'desc:'
                }
            ]
        });
    }

    async exec(message, args) {
        let num = args.num ? Number(args.num.match[1]) : 1;
        let size = args.size ? Number(args.size.match[1]) : 20;
        let keep = args.keep ? Number(args.keep.match[1]) : null;
        let add = args.add ? Number(args.add.match[1]) : null;
        let minus = args.minus ? Number(args.minus.match[1]) : null;

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

        let dice = roll(num, size, keep, add, minus, args.adv, args.dis);

        message.channel.send(`${message.author} 🎲\n${args.desc ? args.desc : `**Result**`}: ${num}d${size}${keep ? `k${keep}` : ''} (${dice.values.join(', ')})${add ? ` + ${add}` : ''}${minus ? ` - ${minus}` : ''}\n**Total:** ${dice.total}${args.adv ? '\nRolled with Advantage' : ''}${args.dis ? '\nRolled with Disdvantage' : ''}`);
    }
}

function roll(num = 1, size = 20, keep, add, minus, adv, dis) {
    var result;

    if (adv) {
        var r1 = chance.rpg(`${num}d${size}`);
        var r2 = chance.rpg(`${num}d${size}`);

        result = r1 > r2 ? r1 : r2;
    } else if (dis) {
        var r1 = chance.rpg(`${num}d${size}`);
        var r2 = chance.rpg(`${num}d${size}`);

        result = r1 < r2 ? r1 : r2;
    } else {
        result = chance.rpg(`${num}d${size}`);
    }

    var total = 0;
    var ores = [...result];
    if (keep) {
        var sorted = result.sort().reverse();
        for (var i = 0; i < keep; i++) {
            total += sorted[i];
        }
    } else {
        for (var i of result) {
            total += i;
        }
    }

    if (add) {
        total += add;
    }

    if (minus) {
        total -= minus;
    }

    return {
        values: ores,
        total: total
    };
}

module.exports = RollCommand;