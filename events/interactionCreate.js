const {
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    Message
} = require('discord.js');

module.exports = async (client, interaction) => {

    // Check if its a command 
    if (interaction.isCommand()) {

        // Load the command options
        let command = interaction.options._subcommand
        let options = interaction.options._hoistedOptions

        // Make sure the command is valid and exists in /slash/
        const cmd = client.slash.get(command)
        if (!cmd) return;

        // Check if the command is listed as a admin command, if so check if the user is an admin
        if (cmd.data.admin)
            if (interaction.member.permissions.has("0x0000000000000008")) cmd.run(client, interaction, options);
            else interaction.reply("You need \`ADMINISTRATOR\` permissions to run this command")
        else cmd.run(client, interaction, options);

    } else if (interaction.isMessageComponent()) {

        // Check if the command is a button interaction

        // Get the buttons settings
        let interactionId = interaction.customId.split("|")

        // Check if there is a handler for the button in /handlers/
        const handler = client.handlers.get(interactionId[0])
        if (!handler) return;
        else handler.run(client, interaction, interactionId);

    }
}