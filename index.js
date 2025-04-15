const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { prefix } = require('./config/globals');
const token = 'MTM0OTc4NTYwMzMxMDYxNjYwNw.G7cV1k.Rk-cICyfno2cpb2qiGbEWYZ2jtYg6zkViUU1kI'; // Token directement dans le code
const { ownerId } = require('./config/owner');
const { checkPermissions } = require('./utils/permissions');
const ErrorHandler = require('./utils/errorHandler');
const antiSpam = require('./utils/antiSpam');
const SanctionReminder = require('./utils/sanctionReminder');
const modStats = require('./utils/modStats');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

// Système de logs avancé avec rotation
const logsDir = './logs';
const logsFile = path.join(logsDir, 'logs.json');
const cooldowns = new Map(); // Système de rate-limiting

if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

function logEvent(type, message) {
    const logs = fs.existsSync(logsFile) ? JSON.parse(fs.readFileSync(logsFile, 'utf8')) : [];
    logs.push({ timestamp: new Date().toISOString(), type, message });

    // Rotation des logs si le fichier dépasse 1 Mo
    if (logs.length > 1000) {
        const archiveName = `logs-${Date.now()}.json`;
        fs.writeFileSync(path.join(logsDir, archiveName), JSON.stringify(logs, null, 4));
        fs.writeFileSync(logsFile, JSON.stringify([], null, 4));
    } else {
        fs.writeFileSync(logsFile, JSON.stringify(logs, null, 4));
    }

    console.log(`[${type.toUpperCase()}] ${message}`);
}

client.commands = new Collection();

// Charger dynamiquement les commandes
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
    console.log(`Commande chargée : ${command.name}`);
}

let isInitialized = false;

client.once('ready', async () => {
    if (isInitialized) return;
    isInitialized = true;

    try {
        // Synchronisation des fichiers
        const filesToSync = [
            './warnings.json',
            './authorizedUsers.json',
            './muteHistory.json',
            './logs/moderation.json'
        ];

        for (const file of filesToSync) {
            if (!fs.existsSync(file)) {
                const dir = path.dirname(file);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                fs.writeFileSync(file, JSON.stringify({}, null, 4));
                console.log(`📁 Fichier créé : ${file}`);
            }
        }

        // Vérification et création des dossiers nécessaires
        const directories = ['./logs', './backups'];
        directories.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
                console.log(`📁 Dossier créé : ${dir}`);
            }
        });

        console.log('Bot de modération en ligne !');
        logEvent('info', 'Le bot est en ligne et synchronisé.');

        // Message de redémarrage
        if (fs.existsSync('./lastRestart.json')) {
            const lastRestartInfo = JSON.parse(fs.readFileSync('./lastRestart.json', 'utf8'));
            if (lastRestartInfo?.channelId) {
                const channel = client.channels.cache.get(lastRestartInfo.channelId);
                if (channel) {
                    await channel.send('✅ Redémarrage effectué avec succès ! Tous les fichiers sont synchronisés.');
                }
                fs.unlinkSync('./lastRestart.json');
            }
        }
    } catch (error) {
        console.error('Erreur lors de la synchronisation :', error);
        logEvent('error', `Erreur de synchronisation : ${error.message}`);
    }

    client.errorHandler = new ErrorHandler(client);
});

// Initialiser le système de rappel de sanctions
const sanctionReminder = new SanctionReminder(client);

client.on('messageCreate', async message => {
    if (!isInitialized || message.author.bot) return;

    // Vérification anti-spam
    const spamCheck = antiSpam.check(message);
    if (spamCheck.shouldMute) {
        const member = message.member;
        if (member && member.moderatable) {
            await member.timeout(600000, 'Spam détecté'); // Mute de 10 minutes
            message.channel.send(`🛡️ ${member.user.tag} a été mute pour spam.`);
        }
    } else if (spamCheck.shouldWarn) {
        message.channel.send(`⚠️ ${message.author}, merci de ne pas spammer.`);
    }

    // Traitement des commandes
    if (message.content.startsWith(prefix)) {
        if (!message.guild || !message.member) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.commands.get(commandName);

        if (!command) return;

        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(`Erreur lors de l'exécution de la commande "${commandName}" :`, error);

            // Envoi des logs en DM à l'owner
            const owner = await client.users.fetch(ownerId);
            if (owner) {
                try {
                    await owner.send(`❌ Une erreur est survenue lors de l'exécution de la commande "${commandName}" :\n\`\`\`${error.stack || error.message}\`\`\``);
                } catch (dmError) {
                    console.error('Impossible d\'envoyer un DM à l\'owner :', dmError);
                }
            }

            // Réponse dans le canal
            message.reply('❌ Une erreur est survenue lors de l\'exécution de cette commande.');
        }
    }
});

