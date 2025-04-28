const { PermissionsBitField } = require('discord.js');
const isOwner = require('../utils/isOwner');

module.exports = {
    name: 'raid',
    description: 'Gère les paramètres anti-raid',
    usage: '+raid <on/off>',
    permissions: 'Administrator',
    variables: [
        { name: 'on', description: 'Active le mode raid immédiatement' },
        { name: 'off', description: 'Désactive le mode raid' }
    ],
    async execute(message, args) {
        // Bypass des permissions pour les owners
        if (!isOwner(message.author.id) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour gérer l\'anti-raid.');
        }

        const action = args[0]?.toLowerCase();
        if (!['on', 'off'].includes(action)) {
            return message.reply('❌ Utilisation: `+raid on` ou `+raid off`');
        }

        try {
            if (action === 'on') {
                // Actions immédiates de protection
                await message.guild.setVerificationLevel(4); // Niveau le plus élevé
                
                // Verrouiller tous les canaux publics
                const channels = message.guild.channels.cache.filter(c => c.type === 0); // 0 = GUILD_TEXT
                await Promise.all(channels.map(channel => 
                    channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                        SendMessages: false,
                        CreateInstantInvite: false
                    })
                ));

                // Désactiver création d'invitations
                await message.guild.roles.everyone.setPermissions([]);

                const raidEmbed = {
                    color: 0xff0000,
                    title: '🚨 MODE RAID ACTIVÉ',
                    description: 'Mesures de protection activées:\n' +
                        '• Niveau de vérification maximal\n' +
                        '• Canaux verrouillés\n' +
                        '• Invitations désactivées',
                    timestamp: new Date()
                };

                message.channel.send({ embeds: [raidEmbed] });

            } else {
                // Restaurer les paramètres normaux
                await message.guild.setVerificationLevel(2); // Niveau moyen
                
                // Déverrouiller les canaux
                const channels = message.guild.channels.cache.filter(c => c.type === 0);
                await Promise.all(channels.map(channel => 
                    channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                        SendMessages: true,
                        CreateInstantInvite: null
                    })
                ));

                const endRaidEmbed = {
                    color: 0x00ff00,
                    title: '✅ MODE RAID DÉSACTIVÉ',
                    description: 'Les paramètres du serveur ont été restaurés.',
                    timestamp: new Date()
                };

                message.channel.send({ embeds: [endRaidEmbed] });
            }
        } catch (error) {
            console.error('Erreur lors de la gestion du mode raid:', error);
            message.reply('❌ Une erreur est survenue lors de l\'exécution de la commande.');
        }
    }
};
