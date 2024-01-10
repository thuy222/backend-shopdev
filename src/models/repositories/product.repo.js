"use strict";
const { Types } = require("mongoose");
const {
  product,
  electronic,
  clothing,
  furniture,
} = require("../product.model");

const queryProduct = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate("product_shop", "name email -_id") // lets you reference documents in other collections.
    .sort({ updatedAt: -1 }) //moi nhat
    .skip(skip) //number of records to skip before finding (nếu skip bằng 3, nó sẽ bỏ qua 3 bản ghi đầu tiên)
    .limit(limit)
    .lean()
    .exec();
};

const findDraftsForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const findAllPublishedForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const searchProductsByUser = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch);
  const results = await product
    .find(
      {
        isPublished: true,
        $text: { $search: regexSearch },
      },
      {
        score: { $meta: "textScore" },
      }
    )
    .sort({
      score: { $meta: "textScore" },
    })
    .lean();

  return results;
};

const publishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });

  if (!foundShop) return null;

  foundShop.isDraft = false;
  foundShop.isPublished = true;

  const { modifiedCount } = await foundShop.updateOne(foundShop); //update thanh cong thi mongodb tra ve 1, ko update thi tra ve 0

  return modifiedCount;
};

const unPublishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });

  if (!foundShop) return null;

  foundShop.isDraft = true;
  foundShop.isPublished = false;

  const { modifiedCount } = await foundShop.updateOne(foundShop); //update thanh cong thi mongodb tra ve 1, ko update thi tra ve 0

  return modifiedCount;
};

module.exports = {
  findDraftsForShop,
  publishProductByShop,
  findAllPublishedForShop,
  unPublishProductByShop,
  searchProductsByUser,
};
