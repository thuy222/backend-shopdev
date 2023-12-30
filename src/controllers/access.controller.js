"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  signUp = async (req, res, next) => {
    return new CREATED({
      message: "Registered Successfully",
      metadata: await AccessService.signUp(req.body),
      options: {
        limit: 10,
      },
    }).send(res);
  };

  login = async (req, res, next) => {
    return new SuccessResponse({
      message: "Login Successfully",
      metadata: await AccessService.login(req.body),
    }).send(res);
  };

  logout = async (req, res, next) => {
    return new SuccessResponse({
      message: "Logout Successfully",
      metadata: await AccessService.logout(req.keyStore),
    }).send(res);
  };

  refreshToken = async (req, res, next) => {
    return new SuccessResponse({
      message: "Get Token Successfully",
      metadata: await AccessService.handleRefreshToken(req.body.refreshToken),
    }).send(res);
  };
}

module.exports = new AccessController();
