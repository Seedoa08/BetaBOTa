const { ownerId } = require('../config/owner');

class ErrorHandler {
    constructor(client) {
        this.client = client;
    }

    async handleError(error, context) {
        // Log l'erreur dans la console
        console.error(`Erreur dans ${context}:`, error);

        // Ignorer certaines erreurs non critiques
        if (error.code === 50035 && error.message.includes('Unknown message')) {
            return; // Message supprimé, on ignore silencieusement
        }

        // Préparer le message d'erreur détaillé
        const errorDetails = {
            context,
            message: error.message,
            code: error.code,
            status: error.status,
            url: error.url,
            method: error.method
        };

        const errorMessage = [
            `❌ **Erreur détectée dans ${context}**`,
            '```js',
            `Message: ${errorDetails.message}`,
            `Code: ${errorDetails.code || 'N/A'}`,
            `Status: ${errorDetails.status || 'N/A'}`,
            errorDetails.url ? `URL: ${errorDetails.url}` : null,
            errorDetails.method ? `Method: ${errorDetails.method}` : null,
            '```'
        ].filter(Boolean).join('\n');

        try {
            const owner = await this.client.users.fetch(ownerId);
            if (owner) {
                // Envoyer un nouveau message au lieu de répondre
                await owner.send(errorMessage).catch(err => {
                    console.error('Impossible d\'envoyer l\'erreur en DM:', err);
                });
            }
        } catch (err) {
            console.error('Erreur lors de l\'envoi du message à l\'owner:', err);
        }

        return error;
    }

    // Méthode pour gérer les réponses aux messages de manière sécurisée
    async safeReply(message, content) {
        try {
            if (message.deleted) return false;
            await message.reply(content);
            return true;
        } catch (error) {
            console.error('Erreur lors de la réponse:', error);
            try {
                await message.channel.send(content);
                return true;
            } catch (channelError) {
                console.error('Erreur lors de l\'envoi dans le canal:', channelError);
                return false;
            }
        }
    }
}

module.exports = ErrorHandler;
