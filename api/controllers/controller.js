exports.do_the_thing = async function (req, res) {
  var model = require('../models/model');

  try{
    console.log(req["aanvraag"]);
  }catch(e){

  }

  try {

    let thing = await model.do_the_thing(req);

    if (thing) {
      res.writeHeader(200, {"Content-Type":"text/turtle"});
      res.write(thing);
      res.end();
    }
    else {
      res.status(400).json({ error: "not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "error in the thing" });
  }
};