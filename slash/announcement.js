const {
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    Message
} = require('discord.js');

exports.run = async (client, interaction, settings) => {

    // Handle the slash command "Announcement"

    // Check the channels type
    let type = settings[0].channel.type

    // Make sure its not a category, or a voice channel
    if(type != "GUILD_TEXT") return interaction.reply({
        content: "**Error:** ```Channel Type Mismatch```\n**Suggestion:**:```This command requires a text channel to be set as the target, did you choose a category?```",
        ephemeral: true
    })

    // If its valid set it as the announcements channel
    client.setGuildChannel(interaction.guild.id, settings[0].channel.id)

    // Reply that it worked
    return interaction.reply({
        content: "**Success:** ```Changed/Set Guild Announcement Channel```",
        ephemeral: true
    })

}

exports.data = {
    admin: true
}