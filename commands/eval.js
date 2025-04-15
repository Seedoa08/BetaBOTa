const { ownerId } = require('../config/owner');

module.exports = {
    name: 'eval',
    description: 'Exécute du code JavaScript (Owner uniquement)',
    usage: '+eval <code>',
    permissions: 'OwnerOnly',
    async execute(message, args) {
        if (message.author.id !== ownerId) {
            return message.reply('❌ Cette commande est réservée au propriétaire du bot.');
        }

        const code = args.join(' ');
        if (!code) {
            return message.reply('❌ Veuillez fournir du code à exécuter.');
        }

        try {
            const evaled = eval(code);
            const cleaned = await clean(evaled);
            message.channel.send(`\`\`\`js\n${cleaned}\n\`\`\``);
        } catch (err) {
            message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
        }
    }
};

function clean(text) {
    if (typeof text === 'string') {
        return text
            .replace(/`/g, '`' + String.fromCharCode(8203))
            .replace(/@/g, '@' + String.fromCharCode(8203));
    }
    return text;
}
