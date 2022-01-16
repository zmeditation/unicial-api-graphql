const { BigNumber } = require("ethers");
const clearLow = BigNumber.from(
  "0xffffffffffffffffffffffffffffffff00000000000000000000000000000000"
);
const clearHigh = BigNumber.from(
  "0x00000000000000000000000000000000ffffffffffffffffffffffffffffffff"
);
const factor = BigNumber.from("0x100000000000000000000000000000000");

const encodeTokenId = (x, y) => {
  let x_bn = BigNumber.from(x);
  let y_bn = BigNumber.from(y);

  x_part = x_bn.mul(factor).and(clearLow);
  y_part = y_bn.and(clearHigh);
  //   console.log("x_part", x_part);
  //   console.log("y_part", y_part);
  return x_part.or(y_part);
  // return (x) * factor) & clearLow) | (uint(y) & clearHigh
};

module.exports = { encodeTokenId };
