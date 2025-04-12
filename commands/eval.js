const { ownerId } = require('../config/owner');

module.exports = {
    name: 'eval',
    description: 'Exécute du code JavaScript (Owner only)',
    usage: '+eval <code>',
    permissions: 'Owner',
    async execute(message, args) {
        if (message.author.id !== ownerId) {
            return message.reply('❌ Cette commande est réservée à l\'owner du bot.');
        }

        try {
            const code = args.join(' ');
            let evaled = eval(code);

            if (typeof evaled !== 'string')
                evaled = require('util').inspect(evaled);

            message.channel.send(`✅ Résultat:\n\`\`\`js\n${evaled}\n\`\`\``);
        } catch (err) {
            message.channel.send(`❌ Erreur:\n\`\`\`js\n${err}\n\`\`\``);
        }
    }
};
