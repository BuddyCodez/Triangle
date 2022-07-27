const { MessageEmbed, MessageAttachment } = require("discord.js");
const fs = require('fs');

exports.run = async (client, interaction, settings) => {
    if (!interaction.isSelectMenu() && interaction.guild) return;
    const config = JSON.parse(fs.readFileSync('config/thankyou.json'));


    const embed = new MessageEmbed()
        .setTitle("已发送")
        .setColor('#00D8DE')
        .setDescription(`"**${config.messages[parseInt(interaction.values[0])].text}卡**"成功递出`);

    await interaction.message.delete()
    await interaction.user.send({content: null, embeds:[embed], components: []})
 
    const guild = client.guilds.cache.first();
    const channel = guild.channels.cache.get(config.settings.responseChannel);

    const reactionChannel = guild.channels.cache.get(settings[2]);
    const reactedMessage = await reactionChannel.messages.fetch(settings[1]);

    let img = config.messages[parseInt(interaction.values[0])].image;
    let path = './assets/thankYouCards/' + img;
    const image = await client.genThankYouCard(path, interaction.user);
    
    // craft the attachment
    const attachment = new MessageAttachment(image, `thank-you.png`);

    if (channel) {
        await channel.send({content: `<@${reactedMessage.author.id}>，你收到了一张来自${interaction.user.toString()}的卡片`, files: [attachment]});
    }
}