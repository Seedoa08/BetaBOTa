const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const isOwner = require('../utils/isOwner');

module.exports = {
    name: 'ticket',
    description: 'Gère le système de tickets',
    usage: '+ticket <create/close>',
    permissions: 'ManageChannels',
    async execute(message, args) {
        // Bypass des permissions pour les owners
        if (!isOwner(message.author.id) && !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer les tickets.');
        }

        const subCommand = args[0]?.toLowerCase();

        switch (subCommand) {
            case 'create':
                try {
                    const ticketChannel = await message.guild.channels.create({
                        name: `ticket-${message.author.username}`,
                        type: 0, // Text channel
                        permissionOverwrites: [
                            {
                                id: message.guild.roles.everyone.id,
                                deny: [PermissionsBitField.Flags.ViewChannel]
                            },
                            {
                                id: message.author.id,
                                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                            }
                        ]
                    });

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('close-ticket')
                            .setLabel('Fermer le ticket')
                            .setStyle(ButtonStyle.Danger)
                    );

                    await ticketChannel.send({
                        content: `🎫 Ticket créé pour <@${message.author.id}>`,
                        components: [row]
                    });

                    message.reply(`✅ Votre ticket a été créé : <#${ticketChannel.id}>`);
                } catch (error) {
                    console.error('Erreur lors de la création du ticket:', error);
                    message.reply('❌ Une erreur est survenue lors de la création du ticket.');
                }
                break;

            case 'close':
                if (!message.channel.name.startsWith('ticket-')) {
                    return message.reply('❌ Cette commande ne peut être utilisée que dans un canal de ticket.');
                }

                try {
                    await message.channel.delete();
                } catch (error) {
                    console.error('Erreur lors de la suppression du ticket:', error);
                    message.reply('❌ Une erreur est survenue lors de la fermeture du ticket.');
                }
                break;

            default:
                message.reply('❌ Utilisation : `+ticket <create/close>`');
        }
    }
};
