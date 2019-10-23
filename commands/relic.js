const Discord = require('discord.js');
const Sequelize = require('sequelize');
const Pagination = require('discord-paginationembed');
const strings = require('../data/strings.js');
const { modelStringsRelic, modelStringsRlcDsc, modelStringsBuff, modelStringsPower, modelRelic } = require('../models.js');

module.exports = {
  aliases: strings.relic,
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
    modelStringsRelic.findAll({
			where: {
				language: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(language)), 'LIKE', `%${args}%`)
			}
		}).then(stringsRelics => {
      if (!stringsRelics) {
        resolve(false);
        return;
      }

      if (stringsRelics.length > 1) {
        let entries = [];
        for (const stringsRelic of stringsRelics) {
          if (args == stringsRelic.get(language).toLowerCase()) {
            displayRelic(stringsRelic, message, language).then(success => {
              resolve(success);
            });
            break;
          }
          entries.push([entries.length + 1, stringsRelic.get(language)]);
        }

        if (stringsRelics.length == entries.length) {
          let embeds = [];
          let elements = [];
          for (let i = 0; i < entries.length + 1; i++) {
            if ((i % 10 == 0 && i != 0) || i == entries.length) {
              const embed = new Discord.RichEmbed()
              .setColor('#f296fb')
              .attachFiles([`data/Sprite/info_icon.png`])
              .setAuthor(`${args.length == 0 ? strings.menu_relic[language] : args.toUpperCase()} • ${strings.found[language]}: ${entries.length}`, 'attachment://info_icon.png')
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
      } else if (stringsRelics.length == 1) {
        displayRelic(stringsRelics[0], message, language).then(success => {
          resolve(success);
        });
      }
    });
  });
}

function displayRelic(stringsRelic, message, language) {
  return new Promise(async resolve => {
    modelStringsRlcDsc.findByPk(stringsRelic.get('string_id')).then(async (stringsRlcDsc) => {
  		let rlcdsc = stringsRlcDsc.get(language);

  		await modelRelic.findByPk(stringsRelic.get('string_id')).then(async (relic) => {
  			const value01 = relic.get('value01');
  			const value02 = relic.get('value02');
  			const v1lv = `${relic.get('v1lv')}`.includes('.') ? `${relic.get('v1lv')}` : `${relic.get('v1lv')}.0`;
  			const v2lv = `${relic.get('v2lv')}`.includes('.') ? `${relic.get('v2lv')}` : `${relic.get('v2lv')}.0`;

  			rlcdsc = rlcdsc.replace('[V1]', v1lv == 0 ? value01 : `${value01}${strings.addedperlvl[language].format(v1lv)}`);
  			rlcdsc = rlcdsc.replace('[V1P]', `${(value01 * 100).toFixed(0)} %`);
  			rlcdsc = rlcdsc.replace('[V2]', v2lv == 0 ? value02 : `${value02}${strings.addedperlvl[language].format(v1lv)}`);
  			rlcdsc = rlcdsc.replace('[V2P]', `${(value02 * 100).toFixed(0)} %`);

        await modelStringsBuff.findAll().then(stringsBuffData => {
          stringsBuffData.forEach(stringsBuff => {
            if(rlcdsc.includes(`[B_${stringsBuff.get('string_id').substring(1).toUpperCase()}]`)) {
              let regex = new RegExp((`[B_${stringsBuff.get('string_id').substring(1).toUpperCase()}]`).replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g');
              rlcdsc = rlcdsc.replace(regex, `\`${stringsBuff.get(language)}\``);
            }
          });
        });

  			await modelStringsPower.findAll().then(stringsPowerData => {
  				stringsPowerData.forEach(stringsPower => {
  					if(rlcdsc.includes(`[P_${stringsPower.get('string_id').substring(1).toUpperCase()}]`)) {
  						let regex = new RegExp((`[P_${stringsPower.get('string_id').substring(1).toUpperCase()}]`).replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g');
  						rlcdsc = rlcdsc.replace(regex, `"Boss Skill : ${stringsPower.get(language)}""`);
  					}
  				});
  			});
  		});

  		const embed = new Discord.RichEmbed()
      .attachFiles([`data/Sprite/${stringsRelic.get('string_id')}.png`])
      .setColor('#f296fb')
      .setAuthor(stringsRelic.get(language), `attachment://${stringsRelic.get('string_id')}.png`, `https://duma-eng.fandom.com/wiki/${stringsRelic.get('eng').replace(/ /g, '_')}`)
      .setDescription(`• ${rlcdsc}`)

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
        message.reply(strings.prompt_relic[language]).then(msg => {
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

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}
