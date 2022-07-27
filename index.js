const fs = require("fs");
const Discord = require('discord.js');
const mongoose = require('mongoose');

// Setup the client intents
const client = new Discord.Client({
  intents: ['GUILDS', "GUILD_MEMBERS", "GUILD_MESSAGE_REACTIONS", "GUILD_EMOJIS_AND_STICKERS"],
  partials: ['REACTION', 'MESSAGE', 'USER']
});

// Load the functions into the client
require('./utils/discord_functions')(client);
require('./utils/mongoose_functions')(client);
require('./utils/cron_functions')(client);
require('./utils/functions')(client);

// Set the timezone to UTC+8
process.env.TZ = 'Asia/Chongqing'

// Load the config
require("dotenv").config({
  path: "config/.env"
});

// Load mongoose
client.mongoose = require('./utils/mongoose');

// Load the client collections
client.slash = new Discord.Collection();
client.packages = new Discord.Collection();
client.handlers = new Discord.Collection();
client.locale = new Discord.Collection();

// capture errors
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

// Load all the files in the folders

fs.readdir("./events/", (err, files) => {
  console.log(`=== Loading Event Handlers ===\n`);

  if (err) return console.error(err);
  files.forEach(file => {

    if (files.length == 0) console.log(`!!! No Event Handlers, None Loaded !!!`);

    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
    console.log(`Setup Event Handler for: ${eventName}`);
  });
});

fs.readdir("./slash/", (err, files) => {
  console.log(`\n=== Loading Commands ===\n`);

  if (err) return console.error(err);

  if (files.length == 0) console.log(`!!! No Commands Found, None Loaded !!!`);

  files.forEach(f => {
    let handlerName = f.split(".")[0];
    let pull = require(`./slash/${handlerName}`);
    client.slash.set(handlerName, pull);
    console.log(`Loaded Slash Command: ${handlerName}`);
  });
});

fs.readdir("./handlers/", (err, files) => {
  console.log(`\n=== Loading Button Interaction Handlers ===\n`);

  if (err) return console.error(err);

  if (files.length == 0) console.log("!!! No Button Interaction Handlers Found, None Loaded !!!");

  files.forEach(f => {
    let handlerName = f.split(".")[0];
    let pull = require(`./handlers/${handlerName}`);
    client.handlers.set(handlerName, pull);
    console.log(`Loaded handler: ${handlerName}`);
  });
});

fs.readdir("./locale/", (err, files) => {
  console.log(`\n=== Loading Locales ===\n`);

  if (err) return console.error(err);

  if (files.length == 0) console.log("!!! No Button Locale Found, None Loaded !!!");

  files.forEach(f => {
    let localeName = f.split(".")[0];
    let pull = JSON.parse(fs.readFileSync(`./locale/${localeName}.json`))
    client.locale.set(localeName, pull);
    console.log(`Loaded locale ${localeName}`);
  });
});

// Initialize the mongoose
client.mongoose.init();

process.stdin.resume();
process.stdin.setEncoding('utf8');

console.clear()

console.log("\n")
console.log("Console Commands")
console.log("  > Exit - Closes Current MongoDB Connection and Exits")
console.log("\n")

process.stdin.on('data', function (text) {
  if (text.trim() == 'quit' || text.trim() == 'exit') {
    mongoose.connection.close(function () {
      console.log('Safely Terminated Mongoose Connection, Exiting...');
      process.exit(0);
    });
  }
});

// Start the bot
client.login(process.env.TOKEN);