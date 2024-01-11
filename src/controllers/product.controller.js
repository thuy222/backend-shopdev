"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const ProductService = require("../services/product.service");
const ProductServiceV2 = require("../services/product.service.xxx");

class ProductController {
  createProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Create New Product Successfully",
      metadata: await ProductServiceV2.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  updateProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "updateProduct Product Successfully",
      metadata: await ProductServiceV2.updateProduct(
        req.body.product_type,
        req.params.productId,
        {
          ...req.body,
          product_shop: req.user.userId,
        }
      ),
    }).send(res);
  };

  publishProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Publish Product Successfully",
      metadata: await ProductServiceV2.publishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  unPublishProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "unPublish Product Successfully",
      metadata: await ProductServiceV2.unPublishProduct({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  /**
   * @description Get all draft for shop
   * @param {Number} limit
   * @param {Number} skip
   * @returns {JSON}
   */

  getAllDraftForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get List Drafts Successfully",
      metadata: await ProductServiceV2.findAllDraftForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getAllPublishedForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get List Published Successfully",
      metadata: await ProductServiceV2.findAllPublishedForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getListSearchProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "Get getListSearchProducts Published Successfully",
      metadata: await ProductServiceV2.searchProducts(req.params),
    }).send(res);
  };

  findAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "Get findAllProducts Successfully",
      metadata: await ProductServiceV2.findAllProducts(req.query),
    }).send(res);
  };

  findProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "findProduct Successfully",
      metadata: await ProductServiceV2.findProduct({
        product_id: req.params.product_id,
      }),
    }).send(res);
  };
}

module.exports = new ProductController();
