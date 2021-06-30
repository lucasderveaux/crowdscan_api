module.exports = function (app) {
  var controller = require('../controllers/controller');
  console.log("de routes werken");
  app.route('/')
    .get(controller.zetOm);
  app.route('/:aanvraag')
    .get(controller.zetOm);
  app.route('/LDES/:aanvraag')
    .get(controller.zetNaarLDES);
};