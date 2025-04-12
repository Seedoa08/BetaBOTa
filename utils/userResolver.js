module.exports = async (client, arg) => {
    // Vérifier si c'est une mention
    if (/<@!?(\d{17,19})>/.test(arg)) {
        const id = arg.match(/<@!?(\d{17,19})>/)[1];
        return await client.users.fetch(id).catch(() => null);
    }
    
    // Vérifier si c'est un ID
    if (/^\d{17,19}$/.test(arg)) {
        return await client.users.fetch(arg).catch(() => null);
    }

    return null;
};
