"use strict";

const { findCartById } = require("../models/repositories/cart.repo");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const { checkProductByServer } = require("../models/repositories/product.repo");
const { getDiscountAmount } = require("./discount.service");
const { acquireLock, releaseLock } = require("./redis.service");
const { order } = require("../models/order.model");

class CheckoutService {
  /* 
    {
        cartId,
        userId,
        shop_order_ids: [
            {
            shopId, 
            shop_discount: [],
            item_products: [{
                price,
                quantity,
                productId
            }]
        },
    
            {
            shopId, 
            shop_discounts: [{
                shopId,
                discountId,
                codeId
            }],
            item_products: [{
                price,
                quantity,
                productId
            }]
        } 
    ]
    }    
*/

  static async checkoutReview({ cartId, userId, shop_oder_ids = [] }) {
    //check cartId ton tai ko
    const foundCart = await findCartById(cartId);
    if (!foundCart) {
      throw new BadRequestError("Cart does not exist");
    }

    const checkout_order = {
      totalPrice: 0, //tong tien hang
      feeShip: 0, // phi ship
      totalDiscount: 0, //tong tien giam gia
      totalCheckout: 0, // tong thanh toan
    };
    const shop_order_ids_new = [];

    //tinh tong tien  bill

    for (let i = 0; i < shop_oder_ids.length; i++) {
      const {
        shopId,
        shop_discounts = [],
        item_products = [],
      } = shop_oder_ids[i];

      //check product available
      const checkProductServer = await checkProductByServer(item_products);
      console.log("checkProductServer", checkProductServer);
      if (!checkProductServer[0]) {
        throw new BadRequestError("order wrong");
      }

      //tong tien don hang
      const checkoutPrice = checkProductServer.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      //tong tien trc khi xu ly
      checkout_order.totalPrice += checkoutPrice;

      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice,
        priceApplyDiscount: checkoutPrice,
        item_products: checkProductServer,
      };
      //neu shop_discounts > 0, check xem co hop le hay khong
      if (shop_discounts.length > 0) {
        //gia su chi co 1 dicount
        //get amount discount

        const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
          codeId: shop_discounts[0].codeId,
          userId,
          shopId,
          product: checkProductServer,
        });

        //tong cong discount giam gia
        checkout_order.totalCheckout += discount;

        //neu tien giam gia lon hon 0
        if (discount > 0) {
          itemCheckout.priceApplyDiscount = checkoutPrice - discount;
        }
      }

      //tong thanh toan cuoi cung
      checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
      shop_order_ids_new.push(itemCheckout);
    }

    return {
      shop_oder_ids,
      shop_order_ids_new,
      checkout_order,
    };
  }

  //order

  static async orderByUser({
    shop_oder_ids,
    cartId,
    userId,
    user_address = {},
    user_payment,
  }) {
    const { shop_order_ids_new, checkout_order } =
      await CheckoutService.checkoutReview({
        cartId,
        userId,
        shop_oder_ids,
      });

    //check xem có vượt tồn kho hay ko

    //get new array product

    const products = shop_order_ids_new.flatMap((order) => order.item_products);
    console.log("products", products);
    const acquireProduct = [];
    for (let i = 0; i < products.length; index++) {
      const { productId, quantity } = products[i];
      const keyLock = await acquireLock(productId, quantity, cartId);
      acquireProduct.push(keyLock ? true : false);
      if (keyLock) {
        await releaseLock(keyLock);
      }
    }

    //check neu co 1 sp trong kho bi het hang
    if (acquireProduct.includes(false)) {
      throw new BadRequestError(
        "Some products has been updated, please go back to shopping cart"
      );
    }
    const newOrder = order.create({
      order_userId: userId,
      order_checkout: checkout_order,
      order_shipping: user_address,
      order_payment: user_payment,
      order_products: shop_order_ids_new,
    });

    //neu thanh cong, remove product co trong gio hang
    if (newOrder) {
      //remove product in shopping cart
    }

    return newOrder;
  }

  /*
  1. Query order [user]
  */
  static async getOrdersByUser() {}
  /*
  2. Query order using Id [user]
  */
  static async getOneOrderByUser() {}
  /*
  3. Cancel order [user]
  */
  static async cancelOrderByUser() {}
  /*
  4.Update order status [Shop | Admin]
  */
  static async updateOrderStatusByShop() {}
}

module.exports = CheckoutService;
