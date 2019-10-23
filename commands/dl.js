const Discord = require('discord.js');
const Sequelize = require('sequelize');
const Pagination = require('discord-paginationembed');
const strings = require('../data/strings.js');
const { modelStringsUnit, modelStringsPower, modelStringsPwrDsc, modelStringsBuff, modelStringsMwRC, modelStringsMwRCDsc, modelStringsBeyondTS, modelStringsBeyondTSDsc, modelMawang, modelPower, modelUnit, modelMWRebirthChar, modelBeyondTS } = require('../models.js');

module.exports = {
  aliases: strings.dl,
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
    modelStringsUnit.findAll({
      where: {
        string_id: Sequelize.where(Sequelize.fn('length', Sequelize.col('string_id')), 4),
        language: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(language)), 'LIKE', `%${args}%`)
      },
      order: [
				[ Sequelize.col('string_id') , 'ASC' ]
			]
    }).then(stringsUnits => {
      if (!stringsUnits) {
        resolve(false);
        return;
      }

      if (stringsUnits.length > 1) {
        let entries = [];
        for (const stringsUnit of stringsUnits) {
          if (args == stringsUnit.get(language).toLowerCase()) {
            displayDL(stringsUnit, message, language).then(success => {
              resolve(success);
            });
            break;
          }
          entries.push([entries.length + 1, stringsUnit.get(language)]);
        }

        if (stringsUnits.length == entries.length) {
          let embeds = [];
          let elements = [];
          for (let i = 0; i < entries.length + 1; i++) {
            if ((i % 10 == 0 && i != 0) || i == entries.length) {
              const embed = new Discord.RichEmbed()
              .setColor('#f296fb')
              .attachFiles([`data/Sprite/info_icon.png`])
              .setAuthor(`${args.length == 0 ? strings.menu_dl[language] : args.toUpperCase()} • ${strings.found[language]}: ${entries.length}`, 'attachment://info_icon.png')
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
      } else if (stringsUnits.length == 1) {
        displayDL(stringsUnits[0], message, language).then(success => {
          resolve(success);
        });
      }
    });
  });
}

