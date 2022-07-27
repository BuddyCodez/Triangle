const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const fs = require('fs');

module.exports = async (client, reaction, user) => {
    
    const fullReactedMessage = await reaction.message.channel.messages.fetch(reaction.message.id)
    if (fullReactedMessage.author.bot) return
    
    const config = JSON.parse(fs.readFileSync('config/thankyou.json'));

    let reactToThankChannel = config.settings.reactions.some(r => r == reaction.emoji.name);
    let reactToThankReaction = config.settings.reactionChannels.some(c => c == reaction.message.channelId)

    if (reactToThankChannel && reactToThankReaction) {
        // send a DM message to pick a message
        let messageSelect = new MessageSelectMenu()
            .setPlaceholder('选择一张乐园卡片')
            .setCustomId('MSGSELECT|' + reaction.message.id + '|' + reaction.message.channelId);

        config.messages.forEach((message, index) => {
            messageSelect.addOptions({
                label: message.text,
                value: `${index}`
            })
        });

        let response = new MessageActionRow()
            .addComponents(messageSelect);

        let userDm = await user.send({ content: "你想给对方发张卡片吗？", components: [response]});

        let choise = await userDm.awaitMessageComponent({
            filter: () => {},
            time: 40000
        }).catch(e => {
            try {
                userDm.edit({ content: "没事，下次再看看吧", components: []})
            } catch(e) { }
        });

        // setTimeout(async function () {
        //     await userDm.delete();
        // }, 20000);
    }
}