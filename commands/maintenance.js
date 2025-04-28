const fs = require('fs');
const path = require('path');
const isOwner = require('../utils/isOwner');

// Définir le chemin du fichier
const dataPath = path.join(__dirname, '../data');
const maintenanceFile = path.join(dataPath, 'maintenance.json');

// Créer le dossier data s'il n'existe pas
if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
}

// Initialiser le fichier maintenance s'il n'existe pas
if (!fs.existsSync(maintenanceFile)) {
    fs.writeFileSync(maintenanceFile, JSON.stringify({
        active: false,
        reason: null,
        timestamp: null
    }, null, 4));
}

module.exports = {
    name: 'maintenance',
    description: 'Active/désactive le mode maintenance',
    usage: '+maintenance <on/off/status> [raison]',
    permissions: 'OwnerOnly',
    async execute(message, args) {
        // Cette commande est réservée aux owners uniquement
        if (!isOwner(message.author.id)) {
            return message.reply('❌ Cette commande est réservée aux owners du bot.');
        }

        const subCommand = args[0]?.toLowerCase();
        const maintenance = JSON.parse(fs.readFileSync(maintenanceFile, 'utf8'));

        try {
            switch (subCommand) {
                case 'on':
                    maintenance.active = true;
                    maintenance.reason = args.slice(1).join(' ') || 'Aucune raison spécifiée';
                    maintenance.timestamp = Date.now();
                    fs.writeFileSync(maintenanceFile, JSON.stringify(maintenance, null, 4));
                    return message.reply('✅ Mode maintenance activé.');

                case 'off':
                    maintenance.active = false;
                    maintenance.reason = null;
                    maintenance.timestamp = null;
                    fs.writeFileSync(maintenanceFile, JSON.stringify(maintenance, null, 4));
                    return message.reply('✅ Mode maintenance désactivé.');

                case 'status':
                    const status = maintenance.active
                        ? `⚠️ Le bot est en maintenance.\nRaison: ${maintenance.reason}\nDepuis: <t:${Math.floor(maintenance.timestamp / 1000)}:R>`
                        : '✅ Le bot n\'est pas en maintenance.';
                    return message.reply(status);

                default:
                    return message.reply('❌ Usage: `+maintenance <on/off/status> [raison]`');
            }
        } catch (error) {
            console.error('Erreur maintenance:', error);
            message.reply('❌ Une erreur est survenue.');
        }
    }
};
