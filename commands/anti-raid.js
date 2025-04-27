const { PermissionsBitField } = require('discord.js');
const serverConfig = require('../utils/serverConfig');

module.exports = {
    name: 'anti-raid',
    description: 'Gère la protection anti-raid du serveur',
    usage: '+anti-raid <on/off/setup/status>',
    permissions: 'Administrator',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande.');
        }

        const action = args[0]?.toLowerCase();
        const config = serverConfig.getConfig(message.guild.id);

        // Si pas d'arguments, afficher l'aide
        if (!action) {
            const helpEmbed = {
                color: 0x0099ff,
                title: '🛡️ Aide Anti-Raid',
                description: 'Le système anti-raid protège votre serveur contre les raids et les attaques massives.',
                fields: [
                    {
                        name: 'Commandes disponibles',
                        value: [
                            '`+anti-raid on` - Active la protection',
                            '`+anti-raid off` - Désactive la protection',
                            '`+anti-raid status` - Affiche l\'état actuel',
                            '`+anti-raid setup` - Configure les paramètres'
                        ].join('\n')
                    },
                    {
                        name: 'Fonctionnalités',
                        value: [
                            '• Détection des joins massifs',
                            '• Vérification des comptes suspects',
                            '• Protection contre le spam',
                            '• Blocage automatique des raids',
                            '• Notifications aux modérateurs'
                        ].join('\n')
                    },
                    {
                        name: 'Actions automatiques',
                        value: 'En cas de raid détecté :\n• Expulsion des nouveaux comptes suspects\n• Verrouillage temporaire des salons\n• Alertes dans le salon de logs'
                    }
                ],
                footer: { text: 'Protection 24/7 de votre serveur' }
            };
            return message.reply({ embeds: [helpEmbed] });
        }

        switch (action) {
            case 'on':
                serverConfig.updateConfig(message.guild.id, { 
                    antiRaid: true,
                    raidMode: {
                        enabled: true,
                        joinThreshold: 5,
                        timeWindow: 10000,
                        action: 'kick'
                    }
                });
                return message.reply({
                    embeds: [{
                        color: 0x00ff00,
                        title: '✅ Protection anti-raid activée',
                        description: 'Le serveur est maintenant protégé contre les raids.',
                        fields: [
                            { name: 'Mode', value: 'Actif et en surveillance', inline: true },
                            { name: 'Sécurité', value: 'Protection maximale', inline: true }
                        ]
                    }]
                });

            case 'off':
                serverConfig.updateConfig(message.guild.id, { antiRaid: false });
                return message.reply({
                    embeds: [{
                        color: 0xff0000,
                        title: '🛑 Protection anti-raid désactivée',
                        description: 'La protection du serveur a été désactivée.\n⚠️ Le serveur est maintenant vulnérable aux raids.'
                    }]
                });

            case 'status':
                const statusEmbed = {
                    color: config.antiRaid ? 0x00ff00 : 0xff0000,
                    title: '📊 État de la protection anti-raid',
                    fields: [
                        { name: 'État', value: config.antiRaid ? '✅ Activée' : '❌ Désactivée', inline: true },
                        { name: 'Mode', value: config.raidMode?.enabled ? '🛡️ Sécurité renforcée' : '🛡️ Normal', inline: true },
                        { name: 'Paramètres actuels', value: [
                            `Seuil de joins: ${config.raidMode?.joinThreshold || 5} joins`,
                            `Fenêtre de temps: ${config.raidMode?.timeWindow ? (config.raidMode.timeWindow/1000) : 10}s`,
                            `Action: ${config.raidMode?.action || 'kick'}`
                        ].join('\n') },
                        { name: 'Dernière activation', value: config.lastActivation ? `<t:${Math.floor(config.lastActivation/1000)}:R>` : 'Jamais' }
                    ],
                    footer: { text: 'Utilisez +anti-raid setup pour modifier les paramètres' }
                };
                return message.reply({ embeds: [statusEmbed] });

            case 'setup':
                // Interface de configuration à venir
                return message.reply('🛠️ La configuration détaillée sera disponible dans la prochaine mise à jour.');

            default:
                return message.reply('❌ Action invalide. Utilisez `on`, `off`, `status` ou `setup`.');
        }
    }
};
