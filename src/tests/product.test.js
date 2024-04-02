const redisPubSubService = require("../services/redisPubsub.service");

class ProductServiceTest {
  constructor(productId, quantity) {
    const order = { productId, quantity };
  }
  redisPubSubService.publish("purchase_events", JSON.stringify(order));

}
