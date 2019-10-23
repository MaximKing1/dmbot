const strings = require('../data/strings.js');

module.exports = {
  aliases: strings.roll,
  async execute(message, args, language) {
    return new Promise(resolve => {
      execute(message, args, language).then(success => {
        resolve(success);
      });
    });
  }
}

function execute(message, args, language) {
  return new Promise(async resolve => {
    let num = args.length > 0 ? args.split('d')[0] : 1;
    let size = args.length > 0 ? args.split('d')[1] : 20;

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

    await message.channel.send(`${message.author} 🎲\n**Result:** ${num}d${size} (${dice[1].join(', ')})\n**Total:** ${dice[0]}`);
    message.delete();
  });
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
