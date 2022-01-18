const { ethers } = require("ethers");

const {
  encodeTokenId,
  decodeTokenId,
  encodeTokenIdBySol,
  decodeTokenIdBySol,
} = require("../utility/util");

const {
  SpaceRegistryAddress,
  SpaceRegistryOptimizeAbi,
  SpaceProxyAddress,
  SpaceProxyAbi,
} = require("../../common/contracts/SpaceRegistryContract");
const { CHAIN_INFO } = require("../../common/const");
const provider = new ethers.providers.JsonRpcProvider(
  CHAIN_INFO.TESTNET.rpcUrls[0]
);

var spaceRegistryContract = new ethers.Contract(
  SpaceProxyAddress,
  SpaceRegistryOptimizeAbi,
  provider
);

const encodeA1BySol = async (spaceRegistryContract, x, y) => {
  result = await encodeTokenIdBySol(spaceRegistryContract, x, y);
  return result;
};

const decodeA1BySol = async (spaceRegistryContract, x, y) => {
  result = await decodeTokenIdBySol(spaceRegistryContract, x, y);
  return result;
};

const testSpaces = {
  a1: { x: 123, y: 456 },
  a2: { x: -123, y: 456 },
  a3: { x: -123, y: -456 },
  a4: { x: 123, y: -456 },
};

const main = async () => {
  data = [testSpaces.a1, testSpaces.a2, testSpaces.a3, testSpaces.a4];
  for (let i = 0; i < data.length; i++) {
    try {
      x_data = data[i].x;
      y_data = data[i].y;

      console.log(
        "\nTry Encode/Decode (" +
          x_data +
          ", " +
          y_data +
          ") in Area " +
          (i + 1)
      );
      console.log("============================\n");

      if (x_data > 0 && y_data > 0) {
        encodeA1 = encodeTokenId(x_data, y_data);
        console.log(
          "Encode (" + x_data + ", " + y_data + "): ",
          encodeA1.toString()
        );

        decodeA1 = decodeTokenId(encodeA1);
        console.log(
          "Decode " +
            encodeA1.toString() +
            " for (" +
            x_data +
            ", " +
            y_data +
            "): " +
            " (" +
            decodeA1.x.toString() +
            ", " +
            decodeA1.y.toString() +
            ")"
        );
      } else {
        console.log(
          "Encode (" +
            x_data +
            ", " +
            y_data +
            ") is ignore for javascript as they are negative values"
        );
      }

      encodeA1Sol = await encodeA1BySol(spaceRegistryContract, x_data, y_data);
      decodeA1Sol = await decodeA1BySol(spaceRegistryContract, encodeA1Sol);

      console.log(
        "Encode (" +
          x_data +
          ", " +
          y_data +
          "): by SPACERegistry.sol " +
          encodeA1Sol
      );

      console.log(
        "Decode " +
          encodeA1Sol.toString() +
          " for (" +
          x_data +
          ", " +
          y_data +
          "): " +
          " (" +
          decodeA1Sol[0].toString() +
          ", " +
          decodeA1Sol[1].toString() +
          ")"
      );
    } catch (err) {
      console.warn("Encoding failed");
      console.log(err.message);
    }
    console.log("============================\n");
  }
};

main();
