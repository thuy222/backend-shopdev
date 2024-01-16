"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const CartService = require("../services/cart.service");

class CartController {
  addToCart = async (req, res, next) => {
    return new SuccessResponse({
      message: "Create new cart Successfully",
      metadata: await CartService.addToCart(req.body),
    }).send(res);
  };

  updateCart = async (req, res, next) => {
    return new SuccessResponse({
      message: "updateCart  cart Successfully",
      metadata: await CartService.addToCartV2(req.body),
    }).send(res);
  };

  deleteCart = async (req, res, next) => {
    return new SuccessResponse({
      message: "deleteCart  cart Successfully",
      metadata: await CartService.deleteUserCart(req.body),
    }).send(res);
  };

  listCart = async (req, res, next) => {
    return new SuccessResponse({
      message: "listCart  cart Successfully",
      metadata: await CartService.getListUSerCart(req.query),
    }).send(res);
  };
}

module.exports = new CartController();
