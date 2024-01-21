"use strict";

const express = require("express");
const InventoryController = require("../../controllers/inventory.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const router = express.Router();

router.use(authenticationV2);

router.post("", asyncHandler(InventoryController.addStockToInventory));

module.exports = router;
