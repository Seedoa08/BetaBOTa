const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'nickname',
    description: 'Change le pseudo d\'un membre.',
    usage: '+nickname @utilisateur [nouveau pseudo]',
    permissions: 'ManageNicknames',
    variables: [
        { name: '@utilisateur', description: 'L\'utilisateur dont on veut changer le pseudo' },
        { name: 'nouveau pseudo', description: 'Le nouveau pseudo (vide pour réinitialiser)' }
    ],
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer les pseudos.');
        }

        const member = message.mentions.members.first();
        if (!member) {
            return message.reply('❌ Mentionnez un utilisateur.');
        }

        const newNickname = args.slice(1).join(' ');

        try {
            await member.setNickname(newNickname);
            message.reply(`✅ Pseudo ${newNickname ? 'changé en ' + newNickname : 'réinitialisé'} pour ${member.user.tag}.`);
        } catch (error) {
            message.reply('❌ Je ne peux pas modifier ce pseudo.');
        }
    }
};
