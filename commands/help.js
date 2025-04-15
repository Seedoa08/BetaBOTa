const { prefix } = require('../config/globals');

module.exports = {
    name: 'help',
    description: 'Affiche la liste des commandes par catégorie',
    usage: '+help [catégorie]',
    permissions: 'Aucune',
    async execute(message) {
        const categories = {
            "🛡️ Modération": ["ban", "kick", "mute", "warn", "clear", "lock", "unlock", "nuke", "slowmode"],
            "⚙️ Configuration": ["serverinfo", "userinfo", "owneronly", "role"],
            "📊 Utilitaires": ["ping", "help", "helpall", "info", "restart"],
            "🎭 Gestion des sanctions": ["warnings", "clearwarns", "tempmute", "unmute"]
        };

        const embeds = Object.entries(categories).map(([category, commands]) => {
            return {
                color: 0x0099ff,
                title: `📜 Aide du bot - ${category}`,
                description: 'Voici la liste des commandes disponibles :',
                fields: commands.map(cmdName => {
                    const cmd = message.client.commands.get(cmdName);
                    return {
                        name: `\`${prefix}${cmdName}\``,
                        value: cmd ? cmd.description : 'Pas de description disponible'
                    };
                }),
                footer: {
                    text: `Demandé par ${message.author.tag}`,
                    icon_url: message.author.displayAvatarURL({ dynamic: true })
                },
                timestamp: new Date()
            };
        });

        let currentPage = 0;

        const helpMessage = await message.channel.send({ embeds: [embeds[currentPage]] });
        await helpMessage.react('⬅️');
        await helpMessage.react('➡️');

        const filter = (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === message.author.id;
        const collector = helpMessage.createReactionCollector({ filter, time: 60000 });

        collector.on('collect', (reaction) => {
            if (reaction.emoji.name === '⬅️') {
                currentPage = currentPage > 0 ? currentPage - 1 : embeds.length - 1;
            } else if (reaction.emoji.name === '➡️') {
                currentPage = currentPage + 1 < embeds.length ? currentPage + 1 : 0;
            }
            helpMessage.edit({ embeds: [embeds[currentPage]] });
            reaction.users.remove(message.author.id).catch(console.error);
        });

        collector.on('end', () => {
            helpMessage.reactions.removeAll().catch(console.error);
        });
    }
};
