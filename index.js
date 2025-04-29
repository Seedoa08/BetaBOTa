const { Client, GatewayIntentBits, Collection, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField, ActivityType, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const isOwner = require('./utils/isOwner');

// Configuration globale intégrée
const config = {
    prefix: "+",
    token: process.env.TOKEN || "MTM0OTc4NTYwMzMxMDYxNjYwNw.GNu8W2.5zsrgBWFUKrxvyanqZnBHOOk9s7QUKkLWvcTY0",
    owners: ["VOTRE_ID"],
    version: "1.2.3"
};

// Rendre la config accessible globalement
global.botConfig = config;

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
client.snipes = new Collection();

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
    
    client.user.setPresence({
        activities: [{ 
            name: `${config.prefix}help | Mon prefix est ${config.prefix}`,
            type: ActivityType.Playing
        }],
        status: 'online'
    });
});

// Supprimer l'ancien gestionnaire messageCreate et garder uniquement celui-ci
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(config.prefix)) return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        if (isOwner(message.author.id)) {
            // Owner bypass
            await command.execute(message, args);
        } else if (!command.permissions || message.member.permissions.has(command.permissions)) {
            // Public command or user has permissions
            await command.execute(message, args);
        } else {
            return message.reply(`❌ Vous n'avez pas les permissions nécessaires pour exécuter cette commande.`);
        }
    } catch (error) {
        console.error('Erreur commande:', error);
        message.reply('❌ Une erreur est survenue lors de l\'exécution de la commande.').catch(console.error);
    }
});

// Gestion des erreurs simplifiée
process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

// Ajouter l'événement messageDelete
client.on('messageDelete', message => {
    if (message.author.bot) return;
    client.snipes.set(message.channel.id, {
        content: message.content,
        author: message.author,
        attachments: message.attachments,
        timestamp: Date.now()
    });
});

// Gestionnaire d'interactions pour les tickets
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    
    if (interaction.customId.startsWith('ticket_')) {
        try {
            await interaction.deferReply({ flags: 1 << 6 }); // Correction ici

            const type = interaction.customId.split('_')[1];
            
            const types = {
                support: { 
                    name: 'Support', 
                    emoji: '❓', 
                    color: 0x5865F2,
                    roles: ['1349560918408958064'] // Gestion Staff
                },
                report: { 
                    name: 'Signalement', 
                    emoji: '🚨', 
                    color: 0xFF0000,
                    roles: ['1349560918199238756'] // Gestion Abus
                },
                partner: { 
                    name: 'Partenariat', 
                    emoji: '🤝', 
                    color: 0x00FF00,
                    roles: ['1349560918408958063'] // Gestion Partenariat
                }
            };

            const ticketType = types[type];
            if (!ticketType) return;

            // Trouver les rôles admin
            const adminRoles = interaction.guild.roles.cache
                .filter(role => role.permissions.has(PermissionsBitField.Flags.Administrator))
                .map(role => role.id);

            // Créer les permissions de base
            const permissions = [
                {
                    id: interaction.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
                }
            ];

            // Ajouter les permissions pour les rôles spécifiques
            ticketType.roles.forEach(roleId => {
                permissions.push({
                    id: roleId,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
                });
            });

            // Ajouter les permissions pour les rôles admin
            adminRoles.forEach(roleId => {
                permissions.push({
                    id: roleId,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
                });
            });

            const channel = await interaction.guild.channels.create({
                name: `${ticketType.emoji}・${type}-${interaction.user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: permissions
            });

            const embed = new EmbedBuilder()
                .setColor(ticketType.color)
                .setTitle(`${ticketType.emoji} Ticket ${ticketType.name}`)
                .setDescription(`Un membre du staff vous répondra bientôt.\n\nUtilisateur: ${interaction.user}\nType: ${ticketType.name}`)
                .setTimestamp();

            const closeButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('Fermer le ticket')
                    .setStyle(ButtonStyle.Danger)
            );

            await channel.send({
                content: `${interaction.user}`,
                embeds: [embed],
                components: [closeButton]
            });

            await interaction.editReply({
                content: `✅ Votre ticket a été créé: ${channel}`,
                flags: 1 << 6 // Correction ici
            });

        } catch (error) {
            console.error('Erreur ticket:', error);
            await interaction.editReply({
                content: '❌ Une erreur est survenue lors de la création du ticket.',
                flags: 1 << 6 // Correction ici
            });
        }
    }

    // Gestion de la fermeture des tickets
    if (interaction.customId === 'close_ticket') {
        try {
            await interaction.reply('🔒 Ce ticket sera fermé dans 5 secondes...');
            setTimeout(() => interaction.channel.delete(), 5000);
        } catch (error) {
            console.error('Erreur fermeture ticket:', error);
        }
    }
});

client.login(config.token);
