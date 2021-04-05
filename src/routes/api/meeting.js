const meetingController = require('../../controllers/meeting');

module.exports = (router) => {
  router.get('/meetings', meetingController.get);
  router.post('/meetings/:id', meetingController.create);
};
