const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'logs',
    description: 'Configure et gère les logs du serveur',
    usage: '+logs <set/enable/disable/config/status> [#canal] [options]',
    permissions: 'Administrator',
    variables: [
        { name: 'set #canal', description: 'Définit le canal des logs' },
        { name: 'enable <type>', description: 'Active un type de logs spécifique (messages/moderation/voice/members/all)' },
        { name: 'disable <type>', description: 'Désactive un type de logs spécifique' },
        { name: 'config', description: 'Configure les paramètres des logs' },
        { name: 'status', description: 'Affiche le statut actuel des logs' },
        { name: 'types', description: 'Liste tous les types de logs disponibles' },
        { name: '--silent', description: 'Option pour masquer les logs de commandes basiques' },
        { name: '--webhook', description: 'Utilise un webhook pour les logs (plus propre)' },
        { name: '--color <hex>', description: 'Définit la couleur des embeds de logs' }
    ],
    subcommands: {
        set: {
            usage: '+logs set #canal',
            description: 'Définit le canal où seront envoyés les logs'
        },
        enable: {
            usage: '+logs enable <type>',
            description: 'Active un type de logs spécifique',
            types: [
                'messages (suppressions, modifications)',
                'moderation (bans, kicks, mutes)',
                'voice (connexions, déconnexions)',
                'members (joins, leaves, nicknames)',
                'roles (ajouts, retraits)',
                'channels (créations, suppressions)',
                'all (tous les types)'
            ]
        },
        config: {
            usage: '+logs config <paramètre> <valeur>',
            parameters: [
                'webhook (true/false)',
                'color (code hexadécimal)',
                'silent (true/false)',
                'format (embed/text/both)'
            ]
        }
    },
    examples: [
        '+logs set #logs-serveur',
        '+logs enable messages voice',
        '+logs config webhook true',
        '+logs disable moderation',
        '+logs status',
        '+logs set #logs --webhook --color #FF0000'
    ],
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Cette commande nécessite les permissions Administrateur.');
        }

        const subCommand = args[0]?.toLowerCase();
        const channel = message.mentions.channels.first();

        switch (subCommand) {
            case 'set':
                if (!channel) {
                    return message.reply('❌ Veuillez mentionner un canal pour les logs.');
                }
                message.client.logsChannel = channel.id;
                message.reply(`✅ Canal des logs défini sur ${channel}`);
                break;

            case 'stats':
                // Afficher les statistiques des logs
                break;

            default:
                message.reply('❌ Utilisation: `+logs set #canal` ou `+logs stats`');
        }
    }
};
