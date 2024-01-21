"use strict";

const { promisify } = require("util");
const redis = require("redis");
const {
  reservationInventory,
} = require("../models/repositories/inventory.repo");

const redisClient = redis.createClient();

const pexpire = promisify(redisClient.pExpire).bind(redisClient);
const setnxAsync = promisify(redisClient.setNX).bind(redisClient);

const acquireLock = async (productId, quantity, cartId) => {
  const key = `lock_v2023_${productId}`; //ai vào đặt hàng trc sẽ đưa cho 1 cái key, đặt hàng xong trừ tồn kho xong sẽ đưa key cho ng khác vào
  const retryTimes = 10; //đang có ng thanh toán, ng khác vào fail sẽ thử lại 10 lần
  const expireTime = 3000; //3s time để dọn rác. dữ liệu ko sử dụng thì phải clear nó đi

  for (let i = 0; i < retryTimes.length; i++) {
    //tao 1 key
    const result = await setnxAsync(key, expireTime); // neu key chua co ai giu thi result = 1 , otherwise 0
    console.log("result", result);
    if (result === 1) {
      //thao tac voi inventory
      const isReservation = await reservationInventory({
        productId,
        quantity,
        cartId,
      });

      if (isReservation.modifiedCount) {
        //update thanh cong thi mongodb tra ve modifiedCount=1, ko update thi tra ve 0
        await pexpire(key, expireTime);
        return key;
      }

      return null;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
};

const releaseLock = async (keyLock) => {
  const delAsyncKey = promisify(redisClient.del).bind(redisClient);

  return await delAsyncKey(keyLock);
};

module.exports = { acquireLock, releaseLock };
