const { PermissionsBitField } = require('discord.js');

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
        // ...code de la commande modlog...
    }
};
