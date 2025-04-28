const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { prefix } = require('./config.json');
const token = 'MTM0OTc4NTYwMzMxMDYxNjYwNw.G7cV1k.Rk-cICyfno2cpb2qiGbEWYZ2jtYg6zkViUU1kI';
const isOwner = require('./utils/isOwner'); // Ajouter cet import

// Créer le client Discord.js
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

// Initialiser les collections
client.commands = new Collection();

// Créer les dossiers nécessaires s'ils n'existent pas
const dirs = ['./logs', './data'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Charger les commandes
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
    console.log(`Commande chargée : ${command.name}`);
}

// Événement ready
client.once('ready', () => {
    console.log('Bot en ligne !');
});

// Événement messageCreate simplifié
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        // Si c'est un owner, donner toutes les permissions nécessaires
        if (isOwner(message.author.id)) {
            // Créer un faux objet member avec toutes les permissions de modération
            const fakePermissions = new Map();
            fakePermissions.set('BanMembers', true);
            fakePermissions.set('KickMembers', true);
            fakePermissions.set('ModerateMembers', true);
            fakePermissions.set('ManageMessages', true);
            fakePermissions.set('ManageChannels', true);
            fakePermissions.set('Administrator', true);

            message.member = {
                ...message.member,
                permissions: {
                    has: (perm) => fakePermissions.get(perm) || true
                },
                roles: {
                    highest: {
                        position: 999999 // Position très élevée pour bypasser toutes les vérifications
                    },
                    cache: message.member?.roles.cache || new Collection()
                },
                moderatable: true,
                kickable: true,
                bannable: true
            };

            await command.execute(message, args);
            return;
        }

        // Pour les non-owners, vérifier les permissions normalement
        if (command.permissions && !message.member.permissions.has(command.permissions)) {
            return message.reply(`❌ Vous n'avez pas les permissions nécessaires pour exécuter cette commande.`);
        }

        await command.execute(message, args);
    } catch (error) {
        console.error('Erreur commande:', error);
        message.reply('❌ Une erreur est survenue lors de l\'exécution de la commande.').catch(console.error);
    }
});

// Gestion des erreurs simplifiée
process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

client.login(token);
