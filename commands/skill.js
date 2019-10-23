const Discord = require('discord.js');
const Sequelize = require('sequelize');
const Pagination = require('discord-paginationembed');
const strings = require('../data/strings.js');
const { modelSkill, modelStringsSkill, modelStringsSklDsc, modelStringsBuff } = require('../models.js');

module.exports = {
  aliases: strings.skill,
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
    modelStringsSkill.findAll({
			where: {
				language: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(language)), 'LIKE', `%${args}%`)
			}
		}).then(stringsSkills => {
      if (!stringsSkills) {
        resolve(false);
        return;
      }

      if (stringsSkills.length > 1) {
        let entries = [];
        for (const stringsSkill of stringsSkills) {
          if (args == stringsSkill.get(language).toLowerCase()) {
            displaySkill(stringsSkill, message, language).then(success => {
              resolve(success);
            });
            break;
          }
          entries.push([entries.length + 1, stringsSkill.get(language)]);
        }

        if (stringsSkills.length == entries.length) {
          let embeds = [];
          let elements = [];
          for (let i = 0; i < entries.length + 1; i++) {
            if ((i % 10 == 0 && i != 0) || i == entries.length) {
              const embed = new Discord.RichEmbed()
              .setColor('#f296fb')
              .attachFiles([`data/Sprite/info_icon.png`])
              .setAuthor(`${args.length == 0 ? strings.menu_skill[language] : args.toUpperCase()} • ${strings.found[language]}: ${entries.length}`, 'attachment://info_icon.png')
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
      } else if (stringsSkills.length == 1) {
        displaySkill(stringsSkills[0], message, language).then(success => {
          resolve(success);
        });
      }
    });
  });
}

function displaySkill(stringsSkill, message, language) {
  return new Promise(async resolve => {
    await modelSkill.findByPk(stringsSkill.get('string_id')).then(async skill => {
  		await modelStringsSklDsc.findByPk(stringsSkill.get('string_id')).then(async stringsSklDsc => {
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

  			const embed = new Discord.RichEmbed()
				.attachFiles(['data/Sprite/CardSkill.png'])
				.setColor('#f296fb')
				.setAuthor(stringsSkill.get(language), 'attachment://CardSkill.png', 'https://duma-eng.fandom.com/wiki/Category:Skills')
				.setDescription(`• ${passive}${skldsc}`)

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
        message.reply(strings.prompt_skill[language]).then(msg => {
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
