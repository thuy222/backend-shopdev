const redisPubSubService = require("../services/redisPubsub.service");

class InventoryServiceTest {
  constructor() {
    redisPubSubService.subscriber("purchase_event", (channel, message) => {
      console.log("message", message);
      InventoryServiceTest.updateInventory(message);
    });
  }

  static updateInventory(productId, quantity) {
    console.log("updateInventory", quantity, productId);
  }
}

module.exports = new InventoryServiceTest();
