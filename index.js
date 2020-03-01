const { AkairoClient, CommandHandler } = require('discord-akairo');
const models = require('./models');
const replaceAll = require('string.prototype.replaceall');
replaceAll.shim();

class DMClient extends AkairoClient {
  constructor() {
    super({
      ownerID: '308147981314424840',
      prefix: '!',
      commandUtil: true,
      commandUtilLifetime: 30000,
      commandDirectory: './commands/',
    }, {
      disableEveryone: true
    });
  }
}

const client = new DMClient();
client.models = models;

client.once('ready', () => {
  console.log('Ready!');
  client.user.setActivity('Dungeon Maker', { url: 'https://www.twitch.tv/search?term=Dungeon%20Maker', type: 'STREAMING'});
});
client.login(process.env.BOT_TOKEN);