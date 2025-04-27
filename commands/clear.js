const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'clear',
    description: 'Supprime un certain nombre de messages ou des messages spécifiques.',
    usage: '+clear <nombre> [--bots | --users | --mentions | --from @utilisateur]',
    permissions: 'ManageMessages',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer les messages.');
        }

        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply('❌ Veuillez fournir un nombre valide de messages à supprimer (1-100).');
        }

        const filterOptions = {
            bots: args.includes('--bots'),
            users: args.includes('--users'),
            mentions: args.includes('--mentions'),
            from: message.mentions.users.first()
        };

        try {
            const messages = await message.channel.messages.fetch({ limit: 100 });
            let filteredMessages = messages;

            if (filterOptions.bots) {
                filteredMessages = filteredMessages.filter(msg => msg.author.bot);
            } else if (filterOptions.users) {
                filteredMessages = filteredMessages.filter(msg => !msg.author.bot);
            } else if (filterOptions.mentions) {
                filteredMessages = filteredMessages.filter(msg => msg.mentions.users.size > 0);
            } else if (filterOptions.from) {
                filteredMessages = filteredMessages.filter(msg => msg.author.id === filterOptions.from.id);
            }

            const messagesToDelete = filteredMessages.slice(0, amount);
            await message.channel.bulkDelete(messagesToDelete, true);

            return message.reply(`✅ ${messagesToDelete.size} message(s) supprimé(s).`).then(msg => setTimeout(() => msg.delete(), 5000));
        } catch (error) {
            console.error('Erreur dans la commande clear:', error);
            return message.reply('❌ Une erreur est survenue lors de la suppression des messages.');
        }
    }
};

