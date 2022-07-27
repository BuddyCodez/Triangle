const {
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    Message
} = require('discord.js');

exports.run = async (client, interaction, settings) => {

    // Get the settings for the guild

    let guildSettings = await client.getGuildSettings(interaction.guild.id)

    if (!guildSettings) return interaction.reply({
        content: "**Error:** ```No announcement channel set}```\n**Suggestion:**:```Use /set (channel)```",
        ephemeral: true
    })
    else if (!guildSettings.announcements_channel) return interaction.reply({
        content: "**Error:** ```No announcement channel set}```\n**Suggestion:**:```Use /set (channel)```",
        ephemeral: true
    })

    // Make sure the announcement channel is valid still
    let AnnouncementsChannel = await client.guilds.cache.get(interaction.guild.id).channels.cache.get(guildSettings.announcements_channel)

    if (!AnnouncementsChannel) return interaction.reply({
        content: "**Error:** ```Announcement channel is invalid, please have it set in the settings again```\n**Suggestion:**:```Use /set (channel)```",
        ephemeral: true
    })

    // Send the daily message

    switch (settings[0].value) {
        case "event":

            // Try and send the event message
            let eventMessage = await client.sendEventMessage(AnnouncementsChannel)

            // Handle all cases
            if (!eventMessage) interaction.reply({
                content: "**Error:** \`\`\`Failed to Trigger Event Message\`\`\`\n**Suggestion:**:```Is a event not ongoing? This should only be possible in the testing stages of the bot, or if the bot has not been invited before the 1st of the month. To fix this run /trigger event:Create Monthly Event```",
                ephemeral: true
            })

            else interaction.reply({
                content: `**Success:** \`\`\`Triggered Event Message\`\`\`\n**Channel:** <#${guildSettings.announcements_channel}>\n**Notice:** \`\`\`This embed WILL and HAS replaced any old event embeds, reactions on this message will not update old embeds.\`\`\``,
                ephemeral: true
            })

            break;
        case "daily":

            // Try and send the daily message

            await client.sendDailyMessage(AnnouncementsChannel, guildSettings.locale)

            // Handle all cases
            interaction.reply({
                content: `**Success:** \`\`\`Triggered Daily Message\`\`\`\n**Channel:** <#${guildSettings.announcements_channel}>`,
                ephemeral: true
            })

            break;
        case "create":

            // Try and create a event for the current month
            let createEvent = await client.createEvent(interaction.guild.id)

            // Handle all cases
            if (!createEvent) interaction.reply({
                content: "**Error:** \`\`\`Failed to Create Event for this month\`\`\`\n**Suggestion:**:```This error most likely means a event already exists for this month```",
                ephemeral: true
            })

            else interaction.reply({
                content: `**Success:** \`\`\`Created Event For This Month.\`\`\``,
                ephemeral: true
            })

            break;
        default:

            // If they input something custom in, say its invalid
            interaction.reply({
                content: "**Error:** ```Trigger Target Mismatch```\n**Suggestion:**:```Did you input something other then the provided options?```",
                ephemeral: true
            })

            break;
    }

}

exports.data = {
    admin: true
}