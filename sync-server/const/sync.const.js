const DEPLOY = {
  SPACE_PROXY_DEPLOY_BLOCK: 1,
};
const orderEventName = ["OrderCreated", "OrderSuccessful", "OrderCancelled"];
const bidEventName = ["BidCreated", "BidAccepted", "BidCancelled"];

module.exports = { DEPLOY, orderEventName, bidEventName };
