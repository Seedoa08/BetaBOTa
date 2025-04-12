module.exports = {
    commands: [
        {
            name: 'ban',
            description: 'Bannit un utilisateur du serveur.',
            permissions: 'BanMembers',
            usage: '+ban @utilisateur [raison]',
            file: 'ban.js'
        },
        {
            name: 'kick',
            description: 'Expulse un utilisateur du serveur.',
            permissions: 'KickMembers',
            usage: '+kick @utilisateur [raison]',
            file: 'kick.js'
        },
        {
            name: 'mute',
            description: 'Mute un utilisateur avec système progressif.',
            permissions: 'ModerateMembers',
            usage: '+mute @utilisateur [durée] [raison]',
            file: 'mute.js'
        },
        {
            name: 'tempmute',
            description: 'Mute temporairement un utilisateur.',
            permissions: 'ModerateMembers',
            usage: '+tempmute @utilisateur [durée] [raison]',
            file: 'tempmute.js'
        },
        {
            name: 'unmute',
            description: 'Retire le mute d\'un utilisateur.',
            permissions: 'ModerateMembers',
            usage: '+unmute @utilisateur',
            file: 'unmute.js'
        },
        {
            name: 'warn',
            description: 'Avertit un utilisateur avec système de sanctions progressives.',
            permissions: 'ModerateMembers',
            usage: '+warn @utilisateur [raison]',
            file: 'warn.js'
        },
        {
            name: 'warnings',
            description: 'Affiche les avertissements d\'un utilisateur.',
            permissions: 'ManageMessages',
            usage: '+warnings @utilisateur',
            file: 'warnings.js'
        },
        {
            name: 'clear',
            description: 'Supprime un certain nombre de messages dans le canal.',
            permissions: 'ManageMessages',
            usage: '+clear [nombre]',
            file: 'clear.js'
        },
        {
            name: 'lock',
            description: 'Verrouille un canal pour empêcher les membres d\'envoyer des messages.',
            permissions: 'ManageChannels',
            usage: '+lock',
            file: 'lock.js'
        },
        {
            name: 'unlock',
            description: 'Déverrouille un canal pour permettre aux membres d\'envoyer des messages.',
            permissions: 'ManageChannels',
            usage: '+unlock',
            file: 'unlock.js'
        }
    ]
};
