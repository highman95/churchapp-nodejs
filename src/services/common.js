exports.findResultHandler = function (modelName, cb, extraTask = undefined) {
  return (err, result) => {
    if (err) {
      return cb(err, null, 500);
    }

    let callBackResult;
    if (result[0]) {
      callBackResult =
        typeof extraTask === "function"
          ? extraTask(result[0])
          : cb(null, result[0], 200);
    } else {
      callBackResult = cb(new Error(`${modelName} not found`), null, 404);
    }

    return callBackResult;
  };
};
