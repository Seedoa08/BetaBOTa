const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'purge',
    description: 'Supprime des messages selon des critères spécifiques',
    usage: '+purge <type> [quantité]',
    permissions: 'ManageMessages',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('❌ Permission manquante: Gérer les messages');
        }

        const type = args[0]?.toLowerCase();
        const amount = parseInt(args[1]) || 100;

        if (amount > 100) return message.reply('❌ Maximum: 100 messages');

        const messages = await message.channel.messages.fetch({ limit: 100 });
        let filtered;

        switch(type) {
            case 'bots':
                filtered = messages.filter(m => m.author.bot);
                break;
            case 'files':
                filtered = messages.filter(m => m.attachments.size > 0);
                break;
            case 'links':
                filtered = messages.filter(m => m.content.match(/https?:\/\/[^\s]+/));
                break;
            case 'embeds':
                filtered = messages.filter(m => m.embeds.length > 0);
                break;
            default:
                return message.reply('❌ Type invalide. Utilisez: bots, files, links, embeds');
        }

        filtered = Array.from(filtered.values()).slice(0, amount);

        try {
            const deleted = await message.channel.bulkDelete(filtered);
            message.reply({
                content: `✅ ${deleted.size} messages supprimés.`,
                allowedMentions: { repliedUser: false }
            }).then(msg => setTimeout(() => msg.delete(), 5000));
        } catch (error) {
            message.reply('❌ Erreur lors de la suppression');
        }
    }
};
