const {
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    Message
} = require('discord.js');

exports.run = async (client, interaction, settings) => {

    // Handle buttons interactions with the "EVENT" as the first argument 

    let [handler, command, month, year] = settings

    // Check that the guild settings exist

    let guildSettings = await client.getGuildSettings(interaction.guild.id)

    if (!guildSettings) return interaction.reply({
        content: "**Error:** ```No announcement channel / joined role set```\n**Suggestion:**:```Use /event announcement (channel) & /joined (role)```",
        ephemeral: true
    })
    else if (!guildSettings.announcements_channel) return interaction.reply({
        content: "**Error:** ```No announcement channel set```\n**Suggestion:**:```Use /event announcement (channel)```",
        ephemeral: true
    })

    else if (!guildSettings.joined_role) return interaction.reply({
        content: "**Error:** ```No join role set```\n**Suggestion:**:```Use /event joined (role)```",
        ephemeral: true
    })

    // Make sure the announcement channel is valid still
    let AnnouncementsChannel = await client.guilds.cache.get(interaction.guild.id).channels.cache.get(guildSettings.announcements_channel)

    if (!AnnouncementsChannel) return interaction.reply({
        content: "**Error:** ```Announcement channel is invalid, please have it set in the settings again```\n**Suggestion:**:```Use /event announcements (channel)```",
        ephemeral: true
    })

    // Make sure the join role is valid still
    let JoinedRole = await client.guilds.cache.get(interaction.guild.id).roles.cache.get(guildSettings.joined_role)

    if (!JoinedRole) return interaction.reply({
        content: "**Error:** ```Joined Role is invalid, please have it set in the settings again```\n**Suggestion:**:```Use /event joined (role)```",
        ephemeral: true
    })

    // Check what the command was in the button

    if (command == "JOIN") {
        // Error Codes
        // 1: User Already Exists
        // 2: Event Does Not Exist
        // DATA: Succeeded

        // Try to add the user to the event
        let addUser = await client.addUserToEvent(interaction.guild.id, interaction.user.id, month, year)

        // Handle all cases
        switch (addUser) {
            case 1:
                interaction.reply({
                    content: "**??????????????????** \n???????????????????????????????????????????????????",
                    ephemeral: true
                })
                break;
            case 2:
                interaction.reply({
                    content: "**Error:** ```This event no longer exists.```",
                    ephemeral: true
                })
                break;
            default:
                // Update the embed

                await client.sendEventMessage(AnnouncementsChannel, addUser.current_message)

                await interaction.member.roles.add(JoinedRole)

                interaction.reply({
                    content: `**???????????????** \`\`\`?????????????????????????????????${JoinedRole.name}????????????????????????????????????\`\`\``,
                    ephemeral: true
                })

                break;
        }

    } else if (command == "FAIL") {
        // User tried to fail, attempt to fail them
        
        let alreadyFailed = await client.getEventUser(interaction.guild.id, interaction.user.id, month, year)

        if (alreadyFailed) return interaction.reply({
            content: "**???????????????????????????** \n??????????????????????????????????????????????????????????????????????????????????????????????????????",
            ephemeral: true
        })

        // Check if they are already set to failed.

        let failUser = await client.failEventUser(interaction.guild.id, interaction.user.id, month, year)

        if (!failUser) return interaction.reply({
            content: "**??????????????????** \n?????????????????????????????????????????????????????????",
            ephemeral: true
        })

        else {

            if (failUser.current_message) {
                await client.sendEventMessage(AnnouncementsChannel, failUser.current_message)

                await interaction.member.roles.remove(JoinedRole)

                interaction.reply({
                    content: `"**???????????????** \`\`\`????????????????????????????????????${JoinedRole.name}????????????????????????????????????\`\`\``,
                    ephemeral: true
                })
            }

        }

    }


}

exports.data = {}