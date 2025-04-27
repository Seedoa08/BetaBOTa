const { PermissionsBitField } = require('discord.js');
const serverConfig = require('../utils/serverConfig');

module.exports = {
    name: 'automod',
    description: 'Configure l\'auto-modération du serveur',
    usage: '+automod <on/off/config/status>',
    permissions: 'Administrator',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande.');
        }

        const config = serverConfig.getConfig(message.guild.id);
        const action = args[0]?.toLowerCase();

        switch (action) {
            case 'on':
                serverConfig.updateConfig(message.guild.id, { automod: true });
                return message.reply('✅ Auto-modération activée.');

            case 'off':
                serverConfig.updateConfig(message.guild.id, { automod: false });
                return message.reply('✅ Auto-modération désactivée.');

            case 'config':
                const setting = args[1]?.toLowerCase();
                const value = args[2];

                if (!setting || !value) {
                    return message.reply('❌ Usage: `+automod config <setting> <valeur>`\n' +
                        'Settings disponibles:\n' +
                        '• `maxmentions` (1-20)\n' +
                        '• `maxemojis` (1-50)\n' +
                        '• `maxcaps` (50-100)\n' +
                        '• `maxlines` (1-50)');
                }

                const numValue = parseInt(value);
                const limits = {
                    maxmentions: { min: 1, max: 20 },
                    maxemojis: { min: 1, max: 50 },
                    maxcaps: { min: 50, max: 100 },
                    maxlines: { min: 1, max: 50 }
                };

                if (!limits[setting]) {
                    return message.reply('❌ Paramètre invalide.');
                }

                if (isNaN(numValue) || numValue < limits[setting].min || numValue > limits[setting].max) {
                    return message.reply(`❌ La valeur doit être entre ${limits[setting].min} et ${limits[setting].max}.`);
                }

                config[setting] = numValue;
                serverConfig.updateConfig(message.guild.id, config);
                return message.reply(`✅ \`${setting}\` défini sur ${numValue}.`);

            case 'status':
                const statusEmbed = {
                    color: config.automod ? 0x00FF00 : 0xFF0000,
                    title: '⚙️ État de l\'Auto-Modération',
                    fields: [
                        { name: 'État', value: config.automod ? '✅ Activé' : '❌ Désactivé', inline: false },
                        { name: 'Mentions max', value: `${config.maxmentions || 5}`, inline: true },
                        { name: 'Emojis max', value: `${config.maxemojis || 20}`, inline: true },
                        { name: 'Majuscules max', value: `${config.maxcaps || 70}%`, inline: true },
                        { name: 'Lignes max', value: `${config.maxlines || 10}`, inline: true }
                    ],
                    footer: { text: 'Utilisez +automod config pour modifier les paramètres' }
                };
                return message.reply({ embeds: [statusEmbed] });

            default:
                return message.reply('❌ Usage: `+automod <on/off/config/status>`');
        }
    }
};
