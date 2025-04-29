const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'helpall',
    description: 'Affiche toutes les commandes disponibles',
    usage: '+helpall',
    category: 'Utilitaire',
    permissions: null,
    async execute(message) {
        const commands = [...message.client.commands.values()];
        const commandsPerPage = 10;
        const pages = [];
        
        // Trier les commandes par ordre alphabétique
        commands.sort((a, b) => a.name.localeCompare(b.name));
        
        // Diviser les commandes en pages
        for (let i = 0; i < commands.length; i += commandsPerPage) {
            const currentCommands = commands.slice(i, i + commandsPerPage);
            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('📖 Liste complète des commandes')
                .setDescription(currentCommands.map(cmd => {
                    return [
                        `**${cmd.name}**`,
                        `Description: ${cmd.description || 'Aucune description'}`,
                        `Usage: \`${cmd.usage || `+${cmd.name}`}\``,
                        `Permission: ${cmd.permissions || 'Aucune'}`,
                        ''
                    ].join('\n');
                }).join('\n'))
                .setFooter({ 
                    text: `Page ${Math.floor(i / commandsPerPage) + 1}/${Math.ceil(commands.length / commandsPerPage)}`,
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp();
            
            pages.push(embed);
        }

        let currentPage = 0;

        const getButtons = (currentPage) => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('helpall_first')
                    .setLabel('⏪')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId('helpall_prev')
                    .setLabel('◀️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId('helpall_next')
                    .setLabel('▶️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === pages.length - 1),
                new ButtonBuilder()
                    .setCustomId('helpall_last')
                    .setLabel('⏩')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === pages.length - 1)
            );
        };

        const helpMessage = await message.reply({
            embeds: [pages[currentPage]],
            components: [getButtons(currentPage)]
        });

        const filter = i => i.user.id === message.author.id && i.message.id === helpMessage.id;
        const collector = helpMessage.createMessageComponentCollector({
            filter,
            time: 60000
        });

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) {
                return i.reply({ 
                    content: '❌ Vous ne pouvez pas utiliser ces boutons.', 
                    flags: 1 << 6 // Correction ici
                });
            }

            switch (i.customId) {
                case 'helpall_first': currentPage = 0; break;
                case 'helpall_prev': currentPage = Math.max(0, currentPage - 1); break;
                case 'helpall_next': currentPage = Math.min(pages.length - 1, currentPage + 1); break;
                case 'helpall_last': currentPage = pages.length - 1; break;
            }

            const newRow = getButtons(currentPage);

            await i.deferUpdate();
            await i.message.edit({
                embeds: [pages[currentPage]],
                components: [newRow]
            });
        });

        collector.on('end', () => {
            helpMessage.edit({ components: [] }).catch(() => {});
        });
    }
};
