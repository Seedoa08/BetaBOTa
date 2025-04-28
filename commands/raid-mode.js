const { PermissionsBitField } = require('discord.js');
const isOwner = require('../utils/isOwner');

module.exports = {
    name: 'raid-mode',
    description: 'Active/désactive le mode raid',
    usage: '+raid-mode <on/off> [--strict] [--lockdown]',
    permissions: 'Administrator',
    variables: [
        { name: '--strict', description: 'Mode strict avec vérification renforcée' },
        { name: '--lockdown', description: 'Verrouille tous les canaux en cas de raid' }
    ],
    async execute(message, args) {
        // Bypass des permissions pour les owners
        if (!isOwner(message.author.id) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande.');
        }

        const action = args[0]?.toLowerCase();
        const strict = args.includes('--strict');
        const lockdown = args.includes('--lockdown');

        if (!['on', 'off'].includes(action)) {
            return message.reply('❌ Utilisez `on` ou `off` pour gérer le mode anti-raid.');
        }

        if (action === 'on') {
            // Configuration du détecteur de raid
            const raidDetector = new RaidDetection({
                joinThreshold: strict ? 5 : 10,
                timeWindow: 30000,
                messageThreshold: strict ? 15 : 20
            });

            // Événement de détection de raid
            raidDetector.on('raidDetected', async (data) => {
                const { guild, score, suspiciousUsers } = data;

                const logEmbed = {
                    color: 0xff0000,
                    title: '🚨 RAID DÉTECTÉ',
                    description: 'Des activités suspectes ont été détectées!',
                    fields: [
                        { name: 'Score de menace', value: `${(score * 100).toFixed(2)}%` },
                        { name: 'Comptes suspects', value: `${suspiciousUsers.length} utilisateurs` }
                    ],
                    timestamp: new Date()
                };

                // Actions automatiques
                if (lockdown) {
                    await guild.channels.cache.forEach(async channel => {
                        if (channel.manageable) {
                            await channel.permissionOverwrites.edit(guild.roles.everyone, {
                                SendMessages: false,
                                AddReactions: false
                            });
                        }
                    });
                    logEmbed.fields.push({ name: '🔒 Action', value: 'Serveur verrouillé automatiquement' });
                }

                const modChannel = guild.channels.cache.find(c => 
                    c.name.includes('mod-logs') || c.name.includes('moderation')
                );

                if (modChannel) {
                    await modChannel.send({ embeds: [logEmbed] });
                }
            });

            message.reply({
                embeds: [{
                    color: 0x00ff00,
                    title: '🛡️ Mode Anti-Raid Activé',
                    description: `Protection configurée avec succès\n${strict ? '⚠️ Mode strict activé\n' : ''}${lockdown ? '🔒 Verrouillage automatique activé' : ''}`,
                    timestamp: new Date()
                }]
            });
        } else {
            // Désactivation du mode raid
            message.reply({
                embeds: [{
                    color: 0xff9900,
                    title: '🛡️ Mode Anti-Raid Désactivé',
                    description: 'La protection anti-raid a été désactivée',
                    timestamp: new Date()
                }]
            });
        }
    }
};
