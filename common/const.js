const CHAIN_INFO = {
  MAINNET: {
    chainId: "0x5A",
    chainName: "Zilionixx Mainnet",
    nativeCurrency: {
      name: "ZNX Coin",
      symbol: "ZNX",
      decimals: 18,
    },
    rpcUrls: ["https://rpc1.znxscan.com"],
    blockExplorerUrls: ["https://znxscan.com"],
  },
  TESTNET: {
    chainId: "0x5D",
    chainName: "Zilionixx Testnet",
    nativeCurrency: {
      name: "ZNX Coin",
      symbol: "ZNX",
      decimals: 18,
    },
    rpcUrls: ["https://testrpc1.znxscan.com"],
    blockExplorerUrls: ["https://testnet.znxscan.com"],
  },
};

const ORDER_STATUS = {
  active: "active",
  success: "success",
  cancel: "cancel",
};

const ROAD_DISTRICT_ID = "52edce54-568b-48be-b0e8-778c5a57ece9"; // Mock data, Need to change in production
const ROAD_ESTATE_ID = "1186"; //Mock data, Need to be changed and array in the future as multiple estate_id will be matched for road

module.exports = { CHAIN_INFO, ORDER_STATUS, ROAD_DISTRICT_ID, ROAD_ESTATE_ID };
