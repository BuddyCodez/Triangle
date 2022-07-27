var CronJob = require('cron').CronJob;

module.exports = async (client) => {

    // Console.log the bots status
    console.log("+++ Bot Started, Re-Registering Commands +++")

    // Re-Register Commands + Register Commands for Guilds that were added while the bot was offline
    client.guilds.cache.map(guild => guild.id).forEach(async guild => {

        // Update the slash commands list for servers while the bot was offline incase any changes were made
        console.log(`=== Reloading/Registering Commands for Guild: ${guild} ===`)
        await client.updateSlashCommands(guild)

        // Start up CronJobs for events
        const daily = new CronJob('0 0 * * *', async function () {

            // Make sure the announcement channel exists and is valid
            let guildSettings = await client.getGuildSettings(guild)

            if (!guildSettings) return console.log("**Error:** ```No announcement channel / joined role set```\n**Suggestion:**:```Use /event announcement (channel) & /joined (role)```")

            // Check that the guild has a announcements channel set
            else if (!guildSettings.announcements_channel) return console.log("**Error:** ```No announcement channel set```\n**Suggestion:**:```Use /event announcement (channel)```")

            // Check that the guild has a joined role set
            else if (!guildSettings.joined_role) return console.log("**Error:** ```No join role set```\n**Suggestion:**:```Use /event joined (role)```")

            // Make sure the announcements channel exists and is valid still
            let AnnouncementsChannel = await client.guilds.cache.get(guild).channels.cache.get(guildSettings.announcements_channel)

            if (!AnnouncementsChannel) return console.log("**Error:** ```Announcement channel is invalid, please have it set in the settings again```\n**Suggestion:**:```Use /event announcements (channel)```", )


            // Send the daily message
            await client.sendDailyMessage(AnnouncementsChannel)

            // Attempt to create a Event if there is not one

            await client.createEvent(guild)

            // Send the Event Message

            await client.sendEventMessage(AnnouncementsChannel)


        }, null, true, 'Asia/Chongqing');

        // Start the daily CronJob
        daily.start();

    });

}