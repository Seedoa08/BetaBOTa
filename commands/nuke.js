const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'nuke',
    description: 'Recrée le canal à zéro (purge complète)',
    usage: '+nuke [raison]',
    permissions: 'Administrator',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Cette commande nécessite les permissions Administrateur.');
        }

        const confirmEmbed = {
            color: 0xFF0000,
            title: '⚠️ Confirmation de nuke',
            description: 'Cette action va supprimer et recréer le canal. Êtes-vous sûr?\nRépondez par `oui` pour confirmer.'
        };

        const confirm = await message.reply({ embeds: [confirmEmbed] });
        
        try {
            const collected = await message.channel.awaitMessages({
                filter: m => m.author.id === message.author.id && ['oui', 'non'].includes(m.content.toLowerCase()),
                max: 1,
                time: 30000
            });

            if (!collected.size || collected.first().content.toLowerCase() !== 'oui') {
                return message.reply('❌ Nuke annulé.');
            }

            const position = message.channel.position;
            const newChannel = await message.channel.clone();
            await message.channel.delete();
            await newChannel.setPosition(position);

            const nukeEmbed = {
                color: 0x00FF00,
                title: '💥 Canal recréé',
                description: args.join(' ') || 'Aucune raison fournie',
                footer: { text: `Action par ${message.author.tag}` }
            };

            await newChannel.send({ embeds: [nukeEmbed] });
        } catch (error) {
            console.error('Erreur nuke:', error);
            message.reply('❌ Une erreur est survenue lors du nuke.');
        }
    }
};
