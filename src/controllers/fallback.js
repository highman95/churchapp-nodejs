module.exports = {
  home: (req, res) => {
    res.render("index", { title: "Home", user0: req.user });
  },

  all: (req, res) => {
    const message = `${req.isWR ? "Page" : "Resource"} not found`;
    const error = { code: 404, message };

    if (req.isWR) {
      return res.render("error", { title: "Error", user0: req.user, error });
    }

    res.status(error.code).json({ status: false, message });
  },

  ping: (_req, res) => {
    res.json({ status: true, message: "It's all good..." });
  },
};
