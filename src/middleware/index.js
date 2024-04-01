"use strict";

const Logger = require("../loggers/discord.log.v2");

const pushToLogDiscord = async (req, res, next) => {
  try {
    Logger.senToMessage(req.get("host"));
  } catch (error) {
    next(error);
  }
};

module.exports = { pushToLogDiscord };
