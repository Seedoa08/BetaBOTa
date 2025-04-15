const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { prefix } = require('./config/globals');
require('dotenv').config();
const token = process.env.DISCORD_TOKEN; // Token sécurisé via variable d'environnement
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
        GatewayIntentBits.MessageContent
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
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
                logEvent('info', 'Le bot est en ligne et synchronisé');
            } catch (error) {
                console.error('Erreur lors de l\'initialisation du bot :', error);
                logEvent('error', `Erreur lors de l'initialisation : ${error.message}`);
            }
        });
        
        client.on('messageCreate', async (message) => {
            if (!message.content.startsWith(prefix) || message.author.bot) return;
        
            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
        
            const command = client.commands.get(commandName);
            if (!command) return;
        
            try {
                await command.execute(message, args);
            } catch (error) {
                console.error('Erreur lors de l\'exécution de la commande :', error);
                logEvent('error', `Erreur lors de l'exécution de la commande ${commandName}: ${error.message}`);
                message.reply('Une erreur est survenue lors de l\'exécution de cette commande.');
            }
        });
        
        client.login(token);
