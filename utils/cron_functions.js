const fs = require('fs');
const {
    MessageEmbed,
    MessageActionRow,
    MessageButton
} = require('discord.js');

module.exports = client => {

    // Load all daily messages
    let messages = JSON.parse(fs.readFileSync('./config/messages.json'))

    client.sendDailyMessage = async (AnnouncementsChannel, locale = "zn-ch") => {
        
        let current_date = new Date()

        let day_of_week = current_date.getDay()

        let local_day_of_week = client.locale.get(locale).day_of_week[day_of_week]

        // Get Daily Message

        // Get get all of the messages for today
        let day_messages = messages[day_of_week]

        // Choose a random one from the array
        let random_day_message = day_messages[Math.floor(Math.random() * day_messages.length)]

        // Send the message

        // Layout 4月19日 周三 凌晨零点
        let dateString = `${current_date.getMonth() + 1}月${current_date.getDate()}日 周${local_day_of_week} 凌晨零点`

        const announcementEmbed = new MessageEmbed()
            .setColor('#00D8DE')
            .setTitle(`📅 ${dateString}`)
            .setDescription(random_day_message)
            .setFooter({
                text: `朗尼语录`
            });

        AnnouncementsChannel.send({
            embeds: [announcementEmbed]
        })
    }

    client.sendEventMessage = async (AnnouncementsChannel, messageID = undefined, locale = "zn-ch") => {

        let guildID = AnnouncementsChannel.guild.id

        let current_date = new Date()
        let month = current_date.getMonth() + 1
        let year = current_date.getFullYear()

        let day_of_month = new Date().getDay()

        let last_day = new Date(current_date.getFullYear(), current_date.getMonth() + 1, 0);
        let end_of_month = Math.floor((last_day.getTime() + 86400000) / 1000)

        let event = await client.getEvent(guildID, month, year)

        if (!event) return false

        let past_event = await client.getEvent(guildID, month - 1, year)

        let joined = []
        let failed = []

        //weekly:
        let weeklyFullJoinArray = event.joined
        let weeklyBoard = {}

        if (!past_event) past_event = {
            joined: []
        }

        //monthly:
        let monthlyFullJoinArray = past_event.joined
        let monthlyBoard = {}

        if (weeklyFullJoinArray.length > 0) {

            function getMonday(d) {
                d = new Date(d);
                var day = d.getDay(),
                    diff = d.getDate() - day + (day == 0 ? -6 : 1);
                return new Date(d.setDate(diff));
            }

            let monday = Number(getMonday(new Date()))

            let grouped = await client.groupBy(weeklyFullJoinArray, 'failed')

            if (grouped.true) failed = grouped.true.map(obj => `<@${obj.user_id}>`);
            if (grouped.false) joined = grouped.false.map(obj => `<@${obj.user_id}>`);

            weeklyFullJoinArray.forEach(obj => {

                let join_time = Number(obj.join_time)
                let fail_time = Number(obj.fail_time)
            
                // Check if join_time is before monday
                if (join_time < monday) join_time = monday

                let number_of_12;

                if (fail_time != 0) {
                    number_of_12 = Math.floor((fail_time - join_time) / 43200000)
                } else {
                    number_of_12 = Math.floor((Date.now() - join_time) / 43200000)
                }

                let days = Math.round(number_of_12 / 2)

                if (days < 1 || days > 32) return

                if (!weeklyBoard[days]) weeklyBoard[days] = [`<@${obj.user_id}>`]
                else weeklyBoard[days].push(`<@${obj.user_id}>`)

            })
        }

        if (past_event && monthlyFullJoinArray.length > 0) {

            await client.failAllEventUsers(guildID, month - 1, year)

            monthlyFullJoinArray.forEach(obj => {

                let join_time = Number(obj.join_time)
                let fail_time = Number(obj.fail_time)

                let number_of_12;

                if (fail_time != 0) {
                    number_of_12 = Math.floor((fail_time - join_time) / 43200000)
                } else {
                    number_of_12 = Math.floor((Date.now() - join_time) / 43200000)
                }

                let days = Math.round(number_of_12 / 2)

                if (days < 1 || days > 32) return

                if (!monthlyBoard[days]) monthlyBoard[days] = [`<@${obj.user_id}>`]
                else monthlyBoard[days].push(`<@${obj.user_id}>`)

            })
        }

        const weekly_ordered = Object.keys(weeklyBoard).sort().reduce(
            (obj, key) => {
                obj[key] = weeklyBoard[key];
                return obj;
            }, {}
        );

        let embedDesc;

        let weekly_num = 1

        let weekly_finished = []

        Object.entries(weekly_ordered).reverse().forEach(([key, value]) => {
            weekly_finished.push(`\`${weekly_num}.\` \`${key}天 - \`${value.join(", ")}`);
            weekly_num++
        });

        const monthly_ordered = Object.keys(monthlyBoard).sort().reduce(
            (obj, key) => {
                obj[key] = monthlyBoard[key];
                return obj;
            }, {}
        );

        let monthly_num = 1

        let monthly_finished = []

        Object.entries(monthly_ordered).reverse().forEach(([key, value]) => {
            monthly_finished.push(`\`${monthly_num}.\` \`${key}天 - \`${value.join(", ")}`);
            monthly_num++
        });

        day_of_month = 3

        let joinedDesc;

        // No one has joined or failed
        if (joined.length == 0 && failed.length == 0) joinedDesc = "你要成为第一个吗？"

        // No one is in joined, only failed
        else if (joined.length == 0 && failed.length != 0) joinedDesc = `真糟糕，本月所有人都失败了\n\n__**失败的:**__\n${failed.join(", ")}`

        // Joined has members, but failed is empty
        else if (joined.length != 0 && failed.length == 0) joinedDesc = `很坚挺呢。还没有一个失败的\n\n__**已报名:**__\n${joined.join(", ")}`

        // Neither are empty
        else joinedDesc = `__**已报名:**__\n${joined.join(", ")}\n\n__**失败的:**__\n${failed.join(", ")}`

        if (day_of_month == 1) {

            // Only show monthly leaderboard
            
            if (monthly_finished.length == 0) monthly_finished = ["上个月没有记录"]

            embedDesc = `🏆 **${month - 1}月禁欲榜**\n${monthly_finished.slice(0, 5).join("\n")}\n\n🤚 **参与者 - 距离结束还有** <t:${end_of_month}:R>\n${joinedDesc}`

        } else if (day_of_month == 2 || day_of_month == 3) {
            // Show monthly and weekly leaderboard

            if (monthly_finished.length == 0) monthly_finished = ["还在记录中"]

            if (weekly_finished.length == 0) weekly_finished = ["都会有谁呢？"]

            embedDesc = `🏆 **${month - 1}月禁欲榜**\n${monthly_finished.slice(0, 5).join("\n")}\n\n🏆 **本周禁欲榜**\n${weekly_finished.slice(0, 5).join("\n")}\n\n🤚 **参与者 - 距离结束还有** <t:${end_of_month}:R>\n${joinedDesc}`

        } else {
            // Only Show weekly leaderboard

            if (weekly_finished.length == 0) weekly_finished = ["都会有谁呢？"]

            embedDesc = `🏆 **本周禁欲榜**\n${weekly_finished.slice(0, 5).join("\n")}\n\n🤚 **参与者 - 距离结束还有** <t:${end_of_month}:R>\n${joinedDesc}`

        }

        const row = new MessageActionRow()

        row.addComponents(
            (new MessageButton()
                .setCustomId(`EVENT|JOIN|${month}|${year}`)
                .setLabel("我参加")
                .setEmoji("😈")
                .setStyle('SUCCESS'))
        )

        row.addComponents(
            (new MessageButton()
                .setCustomId(`EVENT|FAIL|${month}|${year}`)
                .setLabel("我失败了")
                .setEmoji("🥀")
                .setStyle('DANGER'))
        )

        const eventEmbed = new MessageEmbed()
            .setColor('#00D8DE')
            .setDescription(embedDesc)
            .setFooter({
                text: `规则：每月可加入一次。我记录你的总禁欲天数。失败的时候，回来点红色的按钮。让大家看看，你会能禁欲多久`
            });

        if (messageID) {
            let currentDate = new Date(new Date(0).getFullYear(year, month));
            let AfterDate = CurrentDate.setDate(currentDate.getDate() + 7); // after 7 days of showing the leaderboard.
            if (currentDate > AfterDate) {
                await AnnouncementsChannel.messages
  .fetch(messageID)
                    .then((msg) => {
                        msg.delete();
                        console.log("<<<< LeaderBoard IS Removed After 7 Days >>>>>>");
                    })
            }
                await AnnouncementsChannel.messages
  .fetch(messageID)
  .then((msg) =>
    msg.edit({
      embeds: [eventEmbed],
      components: [row],
    })
  );

            return true

        } else {
            let message = await AnnouncementsChannel.send({
                embeds: [eventEmbed],
                components: [row]
            })

            let updateMessage = await client.updateEventMessage(guildID, message.id, month, year)

            if (!updateMessage) return false

            return true
        }

    }

}