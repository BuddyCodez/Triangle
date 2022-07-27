module.exports = async (client, guild) => {

    // Bot was added to a new guild
    console.log(`!!! Bot Was Added to Guild: ${guild.id} !!!`)
    console.log(`=== Registering Commands for Guild: ${guild.id} ===`)

    // Add the bots slash commands to that guild
    await client.updateSlashCommands(guild.id)
}