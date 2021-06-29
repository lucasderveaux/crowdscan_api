module.exports = function (app) {
  var controller = require('../controllers/controller');
  console.log("de routes werken");
  app.route('/')
    .get(controller.zetOm);
  app.route('/:aanvraag')
    .get(controller.zetOm);
  app.route('/:aanvraag/:id')
    .get(controller.zetOm);
  app.rout('/LDES/:aanvraag/:id')
    .get(controller.zetNaarLDES);
};