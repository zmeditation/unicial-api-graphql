const DEPLOY = {
  SPACE_PROXY_DEPLOY_BLOCK: 1,
};
const orderEventName = ["OrderCreated", "OrderSuccessful", "OrderCancelled"];
const bidEventName = ["BidCreated", "BidAccepted", "BidCancelled"];
const emptyAddress = "0x0000000000000000000000000000000000000000";
module.exports = { DEPLOY, orderEventName, bidEventName, emptyAddress };
