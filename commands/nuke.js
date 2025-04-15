const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'nuke',
    description: 'Recrée un salon pour le nettoyer complètement',
    usage: '+nuke [raison]',
    permissions: 'ManageChannels',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer les canaux.');
        }

        const reason = args.join(' ') || 'Nettoyage du salon';

        try {
            const position = message.channel.position;
            const permissions = message.channel.permissionOverwrites.cache;
            const name = message.channel.name;

            // Confirmation
            const confirm = await message.reply('⚠️ Êtes-vous sûr de vouloir nuker ce salon ? (`oui`/`non`)');
            const filter = m => m.author.id === message.author.id && ['oui', 'non'].includes(m.content.toLowerCase());
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 15000 });

            if (!collected.size || collected.first().content.toLowerCase() === 'non') {
                return message.reply('❌ Nuke annulé.');
            }

            const newChannel = await message.channel.clone({
                position: position,
                reason: `Nuke par ${message.author.tag}: ${reason}`
            });

            await message.channel.delete();
            
            const nukeEmbed = {
                color: 0xff0000,
                title: '💥 Salon nucléarisé',
                description: 'Ce salon a été complètement nettoyé.',
                fields: [
                    { name: 'Modérateur', value: message.author.tag },
                    { name: 'Raison', value: reason }
                ],
                timestamp: new Date()
            };

            await newChannel.send({ embeds: [nukeEmbed] });
        } catch (error) {
            console.error('Erreur lors du nuke:', error);
            message.reply('❌ Une erreur est survenue lors du nuke.');
        }
    }
};
