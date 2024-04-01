"use strict";
const { Client, GatewayIntentBits } = require("discord.js");
const { CHANNEL_ID_DISCORD, TOKEN_DISCORD } = process.env;

class LoggerService {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    //add chanel id
    this.channelId = CHANNEL_ID_DISCORD;
    this.client.on("ready", () => {
      console.log(`Logged is as ${this.client.user.tag}`);
    });
    this.client.login(TOKEN_DISCORD);
  }
  senToMessage(message = "message") {
    const channel = this.client.channels.cache.get(this.channelId);
    if (!channel) {
      console.error(`Channel not found`, this.channelId);
    }
    channel.send(message).catch((e) => console.error(e));
  }
}
module.exports = new LoggerService();
