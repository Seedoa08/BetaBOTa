module.exports = {
    name: 'commandlist',
    description: 'Affiche la liste des commandes disponibles.',
    async execute(interaction) {
        const commands = interaction.client.commands.map(command => `**\`${command.name}\`**: ${command.description}`);
        const embed = {
            color: 0x00ff00,
            title: '📜 Liste des commandes',
            description: commands.join('\n'),
            timestamp: new Date()
        };

        interaction.reply({ embeds: [embed] });
    }
};
