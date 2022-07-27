const {
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    Message
} = require('discord.js');

exports.run = async (client, interaction, settings) => {

    // Set the join role
    client.setGuildRole(interaction.guild.id, settings[0].role.id)

    // Reply that it worked
    return interaction.reply({
        content: "**Success:** ```Changed/Set Guild Joined Role```",
        ephemeral: true
    })

}

exports.data = {
    admin: true
}