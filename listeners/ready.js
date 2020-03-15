const { Listener } = require('discord-akairo');

class ReadyListener extends Listener {
    constructor() {
        super('ready', {
            emitter: 'client',
            event: 'ready',
            type: 'once'
        });
    }

    async exec() {
        this.client.user.setActivity('Dungeon Maker', { url: 'https://www.twitch.tv/search?term=Dungeon%20Maker', type: 'STREAMING'});
        const guild = this.client.guilds.resolve('496757856662585385');
        const channel = guild.channels.resolve('688669775504867328');
        const msgLanguage = await channel.messages.fetch('688697393180311571');
        await msgLanguage.react('🇺🇸');
        await msgLanguage.react('🇰🇷');
        await msgLanguage.react('🇨🇳');
        await msgLanguage.react('🇹🇼');
        await msgLanguage.react('🇯🇵');
        const msgRoles = await channel.messages.fetch('688706623845171283');
        await msgRoles.react('📰');
        await msgRoles.react('📝');
        const msgDL = await channel.messages.fetch('688709740150128658');
        await msgDL.react('688711798215540796');
        await msgDL.react('688711798286843927');
        await msgDL.react('688711798274129985');
        await msgDL.react('688711798261678171');
        await msgDL.react('688711798194438166');
        await msgDL.react('688711798274129988');
        await msgDL.react('688711798219603986');
        await msgDL.react('688711798463004715');
        await msgDL.react('688711798211215403');
        await msgDL.react('688711798198632451');

        console.log('Ready!');
    }
}

module.exports = ReadyListener;