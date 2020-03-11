const { AkairoClient, CommandHandler } = require('discord-akairo');
const models = require('./models');
const replaceAll = require('string.prototype.replaceall');
replaceAll.shim();

class DMClient extends AkairoClient {
  constructor() {
    super({
      ownerID: '308147981314424840'
    }, {
      disableEveryone: true,
      partials: ['MESSAGE', 'CHANNEL', 'REACTION']
    });

    this.commandHandler = new CommandHandler(this, {
      directory: './commands/',
      prefix: '!',
      commandUtil: true,
    });

    this.commandHandler.loadAll();
  }
}

const client = new DMClient();
client.models = models;
client.cloudinary = process.env.CLOUDINARY_SPRITEURL;

client.once('ready', () => {
  console.log('Ready!');
  client.user.setActivity('Dungeon Maker', { url: 'https://www.twitch.tv/search?term=Dungeon%20Maker', type: 'STREAMING'});
});

client.on('messageReactionAdd', async (messageReaction, user) => {
  if (messageReaction.message.partial) {
		try {
			await messageReaction.message.fetch();
		} catch (error) {
			console.log('Something went wrong when fetching the message: ', error);
		}
  }
  
  if (messageReaction.message.id === '496780010447831080') {
    const guild = client.guilds.resolve('496757856662585385');
    let role;
    switch(messageReaction.emoji.name) {
      case '🇰🇷':
        role = guild.roles.resolve('496760760580702219');
        break;
      case '🇨🇳':
        role = guild.roles.resolve('496760716850888720');
        break;
      case '🇯🇵':
        role = guild.roles.resolve('496760605751902209');
        break;
    }
    guild.members.fetch(user.id).then(member => {
      member.roles.add(role);
    });
  }
});

client.on('messageReactionRemove', async (messageReaction, user) => {
  if (messageReaction.message.partial) {
		try {
			await messageReaction.message.fetch();
		} catch (error) {
			console.log('Something went wrong when fetching the message: ', error);
		}
  }

  if (messageReaction.message.id === '496780010447831080') {
    const guild = client.guilds.resolve('496757856662585385');
    let role;
    switch(messageReaction.emoji.name) {
      case '🇰🇷':
        role = guild.roles.resolve('496760760580702219');
        break;
      case '🇨🇳':
        role = guild.roles.resolve('496760716850888720');
        break;
      case '🇯🇵':
        role = guild.roles.resolve('496760605751902209');
        break;
    }
    guild.members.fetch(user.id).then(member => {
      member.roles.remove(role);
    });
  }
});

client.login(process.env.BOT_TOKEN);