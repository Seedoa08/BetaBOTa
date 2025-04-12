// Remplacez ceci :
const { prefix } = require('../config.json');

// Par ceci :
const prefix = process.env.BOT_PREFIX || '+';
