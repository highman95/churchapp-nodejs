/* istanbul ignore file */
const server = require("../src/app");

module.exports = {
  startServer() {
    const { address, port } = server.address();

    const host = `${
      !address?.trim() || address === "::" ? "http://localhost" : address
    }:${port}`;
    const options = { headers: { "Content-Type": "application/json" } };

    return { host, options };
  },

  stopServer(cb) {
    server.close();
    cb();
  },

  responseHandler(cb) {
    let responseBox = {};

    return (response) => {
      let data = "";

      response.on("data", (_data) => (data += _data));
      response.on("end", (_data) => {
        responseBox = {
          ...responseBox,
          body: JSON.parse(data),
          response: { statusCode: response.statusCode },
        };
        cb(responseBox);
      });
    };
  },
};
