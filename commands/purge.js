const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'purge',
    description: 'Supprime les messages d\'un utilisateur spécifique dans ce salon.',
    usage: '+purge @utilisateur [nombre]',
    permissions: 'ManageMessages',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer les messages.');
        }

        const user = message.mentions.users.first();
        const amount = parseInt(args[1], 10) || 100;

        if (!user) {
            return message.reply('❌ Vous devez mentionner un utilisateur.');
        }

        if (isNaN(amount) || amount <= 0 || amount > 100) {
            return message.reply('❌ Veuillez spécifier un nombre valide entre 1 et 100.');
        }

        try {
            const messages = await message.channel.messages.fetch({ limit: amount });
            const userMessages = messages.filter(msg => msg.author.id === user.id);

            await message.channel.bulkDelete(userMessages, true);
            message.reply(`✅ ${userMessages.size} messages de ${user.tag} ont été supprimés.`);
        } catch (error) {
            console.error('Erreur lors de la suppression des messages :', error);
            message.reply('❌ Une erreur est survenue lors de la suppression des messages.');
        }
    }
};
