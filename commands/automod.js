const { PermissionsBitField } = require('discord.js');
const isOwner = require('../utils/isOwner');

module.exports = {
    name: 'automod',
    description: 'Configure l\'automodération du serveur',
    usage: '+automod <setup/status/edit>',
    permissions: 'Administrator',
    
    async execute(message, args) {
        // Bypass pour les owners
        if (!isOwner(message.author.id) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande.');
        }
        
        const subCommand = args[0]?.toLowerCase();
        
        if (!subCommand || subCommand === 'help') {
            return sendHelpEmbed(message);
        }

        switch (subCommand) {
            case 'setup':
                return setupAutomod(message);
            case 'status':
                return showStatus(message);
            case 'edit':
                return editConfig(message, args.slice(1));
            default:
                return message.reply('❌ Commande invalide. Utilisez `+automod help` pour voir les options disponibles.');
        }
    }
};

async function setupAutomod(message) {
    const steps = [
        {
            question: '🛡️ Voulez-vous activer la protection contre le spam ? (oui/non)',
            field: 'spam',
            process: answer => answer.toLowerCase() === 'oui'
        },
        {
            question: '🔨 Quelle action prendre pour le spam ? (warn/mute/kick/ban)',
            field: 'spamAction',
            process: answer => ['warn', 'mute', 'kick', 'ban'].includes(answer.toLowerCase()) ? answer.toLowerCase() : 'warn'
        },
        {
            question: '🔤 Voulez-vous activer le filtre de mots interdits ? (oui/non)',
            field: 'wordFilter',
            process: answer => answer.toLowerCase() === 'oui'
        },
        {
            question: '⏰ Durée du mute automatique (en minutes) ?',
            field: 'muteDuration',
            process: answer => !isNaN(answer) ? parseInt(answer) : 10
        }
    ];

    const config = {};
    const filter = m => m.author.id === message.author.id;

    try {
        for (const step of steps) {
            await message.channel.send(step.question);
            const collected = await message.channel.awaitMessages({
                filter,
                max: 1,
                time: 30000,
                errors: ['time']
            });
            
            config[step.field] = step.process(collected.first().content);
        }

        // Sauvegarder la configuration
        saveConfig(message.guild.id, config);

        const summaryEmbed = {
            color: 0x00ff00,
            title: '✅ Configuration de l\'automod terminée',
            fields: Object.entries(config).map(([key, value]) => ({
                name: key,
                value: value.toString(),
                inline: true
            })),
            footer: { text: 'Utilisez +automod status pour voir la configuration actuelle' }
        };

        return message.channel.send({ embeds: [summaryEmbed] });
    } catch (error) {
        return message.reply('❌ Configuration annulée - temps écoulé ou erreur.');
    }
}

function sendHelpEmbed(message) {
    const helpEmbed = {
        color: 0x0099ff,
        title: '📚 Aide Automod',
        description: 'Système d\'automodération automatique',
        fields: [
            {
                name: '`+automod setup`',
                value: 'Lance la configuration interactive de l\'automod'
            },
            {
                name: '`+automod status`',
                value: 'Affiche la configuration actuelle'
            },
            {
                name: '`+automod edit <paramètre> <valeur>`',
                value: 'Modifie un paramètre spécifique'
            },
            {
                name: 'Paramètres disponibles',
                value: '• `spam` - Protection anti-spam\n• `links` - Filtrage des liens\n• `mentions` - Limite de mentions\n• `caps` - Limite de majuscules'
            }
        ],
        footer: { text: 'Pour plus d\'informations sur un paramètre, utilisez +automod help <paramètre>' }
    };

    return message.channel.send({ embeds: [helpEmbed] });
}

async function showStatus(message) {
    // Charger la configuration
    const config = loadConfig(message.guild.id);

    const statusEmbed = {
        color: 0x0099ff,
        title: '⚙️ État de l\'Automod',
        fields: [
            { name: 'Protection contre le spam', value: config.spam ? '✅ Activée' : '❌ Désactivée', inline: true },
            { name: 'Action pour le spam', value: config.spamAction || 'warn', inline: true },
            { name: 'Filtre de mots interdits', value: config.wordFilter ? '✅ Activé' : '❌ Désactivé', inline: true },
            { name: 'Durée du mute automatique', value: `${config.muteDuration || 10} minutes`, inline: true }
        ],
        footer: { text: 'Utilisez +automod edit pour modifier les paramètres' }
    };

    return message.channel.send({ embeds: [statusEmbed] });
}

function editConfig(message, args) {
    const config = loadConfig(message.guild.id);
    const key = args[0];
    const value = args[1];

    if (!key || !value) {
        return message.reply('❌ Usage: `+automod edit <paramètre> <valeur>`');
    }

    // Vérifier si le paramètre est modifiable
    if (!['spam', 'spamAction', 'wordFilter', 'muteDuration'].includes(key)) {
        return message.reply('❌ Paramètre invalide ou non modifiable.');
    }

    // Appliquer les modifications
    if (key === 'muteDuration' && !isNaN(value)) {
        config[key] = parseInt(value);
    } else {
        config[key] = value === 'true' || value === 'false' ? value === 'true' : value;
    }

    // Sauvegarder la configuration
    saveConfig(message.guild.id, config);

    return message.reply(`✅ Paramètre \`${key}\` mis à jour avec la valeur \`${value}\``);
}

function loadConfig(guildId) {
    if (!fs.existsSync(configPath)) {
        return {};
    }

    const configs = require(configPath);
    return configs[guildId] || {};
}

function saveConfig(guildId, newConfig) {
    let configs = {};

    if (fs.existsSync(configPath)) {
        configs = require(configPath);
    }

    configs[guildId] = { ...configs[guildId], ...newConfig };

    fs.writeFileSync(configPath, JSON.stringify(configs, null, 4));
}
