"use strict";

const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const shopModel = require("../models/shop.model");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    try {
      //check email exist
      const holderShop = await shopModel.findOne({ email }).lean();

      if (holderShop) {
        return {
          code: "xxx",
          message: "Shop already registered",
        };
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        roles: [RoleShop.SHOP],
      });

      if (newShop) {
        //create private key, public key

        const publicKey = crypto.randomBytes(64).toString("hex");
        const privateKey = crypto.randomBytes(64).toString("hex");

        console.log({ privateKey, publicKey }); // save collection key store

        const keyStore = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          privateKey,
        });

        if (!keyStore) {
          return {
            code: "xxx",
            message: "keyStore error",
          };
        }

        //create token pair
        const tokens = await createTokenPair(
          { userId: newShop._id, email, name },
          publicKey,
          privateKey
        );

        console.log(`create token success::`, tokens);

        return {
          code: 201,
          metadata: {
            shop: getInfoData({
              fields: ["_id", "name", "email"],
              object: newShop,
            }),
            tokens,
          },
        };
      }

      return {
        code: 200,
        metadata: null,
      };
    } catch (error) {
      console.log("loiday", error);

      return {
        code: "error at access.service.js",
        message: error.message,
        status: "error",
      };
    }
  };
}

module.exports = AccessService;

//create private key, public key
// privateKey để khi tạo xong là sẽ đẩy qua cho user, ko lưu privateKey vào hệ thống
//privateKey dùng để sign token
//publicKey để verify token
