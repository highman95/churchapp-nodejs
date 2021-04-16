const assignmentService = require("../services/assignment");

module.exports = {
  create: (req, res, next) => {
    try {
      assignmentService.create(
        { user_id: req.params.id, ...req.body },
        (err, assignment, code = 400) => {
          res.status(code).json({
            status: !!err,
            data: assignment,
            message: err ? err.message : "Assigment successfully saved",
          });
        }
      );
    } catch (e) {
      next(e);
    }
  },

  get: (req, res, next) => {
    try {
      assignmentService.get(req.params.id, (err, assignments, code = 400) => {
        res.status(code).json({
          status: !!err,
          data: assignments,
          message: err ? err.message : "Assigments successfully fetched",
        });
      });
    } catch (e) {
      next(e);
    }
  },
};
