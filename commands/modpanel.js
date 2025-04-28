const { PermissionsBitField } = require('discord.js');
const isOwner = require('../utils/isOwner');

module.exports = {
    name: 'modpanel',
    description: 'Affiche le panneau de modération',
    usage: '+modpanel',
    permissions: 'Administrator',
    async execute(message, args) {
        // Bypass des permissions pour les owners
        if (!isOwner(message.author.id) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande.');
        }

        const panel = {
            embeds: [{

                color: 0x0099ff,
                title: '🛡️ Panneau de Modération',
                description: 'Utilisez les boutons ci-dessous pour effectuer des actions rapides.',
                fields: [
                    { name: '🔒 Mode Raid', value: 'Active/désactive le mode anti-raid' },
                    { name: '🧹 Nettoyage', value: 'Supprime les messages récents' },
                    { name: '📊 Stats', value: 'Affiche les statistiques de modération' },
                    { name: '⚡ Actions Rapides', value: 'Accès aux commandes fréquentes' }
                ]
            }],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('raid_mode')
                        .setLabel('Mode Raid')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('quick_clear')
                        .setLabel('Nettoyage')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('mod_stats')
                        .setLabel('Statistiques')
                        .setStyle(ButtonStyle.Secondary)
                )
            ]
        };

        const panelMsg = await message.channel.send(panel);

        const collector = panelMsg.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 600000
        });

        collector.on('collect', async i => {
            switch(i.customId) {
                case 'raid_mode':
                    // Action pour le mode raid
                    break;
                case 'quick_clear':
                    // Action pour le nettoyage rapide
                    break;
                case 'mod_stats':
                    // Afficher les stats
                    break;
            }
        });
    }
};
