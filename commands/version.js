const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'version',
    description: 'Affiche la version actuelle du bot',
    usage: '+version',
    category: 'Utilitaire',
    permissions: null,
    async execute(message) {
        const packagePath = path.join(__dirname, '../package.json');
        const configPath = path.join(__dirname, '../config.json');

        try {
            const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('🔄 Version du bot')
                .setDescription(`Version actuelle: \`${configData.version}\``)
                .addFields(
                    { name: 'Dernière mise à jour', value: new Date().toLocaleDateString(), inline: true },
                    { name: 'Package version', value: packageData.version, inline: true }
                )
                .setFooter({ text: 'Le bot met à jour sa version à chaque redémarrage' })
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erreur dans la commande version:', error);
            await message.reply('❌ Une erreur est survenue lors de la récupération de la version.');
        }
    }
};
