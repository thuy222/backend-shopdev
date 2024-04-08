const redisPubSubService = require("../services/redisPubsub.service");

class ProductServiceTest {
  purchaseProduct(productId, quantity) {
    const order = { productId, quantity };
    redisPubSubService.publish("purchase_event", JSON.stringify(order));
  }
}

module.exports = new ProductServiceTest();