function displayDL(stringsUnit, message, language) {
  return new Promise(async resolve => {
    await modelMawang.findOne({
      where: {
        monid: stringsUnit.get('string_id')
      }
    }).then(async mawang => {
      let powers = [];
      for (const powerID of mawang.get('power').split(',')) {
  				await modelPower.findByPk(powerID).then(async power => {
  					await modelStringsPower.findByPk(powerID).then(async stringsPower => {
  						await modelStringsPwrDsc.findByPk(powerID).then(async stringsPwrDsc => {
  							let pwrdsc = stringsPwrDsc.get(language);

  							const dmg = power.get('dmg');
  							const atk = power.get('atk');
  							const vatk = power.get('vatk');
  							const atkv = `${vatk}`.includes('.') ? `${strings.atk[language]}` : `.0${strings.atk[language]}`;

  							pwrdsc = pwrdsc.replace('[DMG]', `${dmg + atk * 10}(=${dmg} + ${atk}${strings.atk[language]})`);
  							pwrdsc = pwrdsc.replace('[V1]', power.get('v1'));
  							pwrdsc = pwrdsc.replace('[V1P]', (parseFloat(power.get('v1')) * 100).toFixed(0) + ' %');
  							pwrdsc = pwrdsc.replace('[V2]', power.get('v2'));
  							pwrdsc = pwrdsc.replace('[V2P]', (parseFloat(power.get('v2')) * 100).toFixed(0) + ' %');
  							pwrdsc = pwrdsc.replace('[V3]', power.get('v3'));
  							pwrdsc = pwrdsc.replace('[V3P]', (parseFloat(power.get('v3')) * 100).toFixed(0) + ' %');
  							pwrdsc = pwrdsc.replace('[VATK]', `${10 * vatk}(=${vatk}${atkv}`);

  							power.get('buff').split('/').forEach((buffid, index) => {
  								let regex = new RegExp((`[BV${(index > 0 ? (index + 1) : '')}]`).replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g');
  								pwrdsc = pwrdsc.replace(regex, `${buffid.split(',')[1]}`);
  							});

                await modelStringsBuff.findAll().then(stringsBuffData => {
  								stringsBuffData.forEach(stringsBuff => {
  									if(pwrdsc.includes(`[B_${stringsBuff.get('string_id').substring(1).toUpperCase()}]`)) {
  										let regex = new RegExp((`[B_${stringsBuff.get('string_id').substring(1).toUpperCase()}]`).replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g');
  										pwrdsc = pwrdsc.replace(regex, `\`${stringsBuff.get(language)}\``);
  									}
  								});
  							});

  							powers.push(`**${stringsPower.get(language)}**\n• ${pwrdsc}`);
  						});
  					});
  				});
  			}

      let unlocks = [];
      let awakening = [];
      await modelMWRebirthChar.findAll({
  			where: {
  				mawang: mawang.get('mawang_id')
  			},
  			order: [
  				[ Sequelize.col('lv') , 'ASC' ]
  			]
  		}).then(async rebirths => {
        for(const rebirth of rebirths) {
  					await modelStringsMwRC.findByPk(rebirth.get('mwrebirthchar_id')).then(async stringsMwRC => {
  						await modelStringsMwRCDsc.findByPk(rebirth.get('mwrebirthchar_id')).then(async stringsMwRCDsc => {
  							let mwrcdsc = stringsMwRCDsc.get(language);

  							mwrcdsc = mwrcdsc.replace(new RegExp(('[V1]').replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g'), rebirth.get('value'));
  							mwrcdsc = mwrcdsc.replace(new RegExp(('[V1P]').replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g'), (rebirth.get('value') * 100).toFixed(0) + ' %');
  							mwrcdsc = mwrcdsc.replace(new RegExp(('[V2]').replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g'), rebirth.get('v2'));
  							mwrcdsc = mwrcdsc.replace(new RegExp(('[V2P]').replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g'), (rebirth.get('v2') * 100).toFixed(0) + ' %');

  							for (const powerID of mawang.get('power').split(',')) {
  								await modelPower.findByPk(powerID).then(async power => {
  									if (mwrcdsc.includes(power.get('replace'))) {
  										await modelStringsPower.findByPk(powerID).then(async stringsPower => {
  											mwrcdsc = mwrcdsc.replace(power.get('replace'), `"${strings.boss_skill[language]} : ${stringsPower.get(language)}"`);
  										});
  									}
  								});
  							}

                await modelStringsBuff.findAll().then(stringsBuffData => {
  								stringsBuffData.forEach(stringsBuff => {
  									if(mwrcdsc.includes(`[B_${stringsBuff.get('string_id').substring(1).toUpperCase()}]`)) {
  										let regex = new RegExp((`[B_${stringsBuff.get('string_id').substring(1).toUpperCase()}]`).replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g');
  										mwrcdsc = mwrcdsc.replace(regex, `\`${stringsBuff.get(language)}\``);
  									}
  								});
  							});

  							if (rebirth.get('lv') <= 10) {
  								unlocks.push(`Lv.${rebirth.get('lv')} **${stringsMwRC.get(language)}**\n• ${mwrcdsc}`);
  							} else if (rebirth.get('lv') > 10){
  								awakening.push(`Lv.${rebirth.get('lv')} **${stringsMwRC.get(language)}**\n• ${mwrcdsc}`);
  							}
  						});
  					});
  				}
      });

      let transTraining = [];
  		let transConquest = [];
  		let transGovernance = [];
  		let transAssistance = [];
      for (const beyondtsKeys of mawang.get('beyondts').split('/')) {
  			for(const beyondtsKey of beyondtsKeys.split(',')) {
  				await modelBeyondTS.findByPk(beyondtsKey).then(async beyondts => {
  					await modelStringsBeyondTS.findByPk(beyondtsKey).then(async stringsBeyondTS => {
  						await modelStringsBeyondTSDsc.findByPk(beyondtsKey).then(async stringsBeyondTSDsc => {
  							let increment = beyondts.get('value');
  							let maxValue = beyondts.get('max') * beyondts.get('value');
  							let percent = '';

  							if (beyondts.get('percent')) {
  								percent = '%';
  								increment = (increment * 100).toFixed();
  								maxValue = (maxValue * 100).toFixed();
  							}

  							let beyondTSTitle = `${stringsBeyondTS.get(language)}`;
  							let beyondTSDsc = stringsBeyondTSDsc.get(language);

  							for(const buffid of beyondts.get('buff').split(',')) {
  								if (buffid != 'eNone') {
  									await modelStringsBuff.findByPk(buffid).then(stringsBuff => {
  										let regex = new RegExp((`[BUFF_${beyondts.get('buff').split(',').indexOf(buffid)}]`).replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g');
  										beyondTSTitle = beyondTSTitle.replace(regex, `\`${stringsBuff.get(language)}\``);
  										beyondTSDsc = beyondTSDsc.replace(regex, `\`${stringsBuff.get(language)}\``);
  									});
  								}
  							}

  							switch(mawang.get('beyondts').split('/').indexOf(beyondtsKeys)) {
  								case 0:
  									transTraining.push(`**${beyondTSTitle}**\n• ${beyondTSDsc}\n• ${strings.perpoint[language].format(increment + percent, maxValue + percent)}`);
  									break;
  								case 1:
  									transConquest.push(`**${beyondTSTitle}**\n• ${beyondTSDsc}\n• ${strings.perpoint[language].format(increment + percent, maxValue + percent)}`);
  									break;
  								case 2:
  									transGovernance.push(`**${beyondTSTitle}**\n• ${beyondTSDsc}\n• ${strings.perpoint[language].format(increment + percent, maxValue + percent)}`);
  									break;
  								case 3:
  									transAssistance.push(`**${beyondTSTitle}**\n• ${beyondTSDsc}\n• ${strings.perpoint[language].format(increment + percent, maxValue + percent)}`);
  									break;
  							}
  						});
  					});
  				});
  			}
  		}

      let mawangData = [];
      mawangData.push(powers.join('\n'));
      mawangData.push(unlocks.join('\n'));
      mawangData.push(awakening.join('\n'));
      mawangData.push(`${transTraining.join('\n')}\n\n${transConquest.join('\n')}`);
      mawangData.push(`${transGovernance.join('\n')}\n\n${transAssistance.join('\n')}`);

      await modelUnit.findByPk(mawang.get('monid')).then(async unit => {
        let sprite = unit.get('sprite');
        let embeds = [];
        for(const data of mawangData) {
          const embed = new Discord.RichEmbed()
          .setColor('#f296fb')
          .setAuthor(stringsUnit.get(language), `https://res.cloudinary.com/hq0ppy0db/image/upload/v1571737090/Sprite/${sprite}_icon.png`, `https://duma-eng.fandom.com/wiki/${stringsUnit.get('eng').replace(/ /g, '_')}`)
          .setURL(`https://duma-eng.fandom.com/wiki/${stringsUnit.get('eng').replace(/ /g, '_')}`)
          .setThumbnail(`https://res.cloudinary.com/hq0ppy0db/image/upload/v1571737090/Sprite/${sprite}_idle01.png`)
          .setDescription(data);

          embeds.push(embed);
        }

        const pagedEmbeds = new Pagination.Embeds()
        .setArray(embeds)
        .setAuthorizedUsers([message.author.id])
        .setChannel(message.channel)
        .setPageIndicator(false)
        .setDeleteOnTimeout(true)
        .setDisabledNavigationEmojis(['BACK', 'JUMP', 'FORWARD'])
        .addFunctionEmoji('1⃣', (user, instance) => {
  				pagedEmbeds.setPage(1);
  			})
  			.addFunctionEmoji('2⃣', (user, instance) => {
  				pagedEmbeds.setPage(2);
  			})
  			.addFunctionEmoji('3⃣', (user, instance) => {
  				pagedEmbeds.setPage(3);
  			})
  			.addFunctionEmoji('4⃣', (user, instance) => {
  				pagedEmbeds.setPage(4);
  			})
  			.addFunctionEmoji('5⃣', (user, instance) => {
  				pagedEmbeds.setPage(5);
  			})
        .addFunctionEmoji('📌', (user, instance) => {
    			pagedEmbeds.setDeleteOnTimeout(!pagedEmbeds.deleteOnTimeout)
          .setFooter(`| 1•${strings.skills[language]} | 2•${strings.rebirth[language]} | 3•${strings.awakening[language]} | 4• ${strings.transcend1[language]} | 5•${strings.transcend2[language]} |${pagedEmbeds.deleteOnTimeout ? '' : ' 📌'}`);
        })
        .setFooter(`| 1•${strings.skills[language]} | 2•${strings.rebirth[language]} | 3•${strings.awakening[language]} | 4• ${strings.transcend1[language]} | 5•${strings.transcend2[language]} |`);

        message.reply({files: pagedEmbeds.currentEmbed.files}).then(replyMsg => {
          pagedEmbeds.setClientAssets({ message: replyMsg }).build();
        });
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
        message.reply(strings.prompt_dl[language]).then(msg => {
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
