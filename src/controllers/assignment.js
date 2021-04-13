const assignmentService = require("../services/assignment");

module.exports = {
  create: (req, res, next) => {
    try {
      assignmentService.create(req.body, (err, assignment, code = 400) => {
        res.status(code).json({
          status: !!err,
          data: assignment,
          message: err ? err.message : "Assigment successfully saved",
        });
      });
    } catch (e) {
      next(e);
    }
  },
};
