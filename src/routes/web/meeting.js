const meetingController = require('../../controllers/meeting');

module.exports = (router) => {
  router.get('/meetings', meetingController.show);
  router.get('/meetings/:id', meetingController.describe);
};
