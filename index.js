const { AkairoClient, CommandHandler, ListenerHandler } = require('discord-akairo');
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

    this.listenerHandler = new ListenerHandler(this, {
      directory: './listeners/'
    });

    this.commandHandler.useListenerHandler(this.listenerHandler);
    this.listenerHandler.loadAll();
    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      listenerHandler: this.listenerHandler
    });

    this.commandHandler.loadAll();
  }
}

const client = new DMClient();
client.models = models;
client.cloudinary = process.env.CLOUDINARY_SPRITEURL;

client.login(process.env.BOT_TOKEN);