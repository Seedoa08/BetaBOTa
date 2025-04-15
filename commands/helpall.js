const { prefix } = require('../config/globals');

module.exports = {
    name: 'helpall',
    description: 'Affiche toutes les commandes disponibles de A à Z avec leurs variantes',
    usage: '+helpall',
    permissions: 'Aucune',
    async execute(message) {
        const commands = [...message.client.commands.values()]
            .sort((a, b) => a.name.localeCompare(b.name));

        const embeds = [];
        let currentEmbed = {
            color: 0x0099ff,
            title: '📚 Liste complète des commandes',
            description: 'Voici toutes les commandes disponibles, triées de A à Z',
            fields: [],
            footer: {
                text: `Page {current}/{total} • Demandé par ${message.author.tag}`,
                icon_url: message.author.displayAvatarURL({ dynamic: true })
            }
        };

        let fieldCount = 0;
        const maxFieldsPerEmbed = 25;

        for (const cmd of commands) {
            // Créer un nouveau embed si on atteint la limite de champs
            if (fieldCount >= maxFieldsPerEmbed) {
                embeds.push(currentEmbed);
                currentEmbed = {
                    color: 0x0099ff,
                    title: '📚 Liste complète des commandes (suite)',
                    fields: [],
                    footer: {
                        text: `Page {current}/{total} • Demandé par ${message.author.tag}`,
                        icon_url: message.author.displayAvatarURL({ dynamic: true })
                    }
                };
                fieldCount = 0;
            }

            // Construire la description détaillée de la commande
            let fullDescription = [
                cmd.description || 'Pas de description disponible.',
                '',
                `📌 **Usage:** \`${cmd.usage || prefix + cmd.name}\``,
                `🔑 **Permissions:** ${cmd.permissions || 'Aucune'}`
            ];

            // Ajouter les variables/options si elles existent
            if (cmd.variables && cmd.variables.length > 0) {
                fullDescription.push('\n📝 **Options:**');
                fullDescription.push(cmd.variables.map(v => 
                    `• \`${v.name}\`: ${v.description}`
                ).join('\n'));
            }

            // Ajouter les alias si ils existent
            if (cmd.aliases && cmd.aliases.length > 0) {
                fullDescription.push(`\n🔄 **Alias:** ${cmd.aliases.map(a => `\`${a}\``).join(', ')}`);
            }

            currentEmbed.fields.push({
                name: `${prefix}${cmd.name}`,
                value: fullDescription.join('\n')
            });

            fieldCount++;
        }

        // Ajouter le dernier embed s'il contient des champs
        if (currentEmbed.fields.length > 0) {
            embeds.push(currentEmbed);
        }

        // Mettre à jour les numéros de page dans les footers
        embeds.forEach((embed, index) => {
            embed.footer.text = embed.footer.text
                .replace('{current}', index + 1)
                .replace('{total}', embeds.length);
        });

        try {
            const helpMessage = await message.reply('📚 **Guide complet des commandes** - Envoi en cours...');
            
            // Envoyer chaque embed avec un délai pour éviter le rate limiting
            for (const embed of embeds) {
                await message.channel.send({ embeds: [embed] });
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            await helpMessage.edit('✅ **Guide complet des commandes envoyé !**\n*Utilisez les commandes individuelles pour plus de détails.*');
        } catch (error) {
            console.error('Erreur lors de l\'envoi du guide complet:', error);
            message.reply('❌ Une erreur est survenue lors de l\'envoi du guide complet.');
        }
    }
};
