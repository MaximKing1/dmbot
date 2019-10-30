const Discord = require('discord.js');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Pagination = require('discord-paginationembed');
const strings = require('../data/strings.js');
const { modelStringsUnit, modelStringsGoddess, modelStringsBuff, modelBossBattle, modelGoddess } = require('../models.js');

module.exports = {
  aliases: strings.boss,
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
    modelBossBattle.findOne({
			where: {
				day: args
			}
		}).then(bossBattle => {
      if (bossBattle) {
        displayBossBattle(bossBattle, message, language).then(success => {
          resolve(success);
        });
      } else {
        resolve(false);
        return;
      }
		});

    modelStringsUnit.findAll({
			where: {
				string_id: Sequelize.where(Sequelize.fn('length', Sequelize.col('string_id')), { [Op.not]: 4 }),
				language: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(language)), 'LIKE', `%${args}%`)
			}
		}).then(stringsUnits => {
      if (!stringsUnits) {
        resolve(false);
        return;
      }

      if (stringsUnits.length == 1) {
        modelBossBattle.findAll({
          where: {
						boss: Number(stringsUnits[0].get('string_id'))
					}
    		}).then(bossBattles => {
          if (!bossBattles) {
            resolve(false);
            return;
          }

          if (bossBattles.length > 1) {
            let entries = [];
            for (const bossBattle of bossBattles) {
              entries.push(bossBattle.get('day'));
            }

            let embeds = [];
            let elements = [];
            for (let i = 0; i < entries.length + 1; i++) {
              if ((i % 10 == 0 && i != 0) || i == entries.length) {
                const embed = new Discord.RichEmbed()
                .setColor('#f296fb')
                .attachFiles([`data/Sprite/info_icon.png`])
                .setAuthor(`${strings.boss_battle[language]} • ${strings.found[language]}: ${entries.length}`, 'attachment://info_icon.png')
                .setTitle(`${strings.boss1[language]}: ${stringsUnits[0].get(language)}`)
                .addField(strings.day[language], elements.join('\n'))
                .setFooter(`${entries.length > 10 ? strings.page_of[language].format(embeds.length + 1, Math.ceil(entries.length/10)) : ''} | 🔍•${strings.search_by_day[language]} |`);
                embeds.push(embed);
                elements = [];
              }

              if (i != entries.length) {
                elements.push(`• ${entries[i]}`);
              }
            }

            displayEmbeds(message, language, embeds, entries).then(success => {
              resolve(success);
            });
          } else if (bossBattles.length == 1) {
            displayBossBattle(bossBattles[0], message, language).then(success => {
              resolve(success);
            });
          }
        });
      }
    });

    modelStringsGoddess.findAll().then(async stringsGoddesses => {
			let blessings = [];

			for await (const stringsGoddess of stringsGoddesses) {
				let blessing = stringsGoddess.get(language);

				await modelStringsBuff.findAll().then(stringsBuffData => {
					stringsBuffData.forEach(stringsBuff => {
						if(blessing.includes(`[B_${stringsBuff.get('string_id').substring(1).toUpperCase()}]`)) {
							let regex = new RegExp((`[B_${stringsBuff.get('string_id').substring(1).toUpperCase()}]`).replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g');
							blessing = blessing.replace(regex, `${stringsBuff.get(language)}`);
						}
					});
				});

				blessing = blessing.replace('[V1]', '?');
				blessing = blessing.replace('[V1P]', '?%');

				blessings.push([stringsGoddess.get('string_id'), blessing]);
			}

			for (const blessing of blessings) {
				if (blessing[1].toLowerCase().includes(args.trim())) {
					modelBossBattle.findAll({
						where: {
							goddesskeys: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('goddesskeys')), 'LIKE', `%${blessing[0]}%`)
						}
					}).then(bossBattles => {
            if (!bossBattles) {
              resolve(false);
              return;
            }

            if (bossBattles.length > 1) {
              let entries = [];
              for (const bossBattle of bossBattles) {
                entries.push(bossBattle.get('day'));
              }

              let embeds = [];
              let elements = [];
              for (let i = 0; i < entries.length + 1; i++) {
                if ((i % 10 == 0 && i != 0) || i == entries.length) {
                  const embed = new Discord.RichEmbed()
                  .setColor('#f296fb')
                  .attachFiles([`data/Sprite/info_icon.png`])
                  .setAuthor(`${strings.boss_battle[language]} • ${strings.found[language]}: ${entries.length}`, 'attachment://info_icon.png')
                  .setTitle(`${strings.goddessblessing[language]}: ${blessing[1]}`)
                  .addField(strings.day[language], elements.join('\n'))
                  .setFooter(`${entries.length > 10 ? strings.page_of[language].format(embeds.length + 1, Math.ceil(entries.length/10)) : ''} | 🔍•${strings.search_by_day[language]} |`);
                  embeds.push(embed);
                  elements = [];
                }

                if (i != entries.length) {
                  elements.push(`• ${entries[i]}`);
                }
              }

              displayEmbeds(message, language, embeds, entries).then(success => {
                resolve(success);
              });
            } else if (bossBattles.length == 1) {
              displayBossBattle(bossBattles[0], message, language).then(success => {
                resolve(success);
              });
            }
          });
					break;
				}
			}
		});
  });
}

