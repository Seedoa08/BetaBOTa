/**
 * Résout un utilisateur à partir d'un identifiant
 * @param {Client} client Le client Discord
 * @param {string} identifier L'identifiant (ID, mention, tag)
 * @returns {Promise<User|null>} L'utilisateur trouvé ou null
 */
async function userResolver(client, identifier) {
    try {
        // Nettoyer l'identifiant des mentions
        identifier = identifier.replace(/[<@!>]/g, '');

        // Essayer de récupérer par ID
        try {
            return await client.users.fetch(identifier);
        } catch {
            // Continuer si non trouvé par ID
        }

        // Chercher par tag si contient #
        if (identifier.includes('#')) {
            const [username, discriminator] = identifier.split('#');
            return client.users.cache.find(u => 
                u.username === username && u.discriminator === discriminator
            );
        }

        // Chercher par nom d'utilisateur
        return client.users.cache.find(u => u.username === identifier);
    } catch (error) {
        console.error('Erreur dans userResolver:', error);
        return null;
    }
}

module.exports = userResolver;
