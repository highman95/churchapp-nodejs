module.exports = {
  get: () => {},
  create: (audit) => {},
  find: (id) => {},
  ping: () => {
    db.ping(function (err) {
      if (err) throw err;
      console.log("Server responded to ping");
    });
  },
};
