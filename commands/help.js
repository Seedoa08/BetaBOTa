const { prefix } = require('../config/globals');
const commandManager = require('../utils/commandManager');

module.exports = {
    name: 'help',
    description: 'Affiche la liste des commandes disponibles.',
    usage: '+help [catégorie]',
    permissions: 'Aucune',
    async execute(message, args) {
        const categories = commandManager.getCommandsByCategory();
        const embed = {
            color: 0x0099ff,
            title: '📜 Liste des commandes',
            description: `Utilisez \`${prefix}help <commande>\` pour plus d'informations sur une commande spécifique.\nUtilisez \`${prefix}helpall\` pour une liste détaillée.`,
            fields: Object.entries(categories).map(([category, commands]) => ({
                name: category,
                value: commands.map(cmd => `\`${prefix}${cmd}\``).join(', ')
            })),
            footer: {
                text: `${commandManager.getAllCommands().size} commandes disponibles • Demandé par ${message.author.tag}`,
                icon_url: message.author.displayAvatarURL({ dynamic: true })
            },
            timestamp: new Date()
        };

        await message.reply({ embeds: [embed] });
    }
};
