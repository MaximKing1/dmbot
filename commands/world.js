const Discord = require('discord.js');
const Sequelize = require('sequelize');
const Pagination = require('discord-paginationembed');
const strings = require('../data/strings.js');
const { modelStringsWorld, modelStringsWorldDsc, modelStringsBuff, modelWorld } = require('../models.js');

module.exports = {
  aliases: strings.world,
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
    modelStringsWorld.findAll({
			where: {
				language: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col(language)), 'LIKE', `%${args}%`)
			}
		}).then(stringsWorlds => {
      if (!stringsWorlds) {
        resolve(false);
        return;
      }

      if (stringsWorlds.length > 1) {
        let entries = [];
        for (const stringsWorld of stringsWorlds) {
          if (args == stringsWorld.get(language).toLowerCase()) {
            displayWorld(stringsWorld, message, language).then(success => {
              resolve(success);
            });
            break;
          }
          entries.push([entries.length + 1, stringsWorld.get(language)]);
        }

        if (stringsWorlds.length == entries.length) {
          let embeds = [];
          let elements = [];
          for (let i = 0; i < entries.length + 1; i++) {
            if ((i % 10 == 0 && i != 0) || i == entries.length) {
              const embed = new Discord.RichEmbed()
              .setColor('#f296fb')
              .attachFiles([`data/Sprite/info_icon.png`])
              .setAuthor(`${args.length == 0 ? strings.menu_world[language] : args.toUpperCase()} • ${strings.found[language]}: ${entries.length}`, 'attachment://info_icon.png')
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
      } else if (stringsWorlds.length == 1) {
        displayWorld(stringsWorlds[0], message, language).then(success => {
          resolve(success);
        });
      }
    });
  });
}

function displayWorld(stringsWorld, message, language) {
  return new Promise(async resolve => {
    modelStringsWorldDsc.findByPk(stringsWorld.get('string_id')).then(async (stringsWorldDsc) => {
  		let worlddsc = stringsWorldDsc.get(language);

  		await modelWorld.findByPk(stringsWorldDsc.get('string_id')).then(async (world) => {
  			const value = world.get('value');
  			const buff = world.get('buff');

  			worlddsc = worlddsc.replace('[V1]', value);
  			worlddsc = worlddsc.replace('[V1P]', `${(value * 100).toFixed(0)} %`);

        await modelStringsBuff.findAll().then(stringsBuffData => {
          stringsBuffData.forEach(stringsBuff => {
            if(stringsBuff.get('string_id') == buff) {
              let regex = new RegExp('[BUFF]'.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g');
              worlddsc = worlddsc.replace(regex, `\`${stringsBuff.get(language)}\``);
            }
          });
        });
  		});

  		const embed = new Discord.RichEmbed()
        .attachFiles([`data/Sprite/${stringsWorld.get('string_id')}.png`])
        .setColor('#f296fb')
        .setAuthor(stringsWorld.get(language), '', `https://duma-eng.fandom.com/wiki/${stringsWorld.get('eng').replace(/ /g, '_')}`)
        .setImage(`attachment://${stringsWorld.get('string_id')}.png`)
        .setDescription(`• ${worlddsc}`)

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
        message.reply(strings.prompt_world[language]).then(msg => {
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
