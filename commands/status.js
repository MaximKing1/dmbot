const Discord = require('discord.js');
const Sequelize = require('sequelize');
const Pagination = require('discord-paginationembed');
const strings = require('../data/strings.js');
const { modelStringsBuff, modelStringsBufDsc } = require('../models.js');

module.exports = {
  aliases: strings.status,
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
      execute(message, '', language).then(success => {
        resolve(success);
      });
    });
  }
}

function execute(message, args, language) {
  return new Promise(resolve => {
    modelStringsBuff.findAll({
			where: {
				language: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(language)), 'LIKE', `%${args}%`)
			}
		}).then(stringsBuffs => {
      if (!stringsBuffs) {
        resolve(false);
        return;
      }

      if (stringsBuffs.length > 1) {
        let entries = [];
        for (const stringsBuff of stringsBuffs) {
          if (args == stringsBuff.get(language).toLowerCase()) {
            displayBuff(stringsBuff, message, language).then(success => {
              resolve(success);
            });
            break;
          }
          entries.push([entries.length + 1, stringsBuff.get(language)]);
        }

        if (stringsBuffs.length == entries.length) {
          let embeds = [];
          let elements = [];
          for (let i = 0; i < entries.length + 1; i++) {
            if ((i % 10 == 0 && i != 0) || i == entries.length) {
              const embed = new Discord.RichEmbed()
              .setColor('#f296fb')
              .attachFiles([`data/Sprite/info_icon.png`])
              .setAuthor(`${args.length == 0 ? strings.menu_status[language] : args.toUpperCase()} • ${strings.found[language]}: ${entries.length}`, 'attachment://info_icon.png')
              .setDescription(elements.join('\n'))
              .setFooter(`${entries.length > 10 ? strings.page_of[language].format(embeds.length + 1, Math.ceil(entries.length/10)) : ''} | 🔍•${strings.search_by_no[language]} |`);
              embeds.push(embed);
              elements = [];
            }

            if (i != entries.length) {
              elements.push(`${entries[i][0]} • ${entries[i][1]}`);
            }
          }

          displayEmbeds(message, language, embeds, entries).then(success => {
            resolve(success);
          });
        }
      } else if (stringsBuffs.length == 1) {
        displayBuff(stringsBuffs[0], message, language).then(success => {
          resolve(success);
        });
      }
    });
  });
}

function displayBuff(stringsBuff, message, language) {
  return new Promise(async resolve => {
    modelStringsBufDsc.findByPk(stringsBuff.get('string_id')).then(async (stringsBufDsc) => {
      let bufdsc = stringsBufDsc.get(language);

      await modelStringsBuff.findAll().then(stringsBuffData => {
        stringsBuffData.forEach(stringsBuff => {
          if(bufdsc.includes(`[B_${stringsBuff.get('string_id').substring(1).toUpperCase()}]`)) {
            let regex = new RegExp((`[B_${stringsBuff.get('string_id').substring(1).toUpperCase()}]`).replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g');
            bufdsc = bufdsc.replace(regex, `\`${stringsBuff.get(language)}\``);
          }
        });
      });

      const embed = new Discord.RichEmbed()
        .attachFiles([`data/Sprite/B_${stringsBuff.get('string_id').substring(1).toUpperCase()}.png`])
        .setColor('#f296fb')
        .setAuthor(stringsBuff.get(language), `attachment://B_${stringsBuff.get('string_id').substring(1).toUpperCase()}.png`, 'https://duma-eng.fandom.com/wiki/Status_Effects')
        .setDescription(`• ${bufdsc}`)

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

    resolve(true);
  });
}

function displayEmbeds(message, language, embeds, entries) {
  return new Promise(resolve => {
    const pagedEmbeds = new Pagination.Embeds()
    .setArray(embeds)
    .setAuthorizedUsers([message.author.id])
    .setChannel(message.channel)
    .setPageIndicator(false)
    .setDeleteOnTimeout(true);

  	message.reply({files: pagedEmbeds.currentEmbed.files}).then(replyMsg => {
      pagedEmbeds.setClientAssets({ message: replyMsg, prompt: strings.prompt_page[language] })
      .addFunctionEmoji('🔍', (user, instance) => {
        message.reply(strings.prompt_status[language]).then(msg => {
          const filter = m => m.author.id === message.author.id && (m.content >= 0 && m.content <= entries.length);
					message.channel.awaitMessages(filter, { maxMatches: 1, time: 30000, errors: ['time'] })
						.then(collected => {
              if (collected.first().content != 0) {
                execute(message, entries[Number(collected.first().content) - 1][1].toLowerCase(), language).then(success => {
                  if (success) {
                    replyMsg.delete();
                    msg.delete();
                    collected.first().delete();
                  }
                });
              } else {
                collected.first().delete();
                msg.delete();
              }
						});
				});
      }).build();

      resolve(true);
    });
  });
}
