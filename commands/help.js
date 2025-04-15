const { prefix } = require('../config/globals');

module.exports = {
    name: 'help',
    description: 'Affiche la liste des commandes par catégorie',
    usage: '+help [catégorie]',
    permissions: 'Aucune',
    async execute(message, args) {
        const categories = {
            "🛡️ Modération": ["ban", "kick", "mute", "warn", "clear", "lock", "unlock", "nuke", "slowmode"],
            "⚙️ Configuration": ["serverinfo", "userinfo", "owneronly", "role"],
            "📊 Utilitaires": ["ping", "help", "helpall", "info", "restart"],
            "🎭 Gestion des sanctions": ["warnings", "clearwarns", "tempmute", "unmute"]
        };

        const searchQuery = args[0]?.toLowerCase();
        if (searchQuery) {
            const command = message.client.commands.get(searchQuery) || message.client.commands.find(cmd => cmd.aliases?.includes(searchQuery));
            if (!command) {
                return message.reply(`❌ La commande \`${searchQuery}\` n'existe pas.`);
            }

            const commandEmbed = {
                color: 0x0099ff,
                title: `📖 Détails de la commande \`${command.name}\``,
                fields: [
                    { name: 'Description', value: command.description || 'Aucune description disponible.' },
                    { name: 'Usage', value: command.usage || 'Non spécifié.' },
                    { name: 'Permissions nécessaires', value: command.permissions || 'Aucune' },
                    { name: 'Alias', value: command.aliases?.join(', ') || 'Aucun' }
                ],
                footer: {
                    text: `Demandé par ${message.author.tag}`,
                    icon_url: message.author.displayAvatarURL({ dynamic: true })
                },
                timestamp: new Date()
            };

            return message.channel.send({ embeds: [commandEmbed] });
        }

        const embeds = Object.entries(categories)
            .filter(([_, commands]) => commands.length > 0) // Filtrer les catégories vides
            .map(([category, commands]) => {
                const pages = [];
                const commandsPerPage = 5; // Nombre de commandes par page
                for (let i = 0; i < commands.length; i += commandsPerPage) {
                    const pageCommands = commands.slice(i, i + commandsPerPage);
                    pages.push({
                        color: 0x0099ff,
                        title: `📜 Aide du bot - ${category} (Page ${Math.floor(i / commandsPerPage) + 1})`,
                        description: 'Voici la liste des commandes disponibles :',
                        fields: pageCommands.map(cmdName => {
                            const cmd = message.client.commands.get(cmdName);
                            return {
                                name: `\`${prefix}${cmdName}\``,
                                value: cmd?.description || 'Pas de description disponible'
                            };
                        }),
                        footer: {
                            text: `Demandé par ${message.author.tag}`,
                            icon_url: message.author.displayAvatarURL({ dynamic: true })
                        },
                        timestamp: new Date()
                    });
                }
                return pages;
            }).flat();

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
