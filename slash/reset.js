const {
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    Message
} = require('discord.js');

exports.run = async (client, interaction, settings) => {


    // Get the current date/year to find the ongoing event
    let current_date = new Date()
    let month = current_date.getMonth() + 1
    let year = current_date.getFullYear()

    // Try and remove the user from the event
    let removed_user = await client.removeUserFromEvent(interaction.guild.id, settings[0].user.id, month, year)

    // Handle the result
    if (!removed_user || removed_user.modifiedCount < 1) interaction.reply({
        content: "**Error:** \`\`\`Failed to Remove User From Event for this month\`\`\`\n **Suggestion:**:```Could this user not be apart of the monthly event?```",
        ephemeral: true
    })

    else interaction.reply({
        content: `**Success:** \`\`\`Remove User From Event For This Month.\`\`\``,
        ephemeral: true
    })

}

exports.data = {
    admin: true
}