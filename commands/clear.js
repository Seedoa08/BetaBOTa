const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'clear',
    description: 'Supprime un certain nombre de messages dans le canal.',
    usage: '+clear [nombre] [--bots] [--users] [--from @user] [--before ID]',
    permissions: 'ManageMessages',
    variables: [
        { name: '[nombre]', description: 'Nombre de messages à supprimer (1-100)' },
        { name: '--bots', description: 'Supprimer uniquement les messages des bots' },
        { name: '--users', description: 'Supprimer uniquement les messages des utilisateurs' },
        { name: '--from @user', description: 'Supprimer les messages d\'un utilisateur spécifique' },
        { name: '--before ID', description: 'Supprimer les messages avant un message spécifique' }
    ],
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer les messages.');
        }

        if (!message.channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('❌ Je n\'ai pas la permission de supprimer des messages dans ce canal.');
        }

        const amount = parseInt(args[0], 10);
        if (isNaN(amount) || amount <= 0 || amount > 100) {
            return message.reply('❌ Veuillez spécifier un nombre valide entre 1 et 100.');
        }

        const options = {
            bots: args.includes('--bots'),
            users: args.includes('--users'),
            from: message.mentions.users.first(),
            before: args.find(arg => arg.startsWith('--before'))?.split(' ')[1]
        };

        args = args.filter(arg => !arg.startsWith('--'));

        try {
            let messages = await message.channel.messages.fetch({ 
                limit: amount,
                before: options.before
            });

            if (options.bots) messages = messages.filter(msg => msg.author.bot);
            if (options.users) messages = messages.filter(msg => !msg.author.bot);
            if (options.from) messages = messages.filter(msg => msg.author.id === options.from.id);

            const deleted = await message.channel.bulkDelete(messages, true);

            const clearEmbed = {
                color: 0x00ff00,
                description: `🧹 **${deleted.size}** messages supprimés.`,
                fields: []
            };

            if (options.from) clearEmbed.fields.push({ name: 'Filtre utilisateur', value: options.from.tag });
            if (options.bots) clearEmbed.fields.push({ name: 'Filtre', value: 'Messages de bots uniquement' });
            if (options.users) clearEmbed.fields.push({ name: 'Filtre', value: 'Messages d\'utilisateurs uniquement' });

            message.channel.send({ embeds: [clearEmbed] }).then(msg => {
                setTimeout(() => msg.delete(), 5000);
            });
        } catch (error) {
            console.error('Erreur lors de la suppression des messages:', error);
            message.reply('❌ Une erreur est survenue lors de la suppression des messages.');
        }
    }
};
