const { Listener } = require('discord-akairo');

class MessageReactionAddListener extends Listener {
    constructor() {
        super('guildmemberadd', {
            emitter: 'client',
            event: 'guildMemberAdd'
        });
    }

    async exec(member) {
        // const guild = this.client.guilds.resolve('496757856662585385');
        // const role = guild.roles.resolve('514640315253260299');
        // member.roles.add(role);
    }
}

module.exports = MessageReactionAddListener;