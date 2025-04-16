const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'anti-raid',
    description: 'Configure le système anti-raid',
    usage: '+anti-raid <enable/disable/settings> [options]',
    permissions: 'Administrator',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Cette commande nécessite les permissions Administrateur');
        }

        const action = args[0]?.toLowerCase();
        const antiRaid = message.client.antiRaid;

        switch(action) {
            case 'enable':
                await antiRaid.enableRaidMode(message.guild, 'Activation manuelle par ' + message.author.tag);
                message.reply('✅ Mode anti-raid activé');
                break;

            case 'disable':
                await antiRaid.disableRaidMode(message.guild);
                message.reply('✅ Mode anti-raid désactivé');
                break;

            case 'settings':
                // Afficher/modifier les paramètres
                const settings = antiRaid.getSettings(message.guild.id);
                const embed = {
                    color: 0x0099ff,
                    title: '⚙️ Paramètres Anti-Raid',
                    fields: Object.entries(settings).map(([key, value]) => ({
                        name: key,
                        value: String(value),
                        inline: true
                    }))
                };
                message.channel.send({ embeds: [embed] });
                break;

            default:
                message.reply('❌ Action invalide. Utilisez `enable`, `disable` ou `settings`');
        }
    }
};
