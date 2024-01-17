"use strict";

const { findCartById } = require("../models/repositories/cart.repo");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const { checkProductByServer } = require("../models/repositories/product.repo");
const { getDiscountAmount } = require("./discount.service");

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
}

module.exports = CheckoutService;
