const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'nuke',
    description: 'Recrée le salon à neuf (supprime tous les messages).',
    usage: '+nuke [raison]',
    permissions: 'ManageChannels',
    variables: [
        { name: 'raison', description: 'Raison du nuke (facultatif)' }
    ],
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer les salons.');
        }

        const reason = args.join(' ') || 'Aucune raison fournie';

        try {
            const position = message.channel.position;
            const newChannel = await message.channel.clone();
            await message.channel.delete();
            await newChannel.setPosition(position);
            
            const nukeEmbed = {
                color: 0xff0000,
                title: '💥 Canal recréé',
                description: `Le canal a été nuke par ${message.author.tag}`,
                fields: [{ name: 'Raison', value: reason }],
                timestamp: new Date()
            };

            newChannel.send({ embeds: [nukeEmbed] });
        } catch (error) {
            message.reply('❌ Une erreur est survenue lors du nuke.');
        }
    }
};
