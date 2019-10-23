const Discord = require('discord.js');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Pagination = require('discord-paginationembed');
const strings = require('../data/strings.js');
const { modelStringsUnit, modelUnit, modelSkill, modelStringsSkill, modelStringsSklDsc, modelStringsBuff, modelStringsTortureTool, modelTortureEffect, modelTortureTool } = require('../models.js');

module.exports = {
  aliases: strings.unit,
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
    let corrupted = false;

    if (args.startsWith('c.')) {
      corrupted = true;
      args = args.substring(2).trim();
    }

    for (const corruptString of Object.values(strings.corrupted)) {
      if (args.startsWith(corruptString.toLowerCase().trim())) {
        corrupted = true;
        args = args.substring(corruptString.length).trim();
      }
    }

    modelStringsUnit.findAll({
      where: {
        string_id: Sequelize.where(Sequelize.fn('length', Sequelize.col('string_id')), { [Op.not]: 4 }),
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
            displayUnit(stringsUnit, corrupted, message, language).then(success => {
              resolve(success);
            });
            break;
          }
          entries.push([entries.length + 1, `${(corrupted ? strings.corrupted[language] : '')}${stringsUnit.get(language)}`]);
        }

        if (stringsUnits.length == entries.length) {
          let embeds = [];
          let elements = [];
          for (let i = 0; i < entries.length + 1; i++) {
            if ((i % 10 == 0 && i != 0) || i == entries.length) {
              const embed = new Discord.RichEmbed()
              .setColor('#f296fb')
              .attachFiles([`data/Sprite/info_icon.png`])
              .setAuthor(`${args.length == 0 ? strings.menu_unit[language] : (corrupted ? strings.corrupted[language] + args : args).toUpperCase()} • ${strings.found[language]}: ${entries.length}`, 'attachment://info_icon.png')
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
        displayUnit(stringsUnits[0], corrupted, message, language).then(success => {
          resolve(success);
        });
      }
    });
  });
}

