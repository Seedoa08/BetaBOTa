require('dotenv').config(); // Charger les variables d'environnement depuis .env
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { prefix } = require('./config/globals');
const token = process.env.DISCORD_TOKEN; // Lire le token depuis les variables d'environnement
const { ownerId } = require('./config/owner');
const { checkPermissions } = require('./utils/permissions');
const ErrorHandler = require('./utils/errorHandler');

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

client.on('messageCreate', async message => {
    if (!isInitialized || message.author.bot) return;

    // Supprimer la vérification AutoMod

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
});

client.login(token);
