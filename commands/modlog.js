const { PermissionsBitField } = require('discord.js');
const isOwner = require('../utils/isOwner');

module.exports = {
    name: 'modlog',
    description: 'Configure ou affiche les logs de modération',
    usage: '+modlog <setup/view/config>',
    permissions: 'Administrator',
    variables: [
        { name: 'setup', description: 'Configure le salon des logs' },
        { name: 'view', description: 'Affiche les derniers logs' },
        { name: 'config', description: 'Configure les paramètres des logs' }
    ],
    async execute(message, args) {
        // Bypass des permissions pour les owners
        if (!isOwner(message.author.id) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande.');
        }
        // ...code de la commande modlog...
    }
};
