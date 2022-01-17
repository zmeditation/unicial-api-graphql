const { encodeTokenId, decodeTokenId } = require("../utility/util");

const testSpaces = {
  a1: { x: 2, y: 2 },
  a2: { x: -2, y: 2 },
  a3: { x: -2, y: -2 },
  a4: { x: 2, y: -2 },
};

encodeA1 = encodeTokenId(testSpaces.a1.x, testSpaces.a2.y);
console.log(
  "Encode (" + testSpaces.a1.x + ", " + testSpaces.a2.y + "): ",
  encodeA1.toString()
);

decodeA1 = decodeTokenId(encodeA1);
console.log(
  "Decode " +
    encodeA1.toString() +
    " for (" +
    testSpaces.a1.x +
    ", " +
    testSpaces.a2.y +
    "): " +
    " (" +
    decodeA1.x.toString() +
    ", " +
    decodeA1.y.toString() +
    ")"
);
