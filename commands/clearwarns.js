const fs = require('fs');
const warningsFile = './warnings.json';

module.exports = {
    name: 'clearwarns',
    description: 'Supprime les avertissements d\'un utilisateur',
    usage: '+clearwarns @utilisateur [nombre/all]',
    permissions: 'ManageMessages',
    variables: [
        { name: '@utilisateur', description: 'L\'utilisateur dont il faut supprimer les warns' },
        { name: '[nombre/all]', description: 'Nombre de warns à supprimer ou "all" pour tout supprimer' }
    ],
    async execute(message, args) {
        // Vérification des permissions
        if (!message.member.permissions.has('MANAGE_MESSAGES')) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer les avertissements.');
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('❌ Vous devez mentionner un utilisateur.');
        }

        try {
            // Charger les avertissements
            if (!fs.existsSync(warningsFile)) {
                return message.reply('✅ Cet utilisateur n\'a aucun avertissement.');
            }

            const warnings = JSON.parse(fs.readFileSync(warningsFile, 'utf8'));
            if (!warnings[user.id] || warnings[user.id].length === 0) {
                return message.reply('✅ Cet utilisateur n\'a aucun avertissement.');
            }

            const amount = args[1]?.toLowerCase();

            if (amount === 'all') {
                // Supprimer tous les avertissements
                warnings[user.id] = [];
                fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 4));

                const clearEmbed = {
                    color: 0x00ff00,
                    title: '🧹 Avertissements supprimés',
                    description: `Tous les avertissements de ${user.tag} ont été supprimés.`,
                    footer: {
                        text: `Action effectuée par ${message.author.tag}`,
                        icon_url: message.author.displayAvatarURL({ dynamic: true })
                    },
                    timestamp: new Date()
                };

                return message.channel.send({ embeds: [clearEmbed] });
            }

            const numWarns = parseInt(amount);
            if (isNaN(numWarns) || numWarns < 1) {
                return message.reply('❌ Veuillez spécifier un nombre valide d\'avertissements à supprimer ou "all".');
            }

            // Supprimer le nombre spécifié d'avertissements
            const removed = Math.min(numWarns, warnings[user.id].length);
            warnings[user.id].splice(-removed); // Supprime les warnings les plus récents

            fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 4));

            const clearEmbed = {
                color: 0x00ff00,
                title: '🧹 Avertissements supprimés',
                description: `${removed} avertissement(s) de ${user.tag} ont été supprimés.`,
                fields: [
                    {
                        name: 'Avertissements restants',
                        value: `${warnings[user.id].length}`
                    }
                ],
                footer: {
                    text: `Action effectuée par ${message.author.tag}`,
                    icon_url: message.author.displayAvatarURL({ dynamic: true })
                },
                timestamp: new Date()
            };

            message.channel.send({ embeds: [clearEmbed] });

            // Envoyer un DM à l'utilisateur
            try {
                const dmEmbed = {
                    color: 0x00ff00,
                    title: `🧹 Vos avertissements sur ${message.guild.name} ont été modifiés`,
                    description: `${removed} avertissement(s) ont été supprimés.`,
                    fields: [
                        {
                            name: 'Avertissements restants',
                            value: `${warnings[user.id].length}`
                        }
                    ],
                    timestamp: new Date()
                };
                await user.send({ embeds: [dmEmbed] });
            } catch (err) {
                console.log('Impossible d\'envoyer un DM à l\'utilisateur');
            }

        } catch (error) {
            console.error('Erreur lors de la suppression des avertissements:', error);
            message.reply('❌ Une erreur est survenue lors de la suppression des avertissements.');
        }
    }
};
