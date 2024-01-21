"use strict";
const { Types } = require("mongoose");
const { inventory } = require("../models/inventory.model");
const { getProductById } = require("../models/repositories/product.repo");
const { BadRequestError } = require("../core/error.response");

class InventoryService {
  static async addStockToInventory({
    stock,
    productId,
    shopId,
    location = "1234 Tran Phu, HCM City",
  }) {
    const product = await getProductById(productId);
    if (!product) {
      throw new BadRequestError("Product does not exist addStockToInventory");
    }
    const query = {
      inven_shopId: shopId,
      invent_productId: productId,
    };

    const updateSet = {
      $inc: {
        inven_stock: stock,
      },
      $set: {
        inven_location: location,
      },
    };

    const options = { upsert: true, new: true };

    return await inventory.findByIdAndUpdate(query, updateSet, options);
  }
}

module.exports = InventoryService;