// Gestion des erreurs globales
process.on('unhandledRejection', async (error) => {
    console.error('Erreur non gérée :', error);
    logEvent('error', `Erreur non gérée : ${error.message}`);
});

process.on('uncaughtException', (error) => {
    console.error('Exception non gérée :', error);
    logEvent('error', `Exception non gérée : ${error.message}`);
});

// Gestion des commandes avec alias
client.on('messageCreate', async (message) => {
    if (!isInitialized || message.author.bot) return;

    if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases?.includes(commandName));

        if (!command) return;

        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(`Erreur lors de l'exécution de la commande "${commandName}" :`, error);
            logEvent('error', `Erreur dans la commande "${commandName}" : ${error.message}`);
            message.reply('❌ Une erreur est survenue lors de l\'exécution de cette commande.');
        }
    }
});

// Optimisation des événements
client.on('guildMemberAdd', (member) => {
    logEvent('info', `Nouveau membre : ${member.user.tag} a rejoint le serveur.`);
});

client.on('guildMemberRemove', (member) => {
    logEvent('info', `Membre parti : ${member.user.tag} a quitté le serveur.`);
});

// Gestion des erreurs globales
process.on('unhandledRejection', async (error) => {
    console.error('Erreur non gérée :', error);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {
        const logs = fs.existsSync(logsFile) ? JSON.parse(fs.readFileSync(logsFile, 'utf8')) : [];
        logs.push({
            action: 'mute',
            user: { id: newMember.id, tag: newMember.user.tag },
            moderator: null, // Discord ne fournit pas directement le modérateur ici
            reason: 'Mute/Unmute détecté',
            date: new Date().toISOString()
        });
        fs.writeFileSync(logsFile, JSON.stringify(logs, null, 4));
    }
});

client.on('guildBanAdd', async (ban) => {
    const logs = fs.existsSync(logsFile) ? JSON.parse(fs.readFileSync(logsFile, 'utf8')) : [];
    logs.push({
        action: 'ban',
        user: { id: ban.user.id, tag: ban.user.tag },
        moderator: null, // Discord ne fournit pas directement le modérateur ici
        reason: 'Bannissement détecté',
        date: new Date().toISOString()
    });
    fs.writeFileSync(logsFile, JSON.stringify(logs, null, 4));

    const audit = await ban.guild.fetchAuditLogs({
        type: 'MEMBER_BAN_ADD',
        limit: 1
    });
    const entry = audit.entries.first();
    if (entry) {
        modStats.addAction(entry.executor.id, 'bans');
    }
});

let lastDeletedMessage = null;

client.on('messageDelete', async (message) => {
    if (!message.partial) {
        lastDeletedMessage = message;
    }
    const logs = fs.existsSync(logsFile) ? JSON.parse(fs.readFileSync(logsFile, 'utf8')) : [];
    logs.push({
        action: 'messageDelete',
        user: { id: message.author.id, tag: message.author.tag },
        channel: { id: message.channel.id, name: message.channel.name },
        reason: 'Message supprimé',
        date: new Date().toISOString()
    });
    fs.writeFileSync(logsFile, JSON.stringify(logs, null, 4));
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    const logs = fs.existsSync(logsFile) ? JSON.parse(fs.readFileSync(logsFile, 'utf8')) : [];
    if (!oldState.channel && newState.channel) {
        logs.push({
            action: 'voiceJoin',
            user: { id: newState.id, tag: newState.member.user.tag },
            channel: { id: newState.channel.id, name: newState.channel.name },
            date: new Date().toISOString()
        });
    } else if (oldState.channel && !newState.channel) {
        logs.push({
            action: 'voiceLeave',
            user: { id: oldState.id, tag: oldState.member.user.tag },
            channel: { id: oldState.channel.id, name: oldState.channel.name },
            date: new Date().toISOString()
        });
    }
    fs.writeFileSync(logsFile, JSON.stringify(logs, null, 4));
});

client.on('guildMemberRoleAdd', async (member, role) => {
    logEvent('info', `Rôle ajouté : ${role.name} à ${member.user.tag}`);
});

client.on('guildMemberRoleRemove', async (member, role) => {
    logEvent('info', `Rôle retiré : ${role.name} de ${member.user.tag}`);
});

client.on('channelUpdate', async (oldChannel, newChannel) => {
    if (oldChannel.permissionOverwrites !== newChannel.permissionOverwrites) {
        logEvent('info', `Permissions modifiées dans le canal ${newChannel.name}`);
    }
});

client.login(token).catch(error => {
    console.error('Erreur lors de la connexion du bot :', error.message);
    process.exit(1); // Quitte le processus si le token est invalide
});
