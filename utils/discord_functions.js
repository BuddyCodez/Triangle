module.exports = client => {

    client.updateSlashCommands = async (guildId) => {

        const data = {
            name: "event",
            description: "All Bot Commands",
            options: [{
                    name: "announcement",
                    description: "Set the announcement channel",
                    type: 1,
                    options: [{
                        name: "channel",
                        description: "Which channel would you like to use as the announcements channel?",
                        type: 7,
                        required: true,
                    }, ]
                },
                {
                    name: "joined",
                    description: "Set the joined role",
                    type: 1,
                    options: [{
                        name: "role",
                        description: "Which role would you like to use as the joined role?",
                        type: 8,
                        required: true,
                    }, ]
                },
                {
                    name: "trigger",
                    description: "Trigger a Message",
                    type: 1,
                    options: [{
                        name: "event",
                        description: "Which type of event would you like to end?",
                        type: 3,
                        required: true,
                        choices: [{
                            name: "Monthly Event Message",
                            value: "event"
                        }, {
                            name: "Create Monthly Event",
                            value: "create"
                        }, {
                            name: "Daily Announcement Message",
                            value: "daily"
                        }]
                    }, ]
                },
                {
                    name: "reset",
                    description: "Reset a users event data",
                    type: 1,
                    options: [{
                        name: "user",
                        description: "Which user would you like to reset?",
                        type: 6,
                        required: true,
                    }, ]
                }
            ]
        }

        await client.guilds.cache.get(guildId).commands.create(data);

        console.log(`+++ Successfully Registered Commands for Guild: ${guildId} +++`)

    }
}