function displayUnit(stringsUnit, corrupted, message, language) {
  return new Promise(async resolve => {
    const pagedEmbeds = new Pagination.Embeds()
    .setAuthorizedUsers([message.author.id])
    .setChannel(message.channel)
    .setPageIndicator(false)
    .setPage(corrupted ? 2 : 1)
    .setDisabledNavigationEmojis(['BACK', 'JUMP', 'FORWARD'])
    .setDeleteOnTimeout(true);

    let embeds = [];
    let footerText = ' ';
    let isCorruptable = false;

    await getUnit(stringsUnit.get('string_id')).then(async unit => {
      let sprite = unit.get('sprite');
      const embed = new Discord.RichEmbed()
      .setColor('#f296fb')
      .setAuthor(stringsUnit.get(language), `https://res.cloudinary.com/hq0ppy0db/image/upload/v1571737090/Sprite/${sprite}_icon.png`, `https://duma-eng.fandom.com/wiki/${stringsUnit.get('eng').replace(/ /g, '_')}`)
      .setURL(`https://duma-eng.fandom.com/wiki/${stringsUnit.get('eng').replace(/ /g, '_')}`)
      .setThumbnail(`https://res.cloudinary.com/hq0ppy0db/image/upload/v1571737090/Sprite/${sprite}_idle01.png`);

      await getSkills(unit, language).then(skills => {
  			embed.addField(`${strings.skills[language]}`, skills.join('\n'));
      });

      if((unit.get('hero') || unit.get('unittype') == 'eHeroFallen') && unit.get('unittype') != 'eHeroGoddess') {
        await getTortureTools(unit, language).then(tools => {
          isCorruptable = true;
          embed.addField(strings.tools[language], `<:6_torture:613749521335320587>${tools[0].join(', ')}\n<:5_torture:613749588502773776>${tools[1].join(', ')}`);
        });
      } else if (unit.get('unittype') != 'eHeroGoddess') {
        await getStats(unit).then(stats => {
          embed.addField(strings.base_stats[language], `${strings.life[language]}: ${stats[0]} | ${strings.atk[language]}: ${stats[1]} | ${strings.def[language]}: ${stats[2]}`);
          embed.addField(strings.stats_grow[language], `${strings.life[language]}: ${stats[3]} | ${strings.atk[language]}: ${stats[4]} | ${strings.def[language]}: ${stats[5]}`);
        });
      }

      embeds.push(embed);

      await getFusions(unit, language).then(async fusions => {
        const embed = new Discord.RichEmbed()
        .setColor('#f296fb')
        .setAuthor(stringsUnit.get(language), `https://res.cloudinary.com/hq0ppy0db/image/upload/v1571737090/Sprite/${sprite}_icon.png`, `https://duma-eng.fandom.com/wiki/${stringsUnit.get('eng').replace(/ /g, '_')}`)
        .setURL(`https://duma-eng.fandom.com/wiki/${stringsUnit.get('eng').replace(/ /g, '_')}`)
        .setThumbnail(`https://res.cloudinary.com/hq0ppy0db/image/upload/v1571737090/Sprite/${sprite}_idle01.png`);

        if(unit.get('recipe') != '-') {
          await getMaterials(unit, language).then(materials => {
            embed.addField(strings.materials[language], `**${stringsUnit.get(language)}**\n• ${materials.join('\n• ')}`);
          });
        }

        let fusMats = [];
        for(const fusion of fusions) {
          fusMats.push(`**${fusion[0]}**\n• ${fusion[1].join('\n• ')}`);
        }

        if (fusMats.length > 0) {
          embed.addField(strings.fusions[language], fusMats.join('\n'));
        }

        if (unit.get('recipe') != '-' || fusMats.length > 0) {
          footerText = `| 🔄•${strings.toggle_fusion[language]} | `;
          embeds.push(embed);
        }
      });
    });

    if (isCorruptable) {
      await getUnit(Number(stringsUnit.get('string_id')) + 10000).then(async unit => {
        if (unit) {
          footerText = `| 🔄•${strings.toggle_corruption[language]} | `;
          let sprite = unit.get('sprite');
          const embed = new Discord.RichEmbed()
          .setColor('#f296fb')
          .setAuthor(`${strings.corrupted[language] + stringsUnit.get(language)}`, `https://res.cloudinary.com/hq0ppy0db/image/upload/v1571737090/Sprite/${sprite}_icon.png`, `https://duma-eng.fandom.com/wiki/Corrupted_${stringsUnit.get('eng').replace(/ /g, '_')}`)
          .setURL(`https://duma-eng.fandom.com/wiki/Corrupted_${stringsUnit.get('eng').replace(/ /g, '_')}`)
          .setThumbnail(`https://res.cloudinary.com/hq0ppy0db/image/upload/v1571737090/Sprite/${sprite}_idle01.png`);

          await getSkills(unit, language).then(skills => {
            embed.addField(`${strings.skills[language]}`, skills.join('\n'));
          });

          await getStats(unit).then(stats => {
            embed.addField(strings.base_stats[language], `${strings.life[language]}: ${stats[0]} | ${strings.atk[language]}: ${stats[1]} | ${strings.def[language]}: ${stats[2]}`);
            embed.addField(strings.stats_grow[language], `${strings.life[language]}: ${stats[3]} | ${strings.atk[language]}: ${stats[4]} | ${strings.def[language]}: ${stats[5]}`);
          });

          embeds.push(embed);
        }
      });
    }

    if(embeds.length > 1) {
      pagedEmbeds.addFunctionEmoji('🔄', (user, instance) => {
        pagedEmbeds.setPage(pagedEmbeds.page == 1 ? 2 : 1);
      });
    }

    pagedEmbeds.setArray(embeds)
    .setFooter(footerText)
    .addFunctionEmoji('📌', (user, instance) => {
			pagedEmbeds.setDeleteOnTimeout(!pagedEmbeds.deleteOnTimeout)
      .setFooter(`${footerText}${pagedEmbeds.deleteOnTimeout ? '' : ' 📌'}`);
    });

  	message.reply({files: pagedEmbeds.currentEmbed.files}).then(replyMsg => {
      pagedEmbeds.setClientAssets({ message: replyMsg }).build();
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
        message.reply(strings.prompt_unit[language]).then(msg => {
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
    });

    resolve(true);
  });
}

function getUnit(unitID) {
  return new Promise(resolve => {
    modelUnit.findOne({
      where: {
  			unit_id: unitID,
  			unittype: { [Op.not] : 'eMawang' }
  		}
    }).then(unit => {
      resolve(unit);
    });
  });
}

function getSkills(unit, language) {
  return new Promise(async resolve => {
    let skills = [];

		for (const skillID of unit.get('skills').split(',')) {
			if(skillID == 'eNone') {
				skills.push(strings.none[language]);
			} else {
				await modelSkill.findByPk(skillID).then(async (skill) => {
					await modelStringsSkill.findByPk(skillID).then(async (stringsSkill) => {
						await modelStringsSklDsc.findByPk(skillID).then(async (stringsSklDsc) => {
							let skldsc = stringsSklDsc.get(language);

							const passive = skill.get('type') != 'eActive' ? `(${strings.passive[language]}) ` : '';
							const atkfac = skill.get('atkfac');
							const atkv = `${atkfac}`.includes('.') ? `${strings.atk[language]}` : `.0${strings.atk[language]}`;
							const vatk = skill.get('vatk');
							const value01 = skill.get('value01');
							const value02 = skill.get('value02');

							skldsc = skldsc.replace('[DMG]', `${skill.get('damage')}(+${atkfac}${atkv})`);
							skldsc = skldsc.replace('[HEAL]', `${skill.get('heal')}(+${atkfac}${atkv})`);
							skldsc = skldsc.replace('[VATK]', `${vatk}(=${vatk}${atkv}`);
							skldsc = skldsc.replace('[V1]', value01);
							skldsc = skldsc.replace('[V1P]', `${(value01 * 100).toFixed(0)} %`);
							skldsc = skldsc.replace('[V2]', value02);
							skldsc = skldsc.replace('[V2P]', `${(value02 * 100).toFixed(0)} %`);
							skldsc = skldsc.replace('[REPEAT]', skill.get('repeat'));
							skldsc = skldsc.replace('[CHARGE]', skill.get('charge'));

							skill.get('buffid').split('/').forEach((buffid, index) => {
								let blvfacs = skill.get('blvfac').split(',');
								for(let i = 0; i < blvfacs.length; i++) {
									if(blvfacs[i] != '0') {
										if(blvfacs[i].includes('.')) {
											blvfacs[i] = `(+${parseFloat(blvfacs[i])}${strings.atk[language]})`;
										} else {
											blvfacs[i] = `(+${blvfacs[i]}.0${strings.atk[language]})`;
										}
									} else {
										blvfacs[i] = '';
									}
								}

								let regex = new RegExp((`[BV${(index > 0 ? (index + 1) : '')}]`).replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g');
								skldsc = skldsc.replace(regex, `${buffid.split(',')[1]}${blvfacs[index] ? blvfacs[index] : ''}`);
							});

							skill.get('startbuffid').split('/').forEach((startbuffid, index) => {
								let sblvfacs = skill.get('sblvfac').split(',');
								for(let i = 0; i < sblvfacs.length; i++) {
									if(sblvfacs[i] != '0') {
										if(sblvfacs[i].includes('.')) {
											sblvfacs[i] = `(+${parseFloat(sblvfacs[i])}${strings.atk[language]})`;
										} else {
											sblvfacs[i] = `(+${sblvfacs[i]}.0${strings.atk[language]})`;
										}
									} else {
										sblvfacs[i] = '';
									}
								}

								let regex = new RegExp((`[SBV${(index > 0 ? (index + 1) : '')}]`).replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g');
								skldsc = skldsc.replace(regex, `${startbuffid.split(',')[1]}${sblvfacs[index] ? sblvfacs[index] : ''}`);
							});

							await modelStringsBuff.findAll().then(stringsBuffData => {
								stringsBuffData.forEach(stringsBuff => {
									if(skldsc.includes(`[B_${stringsBuff.get('string_id').substring(1).toUpperCase()}]`)) {
										let regex = new RegExp((`[B_${stringsBuff.get('string_id').substring(1).toUpperCase()}]`).replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g');
										skldsc = skldsc.replace(regex, `\`${stringsBuff.get(language)}\``);
									}
								});
							});

							skills.push(`**${stringsSkill.get(language)}**\n• ${passive}${skldsc}`);
						});
					});
				});
			}
		}

    resolve(skills);
  });
}

function getTortureTools(unit, language) {
  return new Promise(async resolve => {
    let toolsBest = [];
		let toolsNice = [];

		await modelTortureEffect.findByPk(unit.get('unit_id')).then(async toolIDs => {
			for (const toolID of toolIDs.get('best').split(',')) {
				if(toolID != 'eNone') {
					await modelStringsTortureTool.findByPk(toolID).then(async stringsTortureToolData => {
						await modelTortureTool.findByPk(toolID).then(tool => {
							toolsBest.push(`${stringsTortureToolData.get(language)} (${tool.get('day')}d)`);
						});
					});
				} else {
					toolsBest.push(toolID);
				}
			}

			for (const toolID of toolIDs.get('nice').split(',')) {
				if(toolID != 'eNone') {
					await modelStringsTortureTool.findByPk(toolID).then(async stringsTortureToolData => {
						await modelTortureTool.findByPk(toolID).then(tool => {
							toolsNice.push(`${stringsTortureToolData.get(language)} (${tool.get('day')}d)`);
						});
					});
				} else {
					toolsNice.push(toolID);
				}
			}
		});

    resolve([toolsBest, toolsNice]);
  });
}

function getStats(unit) {
  return new Promise(resolve => {
    let stats = [];
    stats.push(`${unit.get('hpbase')}`.includes('.') ? unit.get('hpbase').toFixed(2) : unit.get('hpbase'));
    stats.push(`${unit.get('atkbase')}`.includes('.') ? unit.get('atkbase').toFixed(2) : unit.get('atkbase'));
    stats.push(`${unit.get('defbase')}`.includes('.') ? unit.get('defbase').toFixed(2) : unit.get('defbase'));
    stats.push(`${unit.get('hpgrow')}`.includes('.') ? unit.get('hpgrow').toFixed(2) : unit.get('hpgrow'));
    stats.push(`${unit.get('atkgrow')}`.includes('.') ? unit.get('atkgrow').toFixed(2) : unit.get('atkgrow'));
    stats.push(`${unit.get('defgrow')}`.includes('.') ? unit.get('defgrow').toFixed(2) : unit.get('defgrow'));
    resolve(stats);
  });
}

function getMaterials(unit, language) {
  return new Promise(async resolve => {
    let materials = [];

  	for(const unitID of unit.get('recipe').split(',')) {
  		await modelStringsUnit.findByPk(unitID).then(stringsUnit => {
  			materials.push(stringsUnit.get(language));
  		});
  	}

  	resolve(materials);
  });
}

function getFusions(unit, language) {
  return new Promise(async resolve => {
    await modelUnit.findAll({
      where: {
        recipe: {
          [Op.or]: [{[Op.like]: `${unit.get('unit_id')},%`}, {[Op.like]: `%,${unit.get('unit_id')},%`}, {[Op.like]: `%,${unit.get('unit_id')}`}]
        }
      }
    }).then(async units => {
      let fusions = [];

      for(const unit of units) {
        await getMaterials(unit, language).then(async materials => {
          await modelStringsUnit.findByPk(unit.get('unit_id')).then(stringsUnit => {
            fusions.push([stringsUnit.get(language), materials]);
          });
        });
      }

      resolve(fusions);
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
