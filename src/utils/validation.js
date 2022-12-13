const ensureCallBackIsDefined = (cb) => {
  if (typeof cb !== "function") {
    throw new Error("Callback is not defined");
  }
};

const isEmail = (email) => {
  return (
    email &&
    /^([a-zA-Z0-9_\-]+)(\.)?([a-zA-Z0-9_\-]+)@([a-zA-Z]+)\.([a-zA-Z]{2,})$/.test(
      email
    )
  );
};

const isStrongPassword = (password) => {
  // At least 1 capital, 1 small, 1 special character & 1 number.
  return (
    password &&
    /(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z]).{8,}$/.test(password)
  );
};

module.exports = {
  ensureCallBackIsDefined,
  isEmail,
  isStrongPassword,
};
