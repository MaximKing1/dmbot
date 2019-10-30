const Discord = require('discord.js');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Pagination = require('discord-paginationembed');
const strings = require('../data/strings.js');
const { modelStringsBuff, modelStringsRoom, modelStringsRumDsc, modelRoom } = require('../models.js');

module.exports = {
  aliases: strings.room,
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
    modelStringsRoom.findAll({
			where: {
				language: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(language)), 'LIKE', `%${args}%`)
			}
		}).then(stringsRooms => {
      if (!stringsRooms) {
        resolve(false);
        return;
      }

      if (stringsRooms.length > 1) {
        let entries = [];
        for (const stringsRoom of stringsRooms) {
          if (args == stringsRoom.get(language).toLowerCase()) {
            displayRoom(stringsRoom, message, language).then(success => {
              resolve(success);
            });
            break;
          }
          entries.push([entries.length + 1, stringsRoom.get(language)]);
        }

        if (stringsRooms.length == entries.length) {
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
      } else if (stringsRooms.length == 1) {
        displayRoom(stringsRooms[0], message, language).then(success => {
          resolve(success);
        });
      }
    });
  });
}

function displayRoom(stringsRoom, message, language) {
  return new Promise(resolve => {
    const pagedEmbeds = new Pagination.Embeds()
    .setAuthorizedUsers([message.author.id])
    .setChannel(message.channel)
    .setPageIndicator(false)
    .setDeleteOnTimeout(true)
    .setDisabledNavigationEmojis(['BACK', 'JUMP', 'FORWARD']);

    let embeds = [];
    let footerText = ' ';
    let level = 1;
    let upgrade = 0;

    modelStringsRumDsc.findByPk(stringsRoom.get('string_id')).then(async stringsRumDsc => {
      await modelRoom.findByPk(stringsRoom.get('string_id')).then(async room => {
        footerText = `| 🔼•${strings.change_level[language]} | 🔨•${strings.toggle_maxupgrade[language]} |`;
        const dmg = getValue(room.get('damage'), room.get('dmgup'));
        const value1 = getValue(room.get('value1'), room.get('grow1'));
        const value2 = getValue(room.get('value2'), room.get('grow2'));

        const embed = new Discord.RichEmbed()
        .attachFiles([`data/Sprite/${stringsRoom.get('string_id')}.png`])
        .setColor('#f296fb')
        .setAuthor(stringsRoom.get(language), `attachment://${stringsRoom.get('string_id')}.png`, `https://duma-eng.fandom.com/wiki/${stringsRoom.get('eng').replace(/ /g, '_')}`)
        .setThumbnail(`attachment://${stringsRoom.get('string_id')}.png`)
        .setTitle(strings.room_level[language].format(1))
        .setDescription(`• ${await getRoomDesc(language, room, stringsRumDsc.get(language), dmg, value1, value2, level)}`);
        embeds.push(embed);

        await getFusions(room, language).then(async fusions => {
          const embed = new Discord.RichEmbed()
          .setColor('#f296fb')
          .setAuthor(stringsRoom.get(language), `attachment://${stringsRoom.get('string_id')}.png`, `https://duma-eng.fandom.com/wiki/${stringsRoom.get('eng').replace(/ /g, '_')}`)
          .setURL(`https://duma-eng.fandom.com/wiki/${stringsRoom.get('eng').replace(/ /g, '_')}`)
          .setThumbnail(`attachment://${stringsRoom.get('string_id')}.png`);

          if(room.get('recipe') != '-') {
            await getMaterials(room, language).then(materials => {
              embed.addField(strings.materials[language], `**${stringsRoom.get(language)}**\n• ${materials.join('\n• ')}`);
            });
          }

          let fusMats = [];
          for(const fusion of fusions) {
            fusMats.push(`**${fusion[0]}**\n• ${fusion[1].join('\n• ')}`);
          }

          if (fusMats.length > 0) {
            embed.addField(strings.fusions[language], fusMats.join('\n'));
          }

          if (room.get('recipe') != '-' || fusMats.length > 0) {
            footerText = `| 🔄•${strings.toggle_fusion[language]} | 🔼•${strings.change_level[language]} | 🔨•${strings.toggle_maxupgrade[language]} |`;
            embeds.push(embed);
          }
        });

        if(embeds.length > 1) {
          pagedEmbeds.addFunctionEmoji('🔄', (user, instance) => {
            pagedEmbeds.setPage(pagedEmbeds.page == 1 ? 2 : 1);
          });
        }

        pagedEmbeds.setArray(embeds)
        .setFooter(footerText)
        .addFunctionEmoji('🔼', async (user, instance) => {
          const msg = await message.reply(strings.prompt_level[language]);
          const filter = m => m.author.id === message.author.id && m.content >= 0 && m.content <= 99999;
          const collected = await message.channel.awaitMessages(filter, { maxMatches: 1, time: 30000, errors: ['time'] });
          if (collected.first().content != 0) {
            level = Number(collected.first().content);
            const dmg = getValue(room.get('damage'), room.get('dmgup'), level, upgrade);
            const value1 = getValue(room.get('value1'), room.get('grow1'), level, upgrade);
            const value2 = getValue(room.get('value2'), room.get('grow2'), level, upgrade);
            const rumdsc = await getRoomDesc(language, room, stringsRumDsc.get(language), dmg, value1, value2, level);
            embed
            .setTitle(`${strings.room_level[language].format(level)}${upgrade > 0 ? ` | ${strings.room_upgrade[language].format(upgrade)}` : ''}`)
            .setDescription(`• ${rumdsc}`);
            msg.delete();
            collected.first().delete();
          } else {
            collected.first().delete();
            msg.delete();
          }
        })
        .addFunctionEmoji('🔨', async (user, instance) => {
          upgrade = upgrade == 0 ? 10 : 0;
          const dmg = getValue(room.get('damage'), room.get('dmgup'), level, upgrade);
          const value1 = getValue(room.get('value1'), room.get('grow1'), level, upgrade);
          const value2 = getValue(room.get('value2'), room.get('grow2'), level, upgrade);
          await getRoomDesc(language, room, stringsRumDsc.get(language), dmg, value1, value2, level).then(rumdsc => {
            embed
            .setTitle(`${strings.room_level[language].format(level)}${upgrade > 0 ? ` | ${strings.room_upgrade[language].format(upgrade)}` : ''}`)
            .setDescription(`• ${rumdsc}`);
          });
        })
        .addFunctionEmoji('📌', (user, instance) => {
          pagedEmbeds.setDeleteOnTimeout(!pagedEmbeds.deleteOnTimeout)
          .setFooter(`${footerText}${pagedEmbeds.deleteOnTimeout ? '' : ' 📌'}`);
        })

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
        message.reply(strings.prompt_room[language]).then(msg => {
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

function getRoomDesc(language, room, rumdsc, dmg, value1, value2, level) {
  return new Promise(async resolve => {
    rumdsc = rumdsc.replace('[DMG]', `1~${dmg}`.replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, '$1,'));
    rumdsc = rumdsc.replace('[V1]', `${value1.toFixed(0)}`.replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, '$1,'));
    rumdsc = rumdsc.replace('[V1P]', `${(value1 * 100).toFixed(0).replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, '$1,')} %`);
    rumdsc = rumdsc.replace('[V2]', `${value2.toFixed(0)}`.replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, '$1,'));
    rumdsc = rumdsc.replace('[V2P]', `${(value2 * 100).toFixed(0).replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, '$1,')} %`);
    rumdsc = rumdsc.replace('[MAX_SOUL]', `${value2.toFixed(0)}`.replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, '$1,'));
    let regex = new RegExp('[SOUL]'.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g');
    rumdsc = rumdsc.replace(regex, strings.soul[language]);

    room.get('buffbase').split('/').forEach((buffid, index) => {
      let blvfacs = room.get('buffupg').split(',');

      let regex = new RegExp((`[BV${(index > 0 ? (index + 1) : '')}]`).replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g');
      rumdsc = rumdsc.replace(regex, `${Number(buffid.split(',')[1]) + (blvfacs[index] != null ? (blvfacs[index] * (level - 1)) : 0)}`);
    });

    await modelStringsBuff.findAll().then(stringsBuffData => {
      stringsBuffData.forEach(stringsBuff => {
        if(rumdsc.includes(`[B_${stringsBuff.get('string_id').substring(1).toUpperCase()}]`)) {
          let regex = new RegExp((`[B_${stringsBuff.get('string_id').substring(1).toUpperCase()}]`).replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g');
          rumdsc = rumdsc.replace(regex, `\`${stringsBuff.get(language)}\``);
        }
      });
    });

    resolve(rumdsc);
  });
}

function getMaterials(room, language) {
  return new Promise(async resolve => {
    let materials = [];

  	for(const roomID of room.get('recipe').split(',')) {
  		await modelStringsRoom.findByPk(roomID).then(stringsRoom => {
  			materials.push(stringsRoom.get(language));
  		});
  	}

  	resolve(materials);
  });
}

function getFusions(room, language) {
  return new Promise(resolve => {
    modelRoom.findAll({
      where: {
        recipe: {
          [Op.or]: [{[Op.like]: `${room.get('room_id')},%`}, {[Op.like]: `%,${room.get('room_id')},%`}, {[Op.like]: `%,${room.get('room_id')}`}]
        }
      }
    }).then(async rooms => {
      let fusions = [];
      for(const room of rooms) {
        await getMaterials(room, language).then(async materials => {
          await modelStringsRoom.findByPk(room.get('room_id')).then(stringsRoom => {
            fusions.push([stringsRoom.get(language), materials]);
          });
        });
      }
      resolve(fusions);
    });
  });
}

function getValue(base, grow, level = 1, upgrade) {
  if(upgrade > 0) level++;
  let result = base + grow * level;
  return upgrade ? result * (1 + getUpgradeValue(upgrade)) : result;
}

function getUpgradeValue(upgrade) {
  return (upgrade <= 10 ? upgrade : 10) * 0.04;
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
