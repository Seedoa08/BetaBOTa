const { prefix } = require('../config.json');

module.exports = {
    name: 'help',
    description: 'Affiche la liste des commandes par catégorie',
    usage: '+help [catégorie]',
    permissions: 'Aucune',
    async execute(message) {
        // Organiser les commandes par catégories
        const categories = {
            "🛡️ Modération": ["ban", "kick", "mute", "warn", "clear", "lock", "unlock"],
            "⚙️ Configuration": ["serverinfo", "userinfo", "owneronly", "raid", "antiraid"],
            "📊 Utilitaires": ["ping", "help", "info", "diagnostic"],
            "🎭 Gestion des sanctions": ["warnings", "clearwarns", "tempmute", "unmute"]
        };

        const embeds = Object.entries(categories).map(([category, commands]) => {
            return {
                color: 0x0099ff,
                title: `📜 Aide du bot - ${category}`,
                description: 'Voici la liste des commandes disponibles :',
                fields: commands.map(cmdName => {
                    const cmd = message.client.commands.get(cmdName);
                    return {
                        name: `\`${prefix}${cmdName}\``,
                        value: cmd ? cmd.description : 'Pas de description disponible'
                    };
                }),
                footer: {
                    text: `Demandé par ${message.author.tag}`,
                    icon_url: message.author.displayAvatarURL({ dynamic: true })
                },
                timestamp: new Date()
            };
        });

        try {
            for (const embed of embeds) {
                await message.channel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi des embeds d\'aide:', error);
            message.reply('❌ Une erreur est survenue lors de l\'envoi des informations d\'aide.');
        }
    }
};
