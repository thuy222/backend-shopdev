"use strict";

const mongoose = require("mongoose");
const os = require("os");
const process = require("process");

const _SECONDS = 5000;

//count connect
const countConnect = () => {
  const numConnection = mongoose.connections.length;

  console.log(`Number of connection: ${numConnection}`);
};

//check overload

const checkOverload = () => {
  setInterval(() => {
    const numConnection = mongoose.connections.length;
    const numCores = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;

    //giả sử mỗi core cpu chịu được 5 connection
    const maxConnections = numCores * 5;

    if (numConnection > maxConnections) {
      console.log(`Connection overload detected`);
      //notify.send(...)
    }

    console.log(`Active connection: ${numConnection}`);
    console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`);
  }, _SECONDS); // monitor every const _SECONDS = 5000
};

module.exports = { countConnect, checkOverload };
