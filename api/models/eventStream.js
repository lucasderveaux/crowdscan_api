const sqlite3 = require('sqlite3').verbose();
const { OPEN_CREATE, OPEN_READWRITE } = require('sqlite3');
const unirest = require('unirest');

let i = 0;
let id;
let db;
let val;

async function vraagDataOp() {
  val = await unirest.get('https://production.crowdscan.be/dataapi/gent/gent_langemunt/data/1');


  //timedelta kennen we en environment eigenlijk ook
  let payload = val["body"]["payload"]["regions"];
  let tijd = val["body"]["header"]["time"];
  let timedelta = val["body"]["header"]["timedelta"];
  let environment = val["body"]["header"]["environment"];

  console.log(payload);

  for (let i = 1; i < payload.length; i++) {
    db.run(`INSERT INTO crowdscan_databank VALUES(?,?,?,?,?)`,
      [environment, tijd, payload[i], timedelta, environment + i + "_sensor"], (err) => {
        if (err) {
          console.log(err.message);
        }
      });
  }
}

function VoerUit() {
  if (i == 10) {
    db.close((err) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log("db is gesloten");
      }
    });
    clearInterval(id);
  } else {
    vraagDataOp();

    i++;
  }
}

module.exports = function loop() {
  db = new sqlite3.Database('./api/databank/observations.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log("db is open");
    }
  });
  id = setInterval(VoerUit, 60000);
};



//stap 1: sqllite databank
//stap 2: observaties toevoegen
//stap 3: basisbestand aanmaken
//stap 4: indien die aan gevraagd wordt de LDE teruggegeven met de juiste gegevens