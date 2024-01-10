"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();

router.get(
  "/search/:keySearch",
  asyncHandler(productController.getListSearchProducts)
);

//authentication middleware
router.use(authentication);

router.post("", asyncHandler(productController.createProduct));

router.post("/publish/:id", asyncHandler(productController.publishProduct));

router.post("/unpublish/:id", asyncHandler(productController.unPublishProduct));

//query
router.get("/drafts/all", asyncHandler(productController.getAllDraftForShop));

router.get(
  "/published/all",
  asyncHandler(productController.getAllPublishedForShop)
);

module.exports = router;
