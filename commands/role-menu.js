const { PermissionsBitField } = require('discord.js');
const isOwner = require('../utils/isOwner');

module.exports = {
    name: 'role-menu',
    description: 'Crée un menu de rôles',
    usage: '+role-menu setup',
    permissions: 'ManageRoles',
    variables: [
        { name: 'setup', description: 'Configure le menu de rôles' }
    ],
    async execute(message, args) {
        // Bypass des permissions pour les owners
        if (!isOwner(message.author.id) && !message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer les rôles.');
        }

        const menu = new StringSelectMenuBuilder()
            .setCustomId('role_select')
            .setPlaceholder('Sélectionnez vos rôles')
            .setMinValues(0)
            .setMaxValues(5);

        // Ajout des rôles disponibles
        message.guild.roles.cache
            .filter(role => !role.managed && role.name !== '@everyone')
            .forEach(role => {
                menu.addOptions({
                    label: role.name,
                    value: role.id,
                    description: `Obtenir le rôle ${role.name}`,
                    emoji: '🎭'
                });
            });

        const row = new ActionRowBuilder().addComponents(menu);
        
        const embed = {
            color: 0x0099ff,
            title: '🎭 Menu des Rôles',
            description: 'Sélectionnez les rôles que vous souhaitez avoir',
            footer: { text: 'Vous pouvez sélectionner jusqu\'à 5 rôles' }
        };

        await message.channel.send({ embeds: [embed], components: [row] });
    }
};
