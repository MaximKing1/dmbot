const fs = require('fs');
const Discord = require('discord.js');
const Pagination = require('discord-paginationembed');
const strings = require('./data/strings.js');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(file, command);
}

client.once('ready', () => {
	console.log('Ready!');
	client.user.setActivity('Dungeon Maker');
});

client.on('message', message => {
	if (!message.content.startsWith('!') || message.author.bot) return;

	const args = message.content.slice(1).replace('　', ' ').split(/ +/);
	const commandName = args.shift().toLowerCase();

  if (Object.values(strings.dm).includes(commandName)) {
    if (args.includes('help')) {
      console.log('TODO: display help');
    } else {
      let language = Object.keys(strings.dm).find(key => strings.dm[key] === commandName);
			displayMenu(message, language);
    }
  }

  execute(message, commandName, args);
});

client.login(process.env.BOT_TOKEN);

function execute(message, commandName, args) {
  const command = client.commands.find(cmd => cmd.aliases && Object.values(cmd.aliases).includes(commandName));

  if (!command) return;

  try {
    command.execute(message, args.join(' ').toLowerCase(), Object.keys(command.aliases).find(key => command.aliases[key] === commandName)).then(success => {
			if (success) message.delete();
		});
  } catch (error) {
    console.error(error);
    console.error('there was an error trying to execute that command!');
  }
}

function executeMenu(message, commandName, language) {
  const command = client.commands.find(cmd => cmd.aliases && Object.values(cmd.aliases).includes(commandName));

  if (!command) return;

  try {
    command.executeMenu(message, language).then(success => {
			if (success) message.delete();
		});
  } catch (error) {
    console.error(error);
    console.error('there was an error trying to execute that command!');
  }
}

function displayMenu(message, language) {
	const embed = new Discord.RichEmbed()
	.setColor('#f296fb')
	.setAuthor(strings.dungeonmaker[language], '', 'https://duma-eng.fandom.com/wiki/Dungeon_Maker_Wiki')
	.setDescription(`1 • ${strings.menu_dl[language]}\n2 • ${strings.menu_unit[language]}\n3 • ${strings.menu_world[language]}\n4 • ${strings.menu_relic[language]}\n5 • ${strings.menu_skill[language]}\n6 • ${strings.menu_status[language]}\n7 • ${strings.menu_world[language]}(soon)\n8 • ${strings.menu_diff[language]}(soon)`)

	const pagedEmbeds = new Pagination.Embeds()
	.setArray([embed])
	.setAuthorizedUsers([message.author.id])
	.setChannel(message.channel)
	.setPageIndicator(false)
	.setDeleteOnTimeout(true)
	.setDisabledNavigationEmojis(['BACK', 'JUMP', 'FORWARD']);

	message.reply({files: pagedEmbeds.currentEmbed.files}).then(replyMsg => {
		pagedEmbeds.setClientAssets({ message: replyMsg })
		.addFunctionEmoji('🔍', (user, instance) => {
			message.reply(strings.prompt_menu[language]).then(msg => {
				const filter = m => m.author.id === message.author.id && (m.content >= 0 && m.content <= 8);
				message.channel.awaitMessages(filter, { maxMatches: 1, time: 30000, errors: ['time'] })
					.then(collected => {
						if (collected.first().content != 0) {
							switch (Number(collected.first().content)) {
								case 1:
									executeMenu(message, strings.dl[language], language);
									break;
								case 2:
									executeMenu(message, strings.unit[language], language);
									break;
								case 3:
									executeMenu(message, strings.world[language], language);
									break;
								case 4:
									executeMenu(message, strings.relic[language], language);
									break;
								case 5:
									executeMenu(message, strings.skill[language], language);
									break;
								case 6:
									executeMenu(message, strings.status[language], language);
									break;
								case 7:
									executeMenu(message, strings.boss[language], language);
									break;
								case 8:
									executeMenu(message, strings.diff[language], language);
									break;
							}
							replyMsg.delete();
							msg.delete();
							collected.first().delete();
						} else {
							collected.first().delete();
							msg.delete();
						}
					});
			});
		}).build();
	});
}
