const { PermissionsBitField } = require('discord.js');
const isOwner = require('../utils/isOwner');

module.exports = {
    name: 'helpall',
    description: 'Affiche toutes les commandes disponibles',
    permissions: 'Administrator',
    async execute(message, args) {
        if (!isOwner(message.author.id) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour voir toutes les commandes.');
        }

        const prefix = global.botConfig.prefix; // Utilise la config globale

        // Récupérer toutes les commandes
        const commands = message.client.commands.map(cmd => ({
            name: cmd.name,
            description: cmd.description || 'Pas de description disponible.',
            usage: cmd.usage || 'Non spécifié'
        }));

        // Créer un embed pour afficher toutes les commandes
        const helpEmbed = {
            color: 0x0099ff,
            title: '📜 Liste complète des commandes',
            description: `Utilisez \`${prefix}help <commande>\` pour plus d'informations sur une commande spécifique.`,
            fields: commands.map(cmd => ({
                name: `\`${prefix}${cmd.name}\``,
                value: `${cmd.description}\n**Usage:** \`${cmd.usage}\``
            })),
            footer: {
                text: `Demandé par ${message.author.tag}`,
                icon_url: message.author.displayAvatarURL({ dynamic: true })
            },
            timestamp: new Date()
        };

        try {
            await message.channel.send({ embeds: [helpEmbed] });
        } catch (error) {
            console.error('Erreur dans la commande helpall:', error);
            message.reply('❌ Une erreur est survenue lors de l\'affichage des commandes.');
        }
    }
};