function displayBossBattle(bossBattle, message, language) {
  return new Promise(async resolve => {
    let boss = '';
  	await modelStringsUnit.findByPk(bossBattle.get('boss')).then(stringsUnit => {
  		boss = stringsUnit.get(language);
  	});

  	let heroes = [];
  	for (const hero of bossBattle.get('hero').split(',')) {
  		await modelStringsUnit.findByPk(hero).then(stringsUnit => {
  			heroes.push(stringsUnit.get(language));
  		});
  	}

  	let blessings = [];
  	for (const goddessKey of bossBattle.get('goddesskeys').split('/')) {
  		await modelStringsGoddess.findByPk(goddessKey).then(async (stringsGoddess) => {
  			let blessing = stringsGoddess.get(language);

        await modelStringsBuff.findAll().then(stringsBuffData => {
          stringsBuffData.forEach(stringsBuff => {
            if(blessing.includes(`[B_${stringsBuff.get('string_id').substring(1).toUpperCase()}]`)) {
              let regex = new RegExp((`[B_${stringsBuff.get('string_id').substring(1).toUpperCase()}]`).replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g');
              blessing = blessing.replace(regex, `\`${stringsBuff.get(language)}\``);
            }
          });
        });

  			await modelGoddess.findByPk(goddessKey).then(goddess => {
  				let v1 = goddess.get('basevalue') + (goddess.get('growvalue') * Math.floor(bossBattle.get('cnt') / 5));
  				blessing = blessing.replace('[V1]', Math.round(v1 * 100) / 100);
  				blessing = blessing.replace('[V1P]', Math.ceil(parseFloat(v1) * 100).toFixed(0) + ' %');

  				blessings.push(`• ${blessing}`);
  			});
  		});
  	}

    const embed = new Discord.RichEmbed()
		.attachFiles(['data/Sprite/Action_eBossBattle.png'])
		.setColor('#f296fb')
		.setAuthor(strings.boss_battle[language], 'attachment://Action_eBossBattle.png', 'https://duma-eng.fandom.com/wiki/Boss_Battles')
		.addField(strings.day[language], `• ${String(bossBattle.get('day')).replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, '$1,')}`, true)
		.addField(strings.score[language], `• ${String(bossBattle.get('score')).replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, '$1,')}`, true)
		.addField(strings.boss1[language], `• ${boss}`, true)
		.addField(strings.heroes[language], `• ${heroes.join(', ')}`)
		.addField(strings.goddessblessing[language], blessings.join('\n'));

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
    .setFooter(' ');

    message.reply({files: pagedEmbeds.currentEmbed.files}).then(replyMsg => {
      pagedEmbeds.setClientAssets({ message: replyMsg }).build();

      resolve(true);
    });
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
        message.reply(strings.prompt_boss[language]).then(msg => {
          const filter = m => m.author.id === message.author.id && (entries.includes(m.content) || m.content == 0);
					message.channel.awaitMessages(filter, { maxMatches: 1, time: 30000, errors: ['time'] })
						.then(collected => {
              if (collected.first().content != 0) {
                execute(message, collected.first().content, language).then(success => {
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
