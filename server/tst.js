const bcryptjs = require("bcryptjs");

const crypt = async () => {
  const hash = await bcryptjs.genSalt(10);
  const npass = await bcryptjs.hash("testt", hash);
  console.log(npass);
};

crypt();
