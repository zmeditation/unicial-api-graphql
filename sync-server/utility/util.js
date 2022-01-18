const { BigNumber } = require("ethers");
const clearLow = BigNumber.from(
  "0xffffffffffffffffffffffffffffffff00000000000000000000000000000000"
);
const clearHigh = BigNumber.from(
  "0x00000000000000000000000000000000ffffffffffffffffffffffffffffffff"
);
const factor = BigNumber.from("0x100000000000000000000000000000000");

const baseX = 1000000;
const baseY = 1000000;
const clearBaseX = BigNumber.from(baseX);
const clearBaseY = BigNumber.from(baseY);

const encodeTokenId = (x, y) => {
  let x_bn = BigNumber.from(x + baseX);
  let y_bn = BigNumber.from(y + baseY);

  x_part = x_bn.mul(factor).and(clearLow);
  y_part = y_bn.and(clearHigh);
  //   console.log("x_part", x_part);
  //   console.log("y_part", y_part);
  return x_part.or(y_part);
};

const decodeTokenId = (tokenId) => {
  let value = BigNumber.from(tokenId);
  let x = value.and(clearLow).shr(128).sub(clearBaseX);
  let y = value.and(clearHigh).sub(clearBaseY);
  return { x, y };
};

const encodeTokenIdBySol = async (spaceRegistryContract, x, y) => {
  let assetId = await spaceRegistryContract.encodeTokenId(x, y);
  return assetId;
};

const decodeTokenIdBySol = async (spaceRegistryContract, tokenId) => {
  let result = await spaceRegistryContract.decodeTokenId(tokenId);
  return result;
};

module.exports = {
  encodeTokenId,
  decodeTokenId,
  encodeTokenIdBySol,
  decodeTokenIdBySol,
};
