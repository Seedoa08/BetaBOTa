const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'case',
    description: 'Affiche ou modifie un cas de modération',
    usage: '+case <ID> [edit/delete] [raison]',
    permissions: 'ModerateMembers',
    async execute(message, args) {
        const casesPath = path.join(__dirname, '../data/cases.json');
        const cases = JSON.parse(fs.readFileSync(casesPath, 'utf8'));
        const caseId = args[0];
        const action = args[1]?.toLowerCase();

        if (!cases[caseId]) {
            return message.reply('❌ Ce cas n\'existe pas.');
        }

        const caseData = cases[caseId];
        
        // Affichage du cas
        const caseEmbed = {
            color: 0x0099ff,
            title: `📁 Cas #${caseId}`,
            fields: [
                { name: 'Type', value: caseData.type, inline: true },
                { name: 'Utilisateur', value: caseData.user, inline: true },
                { name: 'Modérateur', value: caseData.moderator, inline: true },
                { name: 'Raison', value: caseData.reason || 'Aucune raison fournie' },
                { name: 'Date', value: new Date(caseData.date).toLocaleString() }
            ]
        };

        message.channel.send({ embeds: [caseEmbed] });
    }
};