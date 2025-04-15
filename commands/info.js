module.exports = {
    name: 'info',
    description: 'Affiche des informations sur une commande spécifique ou sur le bot.',
    usage: '+info [commande]',
    permissions: 'Aucune',
    async execute(message, args) {
        const commandName = args[0]?.toLowerCase();
        const command = message.client.commands.get(commandName) || message.client.commands.find(cmd => cmd.aliases?.includes(commandName));

        if (!commandName) {
            const generalInfoEmbed = {
                color: 0x00ff00,
                title: 'ℹ️ Informations sur le bot',
                description: 'Utilisez `+info <commande>` pour obtenir des détails sur une commande spécifique.',
                fields: [
                    { name: 'Exemple', value: '`+info ban` pour voir les détails de la commande `ban`.' },
                    { name: 'Commandes disponibles', value: '`+help` pour voir la liste complète des commandes.' }
                ],
                footer: {
                    text: `Demandé par ${message.author.tag}`,
                    icon_url: message.author.displayAvatarURL({ dynamic: true })
                },
                timestamp: new Date()
            };

            return message.channel.send({ embeds: [generalInfoEmbed] });
        }

        if (!command) {
            return message.reply(`❌ La commande \`${commandName}\` n'existe pas.`);
        }

        const commandInfoEmbed = {
            color: 0x0099ff,
            title: `ℹ️ Informations sur la commande \`${command.name}\``,
            fields: [
                { name: 'Description', value: command.description || 'Aucune description disponible.' },
                { name: 'Usage', value: command.usage || 'Non spécifié.' },
                { name: 'Permissions nécessaires', value: command.permissions || 'Aucune' },
                { name: 'Alias', value: command.aliases?.join(', ') || 'Aucun' }
            ],
            footer: {
                text: `Demandé par ${message.author.tag}`,
                icon_url: message.author.displayAvatarURL({ dynamic: true })
            },
            timestamp: new Date()
        };

        if (command.variables) {
            commandInfoEmbed.fields.push({
                name: 'Variables/Options',
                value: command.variables.map(v => `\`${v.name}\`: ${v.description}`).join('\n') || 'Aucune'
            });
        }

        message.channel.send({ embeds: [commandInfoEmbed] });
    }
};
