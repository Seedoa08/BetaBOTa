const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'purge',
    description: 'Supprime massivement des messages avec des options avancées',
    usage: '+purge <nombre> [options]',
    permissions: 'ManageMessages',
    variables: [
        { name: 'nombre', description: 'Nombre de messages à supprimer (max 1000)' },
        { name: '--bots', description: 'Supprime uniquement les messages des bots' },
        { name: '--users', description: 'Supprime uniquement les messages des utilisateurs' },
        { name: '--from @user', description: 'Supprime les messages d\'un utilisateur spécifique' },
        { name: '--contains "texte"', description: 'Supprime les messages contenant un texte spécifique' },
        { name: '--force', description: 'Force la suppression même des messages plus anciens que 14 jours' }
    ],
    async execute(message, args) {
        // Vérification des permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer les messages.');
        }

        // Parsing des arguments
        let amount = parseInt(args[0]);
        const options = {
            bots: args.includes('--bots'),
            users: args.includes('--users'),
            force: args.includes('--force'),
            from: message.mentions.users.first(),
            contains: args.join(' ').match(/--contains "([^"]+)"/)?.[1]
        };

        if (isNaN(amount) || amount < 1) {
            return message.reply('❌ Veuillez spécifier un nombre valide de messages à supprimer.');
        }

        // Limite à 1000 messages maximum pour éviter les abus
        amount = Math.min(amount, 1000);

        try {
            let messages = [];
            let lastId;

            // Boucle de récupération des messages par lots de 100
            while (messages.length < amount) {
                const options = { limit: 100 };
                if (lastId) options.before = lastId;
                
                const fetchedMessages = await message.channel.messages.fetch(options);
                if (fetchedMessages.size === 0) break;
                
                lastId = fetchedMessages.last().id;
                messages.push(...fetchedMessages.values());
                
                if (messages.length >= amount) {
                    messages = messages.slice(0, amount);
                    break;
                }
            }

            // Filtrage des messages selon les options
            messages = messages.filter(msg => {
                if (options.bots && !msg.author.bot) return false;
                if (options.users && msg.author.bot) return false;
                if (options.from && msg.author.id !== options.from.id) return false;
                if (options.contains && !msg.content.includes(options.contains)) return false;
                return true;
            });

            // Suppression des messages
            let deleted = 0;
            if (options.force) {
                // Suppression message par message pour les messages anciens
                for (const msg of messages) {
                    try {
                        await msg.delete();
                        deleted++;
                    } catch (e) {
                        continue;
                    }
                }
            } else {
                // Suppression en masse pour les messages récents
                const chunks = [];
                for (let i = 0; i < messages.length; i += 100) {
                    chunks.push(messages.slice(i, i + 100));
                }

                for (const chunk of chunks) {
                    const deletable = chunk.filter(m => Date.now() - m.createdTimestamp < 1209600000);
                    if (deletable.length > 0) {
                        const deletedMessages = await message.channel.bulkDelete(deletable, true);
                        deleted += deletedMessages.size;
                    }
                }
            }

            // Message de confirmation
            const reply = await message.channel.send(
                `✅ ${deleted} messages ont été supprimés.`
            );
            setTimeout(() => reply.delete().catch(() => {}), 5000);

        } catch (error) {
            console.error('Erreur lors de la purge:', error);
            message.reply('❌ Une erreur est survenue lors de la suppression des messages.');
        }
    }
};
