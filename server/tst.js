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
    admin: {
      id: "5fb83eb3c4b947bf32ec32b6",
    },
  };

  const token = await jwt.sign(payload, "abcd");

  console.log(token);
};

ttt();
