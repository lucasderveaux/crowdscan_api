let cors = require('cors');
let express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  bodyParser = require('body-parser');

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let routes = require('./api/routes/routes');
routes(app);

app.listen(port);

app.use(function (req, res) {
  res.status(404).send({ url: req.originalUrl + ' not found ' });
});

console.log('crowdscan linked data stream RESTful API server started on: ' + port);

/*
 let loop = require('./api/models/eventStream2');
 loop();
 */
