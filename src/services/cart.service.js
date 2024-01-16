"use strict";

const { cart } = require("../models/cart.model");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const { getProductById } = require("../models/repositories/product.repo");

/* 
Key feature:
    1. add product to cart [user]
    2. reduce/increase product quantity [user]
    3. get cart [user]
    4. delete card, delete card item [user]
*/

class CartService {
  static async createUserCart({ userId, product }) {
    const query = { cart_userId: userId, cart_state: "active" };
    const updateOrInsert = {
      $addToSet: {
        cart_products: product,
      },
    };
    const options = { upsert: true, new: true };

    return await cart.findOneAndUpdate(query, updateOrInsert, options);
  }

  static async updateUserCartQuantity({ userId, product }) {
    const { productId, quantity } = product;
    const query = {
      cart_userId: userId,
      "cart_products.productId": productId,
      cart_state: "active",
    };

    const updateSet = {
      $inc: {
        "cart_products.$.quantity": quantity,
      },
    };
    const options = { upsert: true, new: true };

    return await cart.findOneAndUpdate(query, updateSet, options);
  }

  static async addToCart({ userId, product = {} }) {
    //check cart ton tai hay ko
    const userCart = await cart.findOne({ cart_userId: userId });

    if (!userCart) {
      //create cart for User
      return await CartService.createUserCart({ userId, product });
    }

    //neu co gio hang roi nhung chua co san pham
    if (!userCart.cart_products.length) {
      userCart.cart_products = [product];
      return userCart.save();
    }
    //gio hang ton tai & da co sp nay -> update quantity

    return await CartService.updateUserCartQuantity({ userId, product });
  }

  //update cart
  /* 
    shop_order_ids: [
        {
            shopId,
            item_products: [{quantity, price, shopId, old_quantity, quantity}],
            version
        }
    ]
  */
  static async addToCartV2({ userId, shop_order_ids }) {
    const { productId, quantity, old_quantity } =
      shop_order_ids[0]?.item_products[0];

    const foundProduct = await getProductById(productId);

    if (!foundProduct) {
      throw new NotFoundError("Product does not exists");
    }
    if (foundProduct.product_shop.toString() !== shop_order_ids[0].shopId) {
      throw new NotFoundError("Product not belong to the shop");
    }
    if (quantity === 0) {
      //delete
    }

    return await CartService.updateUserCartQuantity({
      userId,
      product: {
        productId,
        quantity: quantity - old_quantity,
      },
    });
  }

  static async deleteUserCart({ userId, productId }) {
    const query = { cart_userId: userId, cartState: "active" };
    const updateSet = {
      $pull: {
        cart_products: {
          productId,
        },
      },
    };

    const deleteCart = await cart.updateOne(query, updateSet);

    return deleteCart;
  }

  static async getListUSerCart({ userId }) {
    return await cart
      .findOne({
        cart_userId: +userId,
      })
      .lean();
  }
}

module.exports = CartService;
