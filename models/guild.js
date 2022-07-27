const mongoose = require('mongoose');

const guildSchema = mongoose.Schema({

    guild_id: { type: String, require: true },
    announcements_channel: { type: String, require: true },
    joined_role: { type: String, require: true },

});

module.exports = mongoose.model('Guild', guildSchema);