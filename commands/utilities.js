module.exports = {
    commands: [
        {
            name: 'info',
            description: 'Affiche des informations sur le bot, son utilisation et les permissions nécessaires.',
            permissions: 'Aucune',
            usage: '+info',
            file: 'info.js'
        },
        {
            name: 'ping',
            description: 'Affiche la latence du bot et de l\'API Discord.',
            permissions: 'Aucune',
            usage: '+ping',
            file: 'ping.js'
        },
        {
            name: 'help',
            description: 'Affiche la liste des commandes disponibles avec des détails.',
            permissions: 'Aucune',
            usage: '+help',
            file: 'help.js'
        },
        {
            name: 'userinfo',
            description: 'Affiche des informations détaillées sur un utilisateur.',
            permissions: 'Aucune',
            usage: '+userinfo [@utilisateur]',
            file: 'userinfo.js'
        },
        {
            name: 'serverinfo',
            description: 'Affiche des informations sur le serveur.',
            permissions: 'Aucune',
            usage: '+serverinfo',
            file: 'serverinfo.js'
        },
        {
            name: 'owneronly',
            description: 'Commande réservée à l\'owner du bot pour gérer les utilisateurs autorisés.',
            permissions: 'OwnerOnly',
            usage: '+owneronly [add|remove|list] @utilisateur',
            file: 'owneronly.js'
        }
    ]
};
