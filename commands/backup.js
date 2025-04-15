const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'backup',
    description: 'Sauvegarde les fichiers critiques du bot.',
    usage: '+backup',
    permissions: 'OwnerOnly',
    async execute(message) {
        const ownerId = '1061373376767201360'; // Remplacez par votre ID
        if (message.author.id !== ownerId) {
            return message.reply('❌ Cette commande est réservée à l\'owner du bot.');
        }

        const backupDir = './backups';
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const filesToBackup = [
            './warnings.json',
            './authorizedUsers.json',
            './muteHistory.json',
            './logs/moderation.json'
        ];

        try {
            for (const file of filesToBackup) {
                if (fs.existsSync(file)) {
                    const fileName = path.basename(file);
                    const backupPath = path.join(backupDir, `${fileName}.backup-${Date.now()}`);
                    fs.copyFileSync(file, backupPath);
                    console.log(`📁 Fichier sauvegardé : ${backupPath}`);
                }
            }
            message.reply('✅ Sauvegarde effectuée avec succès.');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde :', error);
            message.reply('❌ Une erreur est survenue lors de la sauvegarde.');
        }
    }
};
