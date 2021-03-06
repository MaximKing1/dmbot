const { Listener } = require('discord-akairo');

class MessageReactionAddListener extends Listener {
    constructor() {
        super('messagereactionadd', {
            emitter: 'client',
            event: 'messageReactionAdd'
        });
    }

    async exec(messageReaction, user) {
        if (messageReaction.message.partial) {
            try {
                await messageReaction.message.fetch();
            } catch (error) {
                console.log('Something went wrong when fetching the message: ', error);
                return;
            }
        }
        
        if (messageReaction.message.id === '688697393180311571') {
            const guild = this.client.guilds.resolve('496757856662585385');
            let role;
            switch(messageReaction.emoji.name) {
                case '🇺🇸':
                    role = guild.roles.resolve('638569553277878283');
                    break;
                case '🇰🇷':
                    role = guild.roles.resolve('496760760580702219');
                    break;
                case '🇨🇳':
                    role = guild.roles.resolve('496760716850888720');
                    break;
                case '🇹🇼':
                    role = guild.roles.resolve('638473994365829163');
                    break;
                case '🇯🇵':
                    role = guild.roles.resolve('496760605751902209');
                    break;
                default:
                    messageReaction.remove();
                    return;
            }

            guild.members.fetch(user.id).then(member => {
                member.roles.add(role);
                const announcementRole = guild.roles.resolve('514640315253260299');
                member.roles.add(announcementRole);
                const monsterRole = guild.roles.resolve('496758302794055681');
                member.roles.add(monsterRole);
            });
        }

        if (messageReaction.message.id === '688706623845171283') {
            const guild = this.client.guilds.resolve('496757856662585385');
            let role;
            switch(messageReaction.emoji.name) {
                case '📰':
                    role = guild.roles.resolve('514640315253260299');
                    break;
                case '📝':
                    role = guild.roles.resolve('500590427456667648');
                    break;
                default:
                    messageReaction.remove();
                    return;
            }

            guild.members.fetch(user.id).then(member => {
                member.roles.add(role);
            });
        }

        if (messageReaction.message.id === '688709740150128658') {
            const guild = this.client.guilds.resolve('496757856662585385');
            let role;
            switch(messageReaction.emoji.name) {
                case 'Mon_0001_icon':
                    role = guild.roles.resolve('618488119108567040');
                    break;
                case 'Mon_0002_icon':
                    role = guild.roles.resolve('618488166785220619');
                    break;
                case 'Mon_0003_icon':
                    role = guild.roles.resolve('618488705635844137');
                    break;
                case 'Mon_0004_icon':
                    role = guild.roles.resolve('618488379448754187');
                    break;
                case 'Mon_0005_icon':
                    role = guild.roles.resolve('618488346179534870');
                    break;
                case 'Mon_0006_icon':
                    role = guild.roles.resolve('618488415914033154');
                    break;
                case 'Mon_0007_icon':
                    role = guild.roles.resolve('618488436780957696');
                    break;
                case 'Mon_0008_icon':
                    role = guild.roles.resolve('618488457890889759');
                    break;
                case 'Mon_0009_icon':
                    role = guild.roles.resolve('618488478178607134');
                    break;
                default:
                    messageReaction.remove();
                    return;
            }

            guild.members.fetch(user.id).then(member => {
                member.roles.add(role);
            });
        }
    }
}

module.exports = MessageReactionAddListener;