"use strict";

const { Types } = require("mongoose");
const { inventory } = require("../inventory.model");
const { convertToObjectIdMongoDb } = require("../../utils");

const insertInventory = async ({
  productId,
  shopId,
  stock,
  location = "unknown",
}) => {
  return await inventory.create({
    inven_productId: productId,
    inven_shopId: shopId,
    inven_stock: stock,
    inven_location: location,
  });
};

const reservationInventory = async ({ productId, quantity, cartId }) => {
  const query = {
    inven_productId: convertToObjectIdMongoDb(productId),
    inven_stock: { $gte: quantity },
  };

  const updateSet = {
    $inc: {
      inven_stock: -quantity,
    },
    $push: {
      inven_reservations: { quantity, cartId, createdOn: new Date() },
    },
  };

  const options = {
    upsert: true,
    new: true,
  };

  return await inventory.updateOne(query, updateSet, options);
};

module.exports = { insertInventory, reservationInventory };
