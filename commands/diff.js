const Discord = require('discord.js');
const Sequelize = require('sequelize');
const Pagination = require('discord-paginationembed');
const strings = require('../data/strings.js');
const { modelStringsDiffDsc, modelDifficult } = require('../models.js');

module.exports = {
  aliases: strings.diff,
  async execute(message, args, language) {
    return new Promise(resolve => {
      if (args.length < 2) {
        resolve(false);
        return;
      }

      execute(message, args, language).then(success => {
        resolve(success);
      });
    });
  },
  async executeMenu(message, language) {
    return new Promise(resolve => {
      
    });
  }
}

function execute(message, args, language) {
  return new Promise(resolve => {
    const diff = new Discord.Collection();
    diff.set(`${strings.normal[language].toLowerCase()}`, [0, 'eNormal', `${strings.normal[language]}`, 1]);
    diff.set(`${strings.hard[language].toLowerCase()}`, [1, 'eHard', `${strings.hard[language]}`, 5]);
    diff.set(`${strings.trial[language].toLowerCase()}1`, [2, 'eOrdeal', `${strings.trial[language]} 1`, 5]);
    diff.set(`${strings.trial[language].toLowerCase()}2`, [3, 'eOrdeal', `${strings.trial[language]} 2`, 10]);
    diff.set(`${strings.legend[language].toLowerCase()}1`, [3, 'eLegend', `${strings.legend[language]} 1`, 5]);
    diff.set(`${strings.legend[language].toLowerCase()}2`, [3, 'eLegend', `${strings.legend[language]} 2`, 10]);
    diff.set(`${strings.myth[language].toLowerCase()}1`, [4, 'eMyth', `${strings.myth[language]} 1`, 4]);
    diff.set(`${strings.myth[language].toLowerCase()}2`, [4, 'eMyth', `${strings.myth[language]} 2`, 7]);
    diff.set(`${strings.myth[language].toLowerCase()}3`, [4, 'eMyth', `${strings.myth[language]} 3`, 10]);

    modelDifficult.findAll({
			where: {
				difftype: diff.get(args)[1]
			},
			order: [
				[ Sequelize.cast(Sequelize.col('level'), 'INTEGER') , 'ASC' ]
			]
		}).then(async (difficulties) => {
			if (!difficulties) return;

			let multiplier;
			let diffs = [];
			for (const difficulty of difficulties) {
				if (diff.get(args)[3] < difficulties.indexOf(difficulty) + 1) {
					continue;
				}

				await modelStringsDiffDsc.findByPk(difficulty.get('level')).then(stringsDiffDsc => {
					diffs.push(`**${difficulties.indexOf(difficulty) + 1}** • ${stringsDiffDsc.get(language)}`);
					multiplier = String(Math.round(difficulty.get('exp') * 100)).replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, '$1,');
				});
			}

			const embed = new Discord.RichEmbed()
				.attachFiles([`data/Sprite/level_${diff.get(args)[0]}.png`])
				.setColor('#f296fb')
				.setAuthor(`${diff.get(args)[2]} (${multiplier}%)`, '', 'https://duma-eng.fandom.com/wiki/Difficulty')
				.setURL('https://duma-eng.fandom.com/wiki/Difficulty')
				.setThumbnail(`attachment://level_${diff.get(args)[0]}.png`)
				.setDescription(diffs);

      const pagedEmbeds = new Pagination.Embeds()
      .setArray([embed])
      .setAuthorizedUsers([message.author.id])
      .setChannel(message.channel)
      .setPageIndicator(false)
      .setDeleteOnTimeout(true)
      .setDisabledNavigationEmojis(['BACK', 'JUMP', 'FORWARD'])
      .addFunctionEmoji('📌', (user, instance) => {
        pagedEmbeds.setDeleteOnTimeout(!pagedEmbeds.deleteOnTimeout)
        .setFooter(pagedEmbeds.deleteOnTimeout ? ' ' : ' 📌');
      })
      .setFooter(' ');;

      message.reply({files: pagedEmbeds.currentEmbed.files}).then(replyMsg => {
        pagedEmbeds.setClientAssets({ message: replyMsg }).build();
      });
		});
  });
}
