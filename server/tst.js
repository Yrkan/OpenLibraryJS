/*const bcryptjs = require("bcryptjs");

const crypt = async () => {
  const hash = await bcryptjs.genSalt(10);
  const npass = await bcryptjs.hash("testt", hash);
  console.log(npass);
};

crypt();
*/
const ttt = async () => {
  const jwt = require("jsonwebtoken");

  const payload = {
    a: "ff",
  };

  const token = await jwt.sign(payload, "abcd");

  console.log(token);
};

ttt();
