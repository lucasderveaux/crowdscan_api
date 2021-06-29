exports.zetOm = async function (req, res) {
  var model = require('../models/modelSingleObservation');
  try {

    let data = await model.zetOm(req);

    if (data) {
      res.writeHeader(200, {"Content-Type":"text/turtle"});
      res.write(data);
      res.end();
    }
    else {
      res.status(400).json({ error: "not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "error in the data" });
  }
};