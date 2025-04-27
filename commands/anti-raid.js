const serverConfig = require('../utils/serverConfig');

module.exports = {
    name: 'anti-raid',
    description: 'Active ou désactive la protection anti-raid.',
    usage: '+anti-raid <on/off>',
    permissions: 'ManageGuild',
    async execute(message, args) {
        if (!message.member.permissions.has('ManageGuild')) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer l\'anti-raid.');
        }

        const action = args[0]?.toLowerCase();
        if (!['on', 'off'].includes(action)) {
            return message.reply('❌ Utilisation invalide. Utilisez `+anti-raid <on/off>`.');
        }

        const isEnabled = action === 'on';
        serverConfig.updateConfig(message.guild.id, { antiRaid: isEnabled });

        return message.reply(`✅ Protection anti-raid ${isEnabled ? 'activée' : 'désactivée'}.`);
    }
};
