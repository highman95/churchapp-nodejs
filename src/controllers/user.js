const userService = require("../services/user");

const defaultPage = 1;
const defaultSize = process.env.PAGINATION_CHUNK_SIZE;

exports.get = (req, res, next) => {
  const {
    query: { page = defaultPage, size = defaultSize },
  } = req;

  try {
    userService.get(page, size, (err, users, code = 400) => {
      const { data = [], count = 0 } = users ?? {};

      res.status(code).json({
        status: !err,
        data,
        count,
        currentPage: page,
        message: err ? err.message : "Users successfully fetched",
      });
    });
  } catch (e) {
    next(e);
  }
};

exports.view = (req, res) => {
  const {
    query: { page = defaultPage, size = defaultSize },
  } = req;

  userService.get(page, size, (err, users) => {
    const { data = [], count = 0 } = users ?? {};

    res.render("users", {
      title: "Users",
      user0: req.user,
      currentPage: page,
      users: err ? [] : data,
      count,
    });
  });
};

exports.create = (req, res, next) => {
  const { body: newUser, isWR } = req;

  try {
    userService.create(newUser, (err, user, code = 400) => {
      const message = err ? err.message : "User successfully created";
      const messageType = `${isWR && err ? "err" : "msg"}`;

      return isWR
        ? res.redirect(`/users?${messageType}=${message}`)
        : res.status(code).json({
            status: !err,
            data: user,
            message,
          });
    });
  } catch (e) {
    next(e);
  }
};

exports.verify = (req, res, next) => {
  try {
    const { username } = req.body;

    userService.verify(username, (err, data, code = 400) => {
      res.status(code).json({
        status: !err,
        data,
        message: err ? err.message : "User successfully verified",
      });
    });
  } catch (e) {
    next(e);
  }
};

exports.toggle = (req, res, next) => {
  try {
    const {
      body: { username },
      isWR,
    } = req;

    userService.toggle(username, (err, data, code = 400) => {
      const prefix = data.active ? "" : "de-";
      const message = err
        ? err.message
        : `User successfully ${prefix}activated`;
      const messageType = isWR && err ? "err" : "msg";

      return isWR
        ? res.redirect(`/users?${messageType}=${message}`)
        : res.status(code).json({
            status: !err,
            data,
            message,
          });
    });
  } catch (e) {
    next(e);
  }
};
