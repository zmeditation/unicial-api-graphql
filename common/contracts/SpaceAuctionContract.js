const SpaceAuctionAddress = "0xbd76517976a80996977Ad9DFBE7c8b2105EC4878";

const SpaceAuctionAbi = [
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "_timeSteps",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "_priceSteps",
        type: "uint256[]",
      },
      {
        internalType: "uint256",
        name: "_startTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_spacesLimitPerBid",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_gasPriceLimit",
        type: "uint256",
      },
      {
        internalType: "contract ERC20",
        name: "_uccToken",
        type: "address",
      },
      {
        internalType: "contract SPACERegistry",
        name: "_spaceRegistry",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_caller",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_startTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_duration",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_initialPrice",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_endPrice",
        type: "uint256",
      },
    ],
    name: "AuctionCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "_bidId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_beneficiary",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_pricePerLandInMana",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_manaAmountToBurn",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "int256[]",
        name: "_xs",
        type: "int256[]",
      },
      {
        indexed: false,
        internalType: "int256[]",
        name: "_ys",
        type: "int256[]",
      },
    ],
    name: "BidSuccessful",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_caller",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_oldGasPriceLimit",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_gasPriceLimit",
        type: "uint256",
      },
    ],
    name: "GasPriceLimitChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_caller",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_oldSpacesLimitPerBid",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_spacesLimitPerBid",
        type: "uint256",
      },
    ],
    name: "SpacesLimitPerBidChanged",
    type: "event",
  },
  {
    inputs: [],
    name: "MAX_DECIMALS",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PERCENTAGE_OF_TOKEN_BALANCE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "conversionFee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "duration",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "endPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "endTime",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "gasPriceLimit",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "initialPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "spaceRegistry",
    outputs: [
      {
        internalType: "contract SPACERegistry",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "spacesLimitPerBid",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "startTime",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "status",
    outputs: [
      {
        internalType: "enum SPACEAuction.Status",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalBids",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSpacesBidded",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalUCCBurned",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "uccToken",
    outputs: [
      {
        internalType: "contract ERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "int256[]",
        name: "_xs",
        type: "int256[]",
      },
      {
        internalType: "int256[]",
        name: "_ys",
        type: "int256[]",
      },
      {
        internalType: "address",
        name: "_beneficiary",
        type: "address",
      },
    ],
    name: "bid",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_spacesLimitPerBid",
        type: "uint256",
      },
    ],
    name: "setSpacesLimitPerBid",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_gasPriceLimit",
        type: "uint256",
      },
    ],
    name: "setGasPriceLimit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

module.exports = { SpaceAuctionAddress, SpaceAuctionAbi };
