"use strict";
const mongoose = require("mongoose");
const { countConnect } = require("../helpers/check.connect");

const {
  db: { host, name, port },
} = require("../config/config.mongodb");

const connectString = `mongodb://${host}:${port}/${name}`;

class Database {
  constructor() {
    this.connect();
  }

  //connect
  connect(type = "mongodb") {
    if (true) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }

    mongoose
      .connect(connectString, { maxPoolSize: 50 })
      .then(() => {
        console.log(`Connected mongo db success`, connectString);
        countConnect();
      })
      .catch((err) => console.log(`Connect error`));
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const instanceMongoDb = Database.getInstance();

module.exports = instanceMongoDb;
