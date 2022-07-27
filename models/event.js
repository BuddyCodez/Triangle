const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({

    guild_id: { type: String, require: true },
    month: { type: String, require: true },
    year: { type: String, require: true },
    current_message: { type: String, require: true },
    joined: [{
        user_id: { type: String, require: true },
        join_time: { type: String, require: true },
        fail_time: { type: String, require: true },
        failed: { type: Boolean, require: true },
    }],

});

module.exports = mongoose.model('Event', eventSchema);