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
            return message.reply('❌ Je n\'ai pas la permission de gérer les messages dans ce canal.');
        }

        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply('❌ Veuillez fournir un nombre valide de messages à supprimer (1-100).');
        }

        if (amount > 50) {
            const confirmationMessage = await message.reply(`⚠️ Vous êtes sur le point de supprimer ${amount} messages. Répondez par \`oui\` ou \`non\`.`);
            const filter = response => response.author.id === message.author.id && ['oui', 'non'].includes(response.content.toLowerCase());
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 15000 });

            if (!collected.size || collected.first().content.toLowerCase() === 'non') {
                return message.reply('❌ Suppression annulée.');
            }
        }

        try {
            let amount = parseInt(args[0]);
            if (isNaN(amount) || amount < 1 || amount > 100) {
                return message.reply('❌ Veuillez spécifier un nombre entre 1 et 100.');
            }

            // Récupérer les filtres
            const fromUser = message.mentions.users.first();
            const botsOnly = args.includes('--bots');
            const usersOnly = args.includes('--users');

            // Récupérer les messages
            const messages = await message.channel.messages.fetch({ limit: 100 });
            let filtered = messages;

            // Appliquer les filtres
            if (fromUser) {
                filtered = filtered.filter(msg => msg.author.id === fromUser.id);
            }
            if (botsOnly) {
                filtered = filtered.filter(msg => msg.author.bot);
            }
            if (usersOnly) {
                filtered = filtered.filter(msg => !msg.author.bot);
            }

            // Convertir en array et limiter au nombre demandé
            const toDelete = Array.from(filtered.values()).slice(0, amount);

            // Vérifier l'âge des messages
            const now = Date.now();
            const twoWeeksAgo = now - (14 * 24 * 60 * 60 * 1000);
            const recent = toDelete.filter(msg => msg.createdTimestamp > twoWeeksAgo);
            const old = toDelete.filter(msg => msg.createdTimestamp <= twoWeeksAgo);

            // Supprimer les messages
            if (recent.length > 0) {
                await message.channel.bulkDelete(recent, true);
            }

            // Supprimer les messages plus anciens un par un
            for (const msg of old) {
                try {
                    await msg.delete();
                } catch (err) {
                    console.error(`Impossible de supprimer le message ${msg.id}:`, err);
                }
            }

            // Message de confirmation
            const totalDeleted = recent.length + old.length;
            const confirmEmbed = {
                color: 0x00ff00,
                description: `✅ ${totalDeleted} message${totalDeleted > 1 ? 's' : ''} supprimé${totalDeleted > 1 ? 's' : ''}.`,
                fields: []
            };

            if (fromUser) {
                confirmEmbed.fields.push({ name: 'Utilisateur ciblé', value: fromUser.tag });
            }
            if (botsOnly) {
                confirmEmbed.fields.push({ name: 'Type', value: 'Messages de bots uniquement' });
            }
            if (usersOnly) {
                confirmEmbed.fields.push({ name: 'Type', value: 'Messages d\'utilisateurs uniquement' });
            }

            const confirmation = await message.channel.send({ embeds: [confirmEmbed] });
            setTimeout(() => confirmation.delete().catch(() => {}), 5000);

        } catch (error) {
            console.error('Erreur dans la commande clear:', error);
            message.reply('❌ Une erreur est survenue lors de la suppression des messages.');
        }
    }
};

