const fs = require('fs');
const path = require('path');
const maintenanceFile = path.join(__dirname, '../data/maintenance.json');
const isOwner = require('../utils/isOwner');

module.exports = {
    name: 'maintenance',
    description: 'Active ou désactive le mode maintenance pour le bot.',
    usage: '+maintenance <on/off/status>',
    permissions: 'OwnerOnly',
    variables: [
        { name: 'on', description: 'Active le mode maintenance.' },
        { name: 'off', description: 'Désactive le mode maintenance.' },
        { name: 'status', description: 'Affiche l\'état actuel du mode maintenance.' }
    ],
    async execute(message, args) {
        if (!isOwner(message.author.id)) {
            return message.reply('❌ Cette commande est réservée aux owners du bot.');
        }

        const mode = args[0]?.toLowerCase();
        if (!['on', 'off', 'status'].includes(mode)) {
            return message.reply('❌ Utilisation invalide. Exemple : `+maintenance on`, `+maintenance off`, ou `+maintenance status`.');
        }

        // Vérifier l'état actuel
        const maintenanceData = fs.existsSync(maintenanceFile)
            ? JSON.parse(fs.readFileSync(maintenanceFile, 'utf8'))
            : { active: false };

        if (mode === 'status') {
            const statusMessage = maintenanceData.active
                ? '⚠️ Le bot est actuellement en mode maintenance. Seules les commandes essentielles sont disponibles.'
                : '✅ Le bot est actuellement en mode normal. Toutes les commandes sont disponibles.';
            return message.reply(statusMessage);
        }

        // Activer ou désactiver le mode maintenance
        const isActivating = mode === 'on';
        if (maintenanceData.active === isActivating) {
            return message.reply(
                isActivating
                    ? '⚠️ Le mode maintenance est déjà activé.'
                    : '⚠️ Le mode maintenance est déjà désactivé.'
            );
        }

        maintenanceData.active = isActivating;
        try {
            fs.writeFileSync(maintenanceFile, JSON.stringify(maintenanceData, null, 4));
            return message.reply(
                isActivating
                    ? '✅ Le mode maintenance est maintenant activé. Seules les commandes essentielles sont disponibles.'
                    : '✅ Le mode maintenance est maintenant désactivé. Toutes les commandes sont disponibles.'
            );
        } catch (error) {
            console.error('Erreur lors de la mise à jour du fichier maintenance.json:', error);
            return message.reply('❌ Une erreur est survenue lors de la mise à jour du mode maintenance.');
        }
    }
};
