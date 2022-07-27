const {
    Event,
    Guild
} = require('../models');

module.exports = client => {

    client.createGuild = async (guildID, channel = "", role = "") => {

        const new_guild = new Guild({
            guild_id: guildID,
            announcements_channel: channel,
            joined_role: role,
            locale: "zn-ch"
        });

        await new_guild.save();

        console.log(`<<< Created Guild: ${guildID} >>>`);

        return new_guild;

    }

    client.getGuildSettings = async (guildID) => {
        let fetched_guild = await Guild.findOne({
            guild_id: guildID,
        });

        if (!fetched_guild) {
            return await client.createGuild(guildID)
        } else {
            console.log(`<<< Fetched Guild: ${guildID} >>>`);
            return fetched_guild
        }

    };

    client.setGuildChannel = async (guildID, channel) => {
        let fetched_guild = await Guild.findOneAndUpdate({
            guild_id: guildID,
        }, {
            announcements_channel: channel,
        })

        console.log(`<<< Attempting to set Guild Channel for Guild: ${guildID} >>>`);

        if (!fetched_guild) {
            console.log(`<<< Guild Not Found: ${guildID}... Creating >>>`);
            client.createGuild(guildID, channel)
        } else console.log(`<<< Guild Channel Set for Guild: ${guildID} >>>`);

        return true
    }

    client.setGuildRole = async (guildID, role) => {
        let fetched_guild = await Guild.findOneAndUpdate({
            guild_id: guildID,
        }, {
            joined_role: role,
        })

        console.log(`<<< Attempting to set Guild Role for Guild: ${guildID} >>>`);

        if (!fetched_guild) {
            console.log(`<<< Guild Not Found: ${guildID}... Creating >>>`);
            client.createGuild(guildID, "", role)
        } else console.log(`<<< Guild Role Set for Guild: ${guildID} >>>`);

        return true
    }

    client.createEvent = async (guildID) => {

        let current_date = new Date()
        let month = current_date.getMonth() + 1
        let year = current_date.getFullYear()

        let exists = await client.getEvent(guildID, month, year)

        if (!exists) {
            const new_event = new Event({
                guild_id: guildID,
                month: month,
                year: year,
            });

            await new_event.save();

            console.log(`<<< Created Event for Guild: ${guildID} >>>`);

            return true;
        } else return false


    }

    client.checkEventUserExists = async (guildID, userID, month, year) => {
        let fetched_event_user = await Event.findOne({
            guild_id: guildID,
            month: month,
            year: year,
            joined: {
                $elemMatch: {
                    user_id: userID
                }
            }
        })

        if (fetched_event_user) return true
        else return false
    }

    client.failEventUser = async (guildID, userID, month, year) => {


        let fetched_event = await Event.findOneAndUpdate({
            guild_id: guildID,
            month: month,
            year: year,
            "joined.user_id": userID,
        }, {
            $set: {
                "joined.$.fail_time": Date.now(),
                "joined.$.failed": true,
            }
        })

        if (fetched_event) return fetched_event
        else return false

    }

    client.failAllEventUsers = async (guildID, month, year) => {


        let fetched_event = await Event.update({
            guild_id: guildID,
            month: month,
            year: year,
            "joined.failed": false
        }, {
            $set: {
                "joined.$[elem].fail_time": Date.now(),
                "joined.$[elem].failed": true,
            }
        }, {
            "arrayFilters": [{
                "elem.failed": false
            }],
            "multi": true
        })

        if (fetched_event) return fetched_event
        else return false

    }

    client.getEvent = async (guildID, month, year) => {

        let fetched_event = await Event.findOne({
            guild_id: guildID,
            month: month,
            year: year,
        })

        if (!fetched_event) return false
        else return fetched_event

    }

    client.getEventUser = async (guildID, userID, month, year) => {

        let fetched_event = await Event.findOne({
            guild_id: guildID,
            month: month,
            year: year,
            joined: {
                $elemMatch: {
                    user_id: userID,
                    failed: true,
                }
            }
        })

        console.log(fetched_event)

        if (!fetched_event) return false
        else return fetched_event

    }

    client.updateEventMessage = async (guildID, messageID, month, year) => {

        let fetched_event = await Event.findOneAndUpdate({
            guild_id: guildID,
            month: month,
            year: year,
        }, {
            current_message: messageID
        })

        if (!fetched_event) return false
        else return true

    }

    client.addUserToEvent = async (guildID, userID, month, year) => {

        // Error Codes
        // 1: User Already Exists
        // 2: Event Does Not Exist
        // DATA: Succeeded

        let eventUser = await client.checkEventUserExists(guildID, userID, month, year)

        if (eventUser) return 1

        var userData = {
            user_id: userID,
            join_time: Date.now(),
            fail_time: "",
            failed: false,
        };

        let fetched_event = await Event.findOneAndUpdate({
            guild_id: guildID,
            month: month,
            year: year,
        }, {
            $push: {
                joined: userData
            }
        })

        if (!fetched_event) return 2

        return fetched_event
    }

    client.removeUserFromEvent = async (guildID, userID, month, year) => {

        let removed_user = await Event.updateOne({
            guild_id: guildID,
            month: month,
            year: year,
        }, {
            $pull: {
                joined: {
                    user_id: userID,
                },
            },
        });

        if (removed_user) {

            let guildSettings = await client.getGuildSettings(guildID)

            let event = await client.getEvent(guildID, month, year)

            if (!event) return console.log(`<<< Event Not Found: ${guildID} >>>`)

            if (!guildSettings.announcements_channel) return console.log("**Error:** ```No announcement channel set```\n**Suggestion:**:```Use /event announcement (channel)```")

            let AnnouncementsChannel = await client.guilds.cache.get(guildID).channels.cache.get(guildSettings.announcements_channel)

            if (!AnnouncementsChannel) return console.log("**Error:** ```Announcement channel is invalid, please have it set in the settings again```\n**Suggestion:**:```Use /event announcements (channel)```", )

            client.sendEventMessage(AnnouncementsChannel, event.current_message)
        }

        return removed_user;

    }
}