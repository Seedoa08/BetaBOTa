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
const wordlist = require('./wordlist.json'); // Charger la wordlist
const BotBrain = require('./utils/botBrain');
const versionManager = require('./utils/versionManager');
const prefixesFile = './data/prefixes.json';
const isOwner = require('./utils/isOwner');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const botBrain = new BotBrain();

// Système de snipe amélioré
client.snipes = new Collection();

client.on('messageDelete', message => {
    if (message.author.bot) return;

    const snipe = {
        content: message.content,
        author: message.author,
        channel: message.channel,
        timestamp: Date.now(),
        image: message.attachments.first()?.proxyURL || null,
        attachments: [...message.attachments.values()].map(a => ({
            name: a.name,
            url: a.proxyURL
        })),
        reference: message.reference ? {
            author: message.reference.author,
            url: `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.reference.messageId}`
        } : null,
        embeds: message.embeds
    };

    const channelSnipes = client.snipes.get(message.channel.id) || [];
    channelSnipes.unshift(snipe);
    // Garder les 10 derniers messages par salon
    if (channelSnipes.length > 10) channelSnipes.pop();
    client.snipes.set(message.channel.id, channelSnipes);

    // Supprimer après 1 heure
    setTimeout(() => {
        const currentSnipes = client.snipes.get(message.channel.id) || [];
        const filteredSnipes = currentSnipes.filter(s => s.timestamp !== snipe.timestamp);
        if (filteredSnipes.length > 0) {
            client.snipes.set(message.channel.id, filteredSnipes);
        } else {
            client.snipes.delete(message.channel.id);
        }
    }, 3600000);
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

    // Incrémenter la version au démarrage
    const newVersion = versionManager.incrementVersion();
    console.log(`Version actuelle: ${newVersion}`);

    try {
        // Vérifier tous les serveurs pour la présence de l'owner
        client.guilds.cache.forEach(async guild => {
            const ownerPresent = guild.members.cache.has(ownerId) || 
                               (await guild.members.fetch({ user: ownerId }).catch(() => null));
            
            if (!ownerPresent) {
                console.log(`Quitting guild ${guild.name} (${guild.id}) - Owner not present`);
                await guild.leave();
            }
        });

        console.log('Bot de modération en ligne !');
        logEvent('info', 'Le bot est en ligne et synchronisé.');

        // Envoi du message à l'owner
        const owner = await client.users.fetch(ownerId);
        if (owner) {
            const startupEmbed = {
                color: 0x00ff00,
                title: '✅ Bot démarré avec succès',
                fields: [
                    { name: 'Status', value: 'Tous les systèmes sont opérationnels', inline: true },
                    { name: 'Serveurs', value: `${client.guilds.cache.size} serveurs`, inline: true },
                    { name: 'Utilisateurs', value: `${client.users.cache.size} utilisateurs`, inline: true },
                    { name: 'Version', value: newVersion, inline: true },
                    { name: 'Uptime', value: '0s', inline: true }
                ],
                footer: { text: `Node.js ${process.version}` },
                timestamp: new Date()
            };
            await owner.send({ embeds: [startupEmbed] });
        }

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

// Ajouter un event pour les nouveaux serveurs
client.on('guildCreate', async guild => {
    try {
        // Charger les IDs des owners
        const { ownerLevel3, ownerLevel2, ownerLevel1 } = require('./config/owners');
        const allOwners = [...ownerLevel3, ...ownerLevel2, ...ownerLevel1];

        // Vérifier si un owner est présent dans le serveur
        const ownerPresent = await Promise.any(
            allOwners.map(async id => {
                try {
                    const member = await guild.members.fetch(id);
                    return !!member;
                } catch {
                    return false;
                }
            })
        ).catch(() => false);

        if (!ownerPresent) {
            console.log(`Refusing to join guild ${guild.name} (${guild.id}) - No owner present`);

            // Tenter d'envoyer un message avant de quitter
            const systemChannel = guild.systemChannel || 
                                  guild.channels.cache.find(channel => 
                                      channel.permissionsFor(guild.members.me).has('SendMessages')
                                  );

            if (systemChannel) {
                await systemChannel.send({
                    embeds: [{
                        color: 0xFF0000,
                        title: '❌ Départ automatique',
                        description: 'Je ne peux rejoindre que les serveurs où l\'un de mes propriétaires est présent.',
                        fields: [
                            { 
                                name: 'Solution', 
                                value: 'Assurez-vous qu\'un des propriétaires du bot soit présent sur le serveur avant de m\'inviter.' 
                            }
                        ],
                        footer: { text: 'Protection automatique' }
                    }]
                }).catch(() => {});
            }

            // Envoyer un DM à l'owner principal
            const ownerId = ownerLevel3[0]; // ID du propriétaire principal
            const owner = await client.users.fetch(ownerId);
            if (owner) {
                await owner.send({
                    embeds: [{
                        color: 0xFF9900,
                        title: '🔔 Tentative d\'ajout du bot',
                        description: `Une personne a essayé d'ajouter le bot sur un serveur où vous n'êtes pas présent.`,
                        fields: [
                            { name: 'Serveur', value: `${guild.name} (${guild.id})`, inline: true },
                            { name: 'Nombre de membres', value: `${guild.memberCount}`, inline: true },
                            { name: 'Propriétaire du serveur', value: `<@${guild.ownerId}>`, inline: true }
                        ],
                        footer: { text: 'Action requise : Rejoignez le serveur pour autoriser le bot.' },
                        timestamp: new Date()
                    }]
                }).catch(error => {
                    console.error('Erreur lors de l\'envoi du DM à l\'owner:', error);
                });
            }

            await guild.leave();
        } else {
            console.log(`Successfully joined guild ${guild.name} (${guild.id}) - Owner present`);

            // Notification de bienvenue
            const welcomeChannel = guild.systemChannel || 
                                   guild.channels.cache.find(channel => 
                                       channel.permissionsFor(guild.members.me).has('SendMessages')
                                   );

            if (welcomeChannel) {
                await welcomeChannel.send({
                    embeds: [{
                        color: 0x00FF00,
                        title: '👋 Merci de m\'avoir ajouté !',
                        description: 'Je suis prêt à modérer et protéger votre serveur.',
                        fields: [
                            { 
                                name: 'Pour commencer', 
                                value: 'Utilisez `+help` pour voir la liste des commandes disponibles.' 
                            }
                        ],
                        footer: { text: 'Protection et modération avancée' }
                    }]
                });
            }
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du nouveau serveur:', error);
    }
});

// Gestion des erreurs globales
process.on('unhandledRejection', (error) => {
    const errorInfo = errorHandler.handleError(error, null, null);
    console.error('Erreur non gérée :', errorInfo);
});

process.on('uncaughtException', (error) => {
    const errorInfo = errorHandler.handleError(error, null, null);
    console.error('Exception non gérée :', errorInfo);
    // Redémarrage propre du bot si nécessaire
    process.exit(1);
});

// Gestion des erreurs spécifiques au client Discord
client.on('error', (error) => {
    console.error('Erreur client Discord :', error);
    logEvent('error', `Erreur client Discord : ${error.message}`);
});

// Système de cooldown global
const globalCooldowns = new Map();

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Charger le préfixe pour ce serveur ou utiliser le préfixe par défaut
    const prefixes = fs.existsSync(prefixesFile) ? JSON.parse(fs.readFileSync(prefixesFile, 'utf8')) : {};
    const serverPrefix = prefixes[message.guild?.id] || prefix;

    if (!message.content.startsWith(serverPrefix)) return;

    const args = message.content.slice(serverPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();er

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        // Bypass des vérifications pour les commandes sans permissions requises
        if (!command.permissions) {
            await command.execute(message, args);
            return;
        }

        // Bypass pour l'owner
        if (isOwner(message.author.id)) {
            await command.execute(message, args);
            return;
        }

        // Vérification des permissions pour les autres commandes
        if (!message.member.permissions.has(command.permissions)) {
            return message.reply(`❌ Vous n'avez pas les permissions nécessaires pour exécuter cette commande.`);
        }

        await command.execute(message, args);
    } catch (error) {
        const { userMessage, errorId } = errorHandler.handleError(error, message, command);
        const errorEmbed = {
            color: 0xFF0000,
            title: '❌ Erreur',
            description: userMessage,
            fields: [
                { name: 'Commande', value: command.name, inline: true },
                { name: 'ID de l\'erreur', value: errorId, inline: true }
            ],
            footer: { text: 'Si l\'erreur persiste, contactez un administrateur' },
            timestamp: new Date()
        };
        message.reply({ embeds: [errorEmbed] }).catch(() => {
            message.channel.send({ embeds: [errorEmbed] }).catch(() => {});
        });
    }
});

client.login(token);
