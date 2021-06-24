module.exports = function (app) {
  var controller = require('../controllers/controller');
  console.log("de routes werken");
  app.route('/')
    .get(controller.do_the_thing);
  app.route('/:aanvraag')
    .get(controller.do_the_thing);
  app.route('/:aanvraag/:id')
    .get(controller.do_the_thing);
};