"use strict";

const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "discounts";

var discountSchema = new Schema(
  {
    discount_name: { type: String, required: true },
    discount_description: { type: String, required: true },
    discount_type: { type: String, default: "fixed_amount" }, //fixed_amount or percentage
    discount_value: { type: Number, required: true },
    discount_code: { type: String, required: true },
    discount_start_date: { type: Date, required: true },
    discount_end_date: { type: Date, required: true },
    discount_max_uses: { type: Number, required: true },
    discount_uses_count: { type: Number, required: true }, // so discount da su dung
    discount_users_used: { type: Array, default: [] }, //nhung user da su dung discount
    discount_max_uses_per_user: { type: Number, required: true }, // toi da moi user dc su dung bao nhieu
    discount_min_oder_value: { type: Number, required: true },
    discount_max_value: { type: Number, required: true },
    discount_shopId: { type: Schema.Types.ObjectId, ref: "Shop" },
    discount_is_active: { type: Boolean, default: true },
    discount_applies_to: {
      type: String,
      required: true,
      enum: ["all", "specific"],
    },
    discount_product_ids: { type: Array, default: [] }, //nhung san pham dc ap dung discount
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

module.exports = { discount: model(DOCUMENT_NAME, discountSchema) };
