"use strict";

const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (msg.content === "hello") {
    msg.reply(`Hello, How can I help you`);
  }
});

const token =
  "MTIxNjYxMzA0NDEwMTA1NDUyNw.GRDIoA.xKkvXJEpjUTZkyDr01tayhQpVig9PGmNUZzv0A";

client.login(token);
