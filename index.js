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
        // Vérifier si l'un des owners est présent dans le serveur
        const { owners } = require('./config/owners');
        const ownerPresent = guild.members.cache.some(member => owners.includes(member.id)) ||
                           (await Promise.any(owners.map(id => 
                               guild.members.fetch(id).then(() => true).catch(() => false)
                           )).catch(() => false));
        
        if (!ownerPresent) {
            console.log(`Refusing to join guild ${guild.name} (${guild.id}) - No owner present`);
            
            // Tenter d'envoyer un message avant de partir
            const systemChannel = guild.systemChannel || 
                                guild.channels.cache.find(channel => 
                                    channel.type === 0 && 
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
            
            await guild.leave();
        } else {
            // Log l'arrivée réussie
            console.log(`Successfully joined guild ${guild.name} (${guild.id}) - Owner present`);
            
            // Notification de bienvenue
            const welcomeChannel = guild.systemChannel || 
                                 guild.channels.cache.find(channel => 
                                     channel.type === 0 && 
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
    console.error('Erreur non gérée :', error);
    logEvent('error', `Erreur non gérée : ${error.message}`);
});

process.on('uncaughtException', (error) => {
    console.error('Exception non gérée :', error);
    logEvent('error', `Exception non gérée : ${error.message}`);
});

// Système de cooldown global
const globalCooldowns = new Map();

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Vérifier la maintenance
    const maintenanceFile = './data/maintenance.json';
    if (fs.existsSync(maintenanceFile)) {
        const maintenance = JSON.parse(fs.readFileSync(maintenanceFile));
        if (maintenance.active && !owners.includes(message.author.id)) {
            // Autoriser uniquement les commandes essentielles en maintenance
            const allowedCommands = ['help', 'ping', 'maintenance'];
            const command = message.content.slice(prefix.length).split(' ')[0];
            if (!allowedCommands.includes(command)) {
                return message.reply('⚠️ Le bot est actuellement en maintenance. Seules les commandes essentielles sont disponibles.');
            }
        }
    }

    // Analyse comportementale avancée
    const behavior = await botBrain.analyzeUserBehavior(message);
    
    // Log des comportements suspects
    if (behavior.trustScore < 70) {
        logEvent('suspicious', `Comportement suspect de ${message.author.tag} (Trust Score: ${behavior.trustScore})`);
    }

    // Vérification des mots interdits et analyse contextuelle
    const analysis = await botBrain.analyzeMessage(message);
    if (analysis.shouldAct) {
        await botBrain.handleViolation(message, analysis);
        return;
    }

    // Auto-modération et apprentissage
    await botBrain.autoModerate(message);
    
    // Apprentissage et analyse du contexte
    botBrain.learn(message);
    
    // Si le message mentionne le bot, générer une réponse
    if (message.mentions.has(client.user)) {
        const response = botBrain.generateResponse(message);
        if (response.content) {
            await message.reply(response.content);
        }
    }

    // Vérification des mots interdits et limites
    const messageContent = message.content.toLowerCase();
    const forbiddenWords = wordlist.forbidden || [];
    const warningWords = wordlist.warning || [];

    // Vérifier les mots strictement interdits
    const containsForbiddenWord = forbiddenWords.some(word => messageContent.includes(word));
    if (containsForbiddenWord) {
        try {
            await message.delete();
            const moderationEmbed = {
                color: 0xff0000,
                title: '⚠️ Message supprimé',
                description: 'Un message contenant des mots interdits a été supprimé.',
                fields: [
                    { name: 'Auteur', value: `${message.author.tag}`, inline: true }
                ],
                footer: {
                    text: `Modération automatique`,
                    icon_url: message.author.displayAvatarURL({ dynamic: true })
                },
                timestamp: new Date()
            };

            await message.channel.send({ embeds: [moderationEmbed] }).then(msg => {
                setTimeout(() => msg.delete(), 5000);
            });
        } catch (error) {
            console.error('Erreur lors de la suppression du message interdit:', error);
        }
        return;
    }

    // Vérifier les mots limites
    const containsWarningWord = warningWords.some(word => messageContent.includes(word));
    if (containsWarningWord) {
        const warningEmbed = {
            color: 0xffa500,
            title: '⚠️ Attention au langage',
            description: 'Ce message contient des mots limites. Merci de rester courtois.',
            footer: {
                text: `Message à ${message.author.tag}`,
                icon_url: message.author.displayAvatarURL({ dynamic: true })
            },
            timestamp: new Date()
        };

        await message.channel.send({ embeds: [warningEmbed] }).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    // Gestion du cooldown global
    const cooldownTime = 3000; // 3 secondes
    const now = Date.now();
    if (globalCooldowns.has(message.author.id)) {
        const expirationTime = globalCooldowns.get(message.author.id) + cooldownTime;
        if (now < expirationTime) {
            const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
            return message.reply(`⏳ Veuillez attendre ${timeLeft} seconde(s) avant d'exécuter une autre commande.`);
        }
    }
    globalCooldowns.set(message.author.id, now);
    setTimeout(() => globalCooldowns.delete(message.author.id), cooldownTime);

    try {
        // Bypass complet des vérifications pour l'owner
        if (message.author.id === ownerId) {
            await command.execute(message, args);
            return;
        }

        // Vérifications normales pour les autres utilisateurs
        if (command.permissions && !message.member.permissions.has(command.permissions)) {
            return message.reply(`❌ Vous n'avez pas les permissions nécessaires pour exécuter cette commande (\`${command.permissions}\`).`);
        }

        await command.execute(message, args);
    } catch (error) {
        console.error('Erreur lors de l\'exécution de la commande :', error);
        logEvent('error', `Erreur lors de l'exécution de la commande ${commandName}: ${error.message}`);
        message.reply('Une erreur est survenue lors de l\'exécution de cette commande.');
    }
});

client.login(token);
