const isOwner = require('../utils/isOwner');

module.exports = {
    name: 'eval',
    description: 'Évalue du code JavaScript',
    usage: '+eval <code> [--async] [--silent] [--depth=number]',
    permissions: 'OwnerOnly',
    variables: [
        { name: '--async', description: 'Exécute le code de manière asynchrone' },
        { name: '--silent', description: 'N\'affiche pas le résultat' },
        { name: '--depth', description: 'Profondeur d\'inspection des objets' }
    ],
    async execute(message, args) {
        // Commande réservée uniquement aux owners
        if (!isOwner(message.author.id)) {
            return message.reply('❌ Cette commande est réservée aux owners du bot.');
        }

        // Extraire les flags
        const isAsync = args.includes('--async');
        const isSilent = args.includes('--silent');
        const depthFlag = args.find(arg => arg.startsWith('--depth='));
        const depth = depthFlag ? parseInt(depthFlag.split('=')[1]) : 0;

        // Nettoyer les arguments
        args = args.filter(arg => !arg.startsWith('--'));
        let code = args.join(' ');

        if (!code) {
            return message.reply('❌ Veuillez fournir du code à exécuter.');
        }

        // Préparation du code pour l'exécution asynchrone si nécessaire
        if (isAsync && !code.includes('return')) {
            code = `(async () => { ${code} })()`;
        }

        const startTime = process.hrtime();

        try {
            // Exécution du code
            let evaled = await eval(isAsync ? code : code);

            // Calcul du temps d'exécution
            const execTime = process.hrtime(startTime);
            const execTimeMs = (execTime[0] * 1000 + execTime[1] / 1000000).toFixed(2);

            // Formatage du résultat
            if (typeof evaled !== 'string') {
                evaled = inspect(evaled, { depth: depth || 2, colors: false });
            }

            // Tronquer le résultat si trop long
            const truncated = evaled.length > 1900;
            if (truncated) {
                evaled = evaled.slice(0, 1900) + '...';
            }

            if (!isSilent) {
                const resultEmbed = new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle('✅ Code exécuté avec succès')
                    .addFields(
                        { name: '📥 Entrée', value: `\`\`\`js\n${code}\n\`\`\`` },
                        { name: '📤 Sortie', value: `\`\`\`js\n${evaled}\n\`\`\`` },
                        { name: '⏱️ Temps d\'exécution', value: `${execTimeMs}ms`, inline: true },
                        { name: '📏 Taille', value: `${evaled.length} caractères`, inline: true },
                        { name: '📊 Type', value: `${typeof evaled}`, inline: true }
                    )
                    .setFooter({ text: truncated ? '⚠️ Résultat tronqué' : '✅ Résultat complet' });

                await message.reply({ embeds: [resultEmbed] });
            }
        } catch (err) {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('❌ Erreur d\'exécution')
                .addFields(
                    { name: '📥 Entrée', value: `\`\`\`js\n${code}\n\`\`\`` },
                    { name: '⚠️ Erreur', value: `\`\`\`js\n${err.stack || err}\n\`\`\`` }
                );

            await message.reply({ embeds: [errorEmbed] });
        }
    }
};
