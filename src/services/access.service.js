"use strict";

const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const shopModel = require("../models/shop.model");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  BadRequestError,
  ConflictRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const { findByEmail } = require("./shop.service");
const apiKeyModel = require("../models/apiKey.model");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    //check email exist
    const holderShop = await shopModel.findOne({ email }).lean();
    if (holderShop) {
      throw new BadRequestError("Error: Shop already exist");
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
        throw new BadRequestError("Error: keyStore");
      }

      //create token pair
      const tokens = await createTokenPair(
        { userId: newShop._id, email },
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
  };

  /* 
  LOGIN:
    1. Check email in db
    2. Match password
    3. Create access token, refresh token and save
    4. generate token
    5. return data
  */

  static login = async ({ email, password }) => {
    //Check email in db
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new BadRequestError("Shop doesn't exist");
    }

    //Match password
    const match = await bcrypt.compare(password, foundShop.password);
    if (!match) {
      throw new AuthFailureError("Authentication Failed");
    }

    // Create key
    const publicKey = crypto.randomBytes(64).toString("hex");
    const privateKey = crypto.randomBytes(64).toString("hex");

    //generate token
    const tokens = await createTokenPair(
      { userId: foundShop._id, email },
      publicKey,
      privateKey
    );

    await KeyTokenService.createKeyToken({
      userId: foundShop._id,
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken,
    });

    //return data
    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    return delKey;
  };
  /* 
  Refresh token: 
    1. Check mảng resfreshTokensUsed, xem token đã được sử dụng chưa
        Nếu trong mảng resfreshTokensUsed có refreshToken  -> lỗi
    2. Tìm refresh token trong db
        Nếu ko tìm thấy -> lỗi
    3. Verify token, cấp cặp token mới, đưa token cũ vào resfreshTokensUsed
  */
  static handleRefreshToken = async (refreshToken) => {
    //check xem token da dc su dung chua
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(
      refreshToken
    );

    if (foundToken) {
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.privateKey
      );

      await KeyTokenService.deleteKeyById(userId);

      throw new ForbiddenError("Something wrong happened. Please re-login");
    }

    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);

    if (!holderToken) {
      throw new AuthFailureError("Shop is not registered");
    }

    //verify token
    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );

    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new AuthFailureError("Shop is not registered");

    //tao token moi
    const tokens = await createTokenPair(
      { userId: foundShop._id, email },
      holderToken.publicKey,
      holderToken.privateKey
    );

    //update token

    await holderToken.updateOne({
      $set: { refreshToken: tokens.refreshToken },
      $addToSet: {
        refreshTokensUsed: refreshToken, //da dc su dung de lay token moi roi
      },
    });

    return {
      user: { userId, email },
      tokens,
    };
  };

  static handleRefreshTokenV2 = async ({ refreshToken, user, keyStore }) => {
    const { userId, email } = user;

    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError("Something wrong happened. Please re-login");
    }

    if (keyStore.refreshToken !== refreshToken) {
      throw new AuthFailureError("Shop is not registered");
    }

    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new AuthFailureError("Shop is not registered");

    //tao token moi
    const tokens = await createTokenPair(
      { userId: foundShop._id, email },
      keyStore.publicKey,
      keyStore.privateKey
    );

    //update token

    await keyStore.updateOne({
      $set: { refreshToken: tokens.refreshToken },
      $addToSet: {
        refreshTokensUsed: refreshToken, //da dc su dung de lay token moi roi
      },
    });

    return {
      user,
      tokens,
    };
  };
}

module.exports = AccessService;

//create private key, public key
// privateKey để khi tạo xong là sẽ đẩy qua cho user, ko lưu privateKey vào hệ thống
//privateKey dùng để sign token
//publicKey để verify token
