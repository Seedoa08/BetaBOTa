const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../data/welcomeConfig.json');

module.exports = async (member) => {
    if (!fs.existsSync(configPath)) return;
    
    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (!config.enabled || !config.channelId) return;

        const channel = member.guild.channels.cache.get(config.channelId);
        if (!channel) return;

        const welcomeEmbed = {
            color: parseInt(config.color?.replace('#', '') || '0099ff', 16),
            title: '👋 Bienvenue !',
            description: config.message
                .replace('{user}', member.toString())
                .replace('{server}', member.guild.name)
                .replace('{count}', member.guild.memberCount),
            thumbnail: {
                url: member.user.displayAvatarURL({ dynamic: true })
            },
            footer: {
                text: config.footer.replace('{date}', new Date().toLocaleDateString()),
                icon_url: member.guild.iconURL({ dynamic: true })
            },
            timestamp: new Date()
        };

        await channel.send({ embeds: [welcomeEmbed] });
    } catch (error) {
        console.error('Erreur welcome:', error);
    }
};
