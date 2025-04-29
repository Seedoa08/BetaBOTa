const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'version',
    description: 'Affiche la version actuelle du bot',
    usage: '+version',
    permissions: null,
    async execute(message) {
        try {
            const packagePath = path.join(__dirname, '../package.json');
            const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

            const versionEmbed = {
                color: 0x0099ff,
                title: '🤖 Version du bot',
                fields: [
                    {
                        name: 'Version actuelle',
                        value: `${packageData.version}`,
                        inline: true
                    },
                    {
                        name: 'État',
                        value: 'STABLE',
                        inline: true
                    },
                    {
                        name: 'Dernière mise à jour',
                        value: `<t:${Math.floor(Date.now() / 1000)}:R>`,
                        inline: true
                    }
                ],
                footer: {
                    text: `Demandé par ${message.author.tag}`,
                    icon_url: message.author.displayAvatarURL({ dynamic: true })
                },
                timestamp: new Date()
            };

            await message.channel.send({ embeds: [versionEmbed] });
        } catch (error) {
            console.error('Erreur commande version:', error);
            message.reply('❌ Une erreur est survenue lors de la récupération de la version.');
        }
    }
};
