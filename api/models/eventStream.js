const sqlite3 = require('sqlite3').verbose();
const { OPEN_CREATE, OPEN_READWRITE } = require('sqlite3');
const unirest = require('unirest');

let straten = ["gent_langemunt", "veldstraat"];

async function vraagDataOp() {
  let val;
  let payload;
  let tijd;
  let timedelta;
  let environment;

  db = new sqlite3.Database('./api/databank/observations.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log("db is open");
    }
  });

  for (let straat of straten) {
    val = await unirest.get('https://production.crowdscan.be/dataapi/gent/' + straat + '/data/1');

    //timedelta kennen we en environment eigenlijk ook
    payload = val["body"]["payload"]["regions"];
    tijd = val["body"]["header"]["time"];
    timedelta = val["body"]["header"]["timedelta"];
    environment = val["body"]["header"]["environment"];

    console.log(payload);



    if (payload.length >= 2) {
      for (let i = 1; i < payload.length; i++) {
        await db.run(`INSERT INTO crowdscan_databank VALUES(?,?,?,?,?)`,
          [environment, tijd, payload[i], timedelta, environment + i + "_sensor"], (err) => {
            if (err) {
              console.log(err.message);
            }
          });
      }
    } else {
      if (payload.length == 1) {
        await db.run(`INSERT INTO crowdscan_databank VALUES(?,?,?,?,?)`,
          [environment, tijd, payload[0], timedelta, environment + "_sensor"], (err) => {
            if (err) {
              console.log(err.message);
            }
          });
      }
    }

  }
  db.close((err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log("db is gesloten");
    }
  });
}

module.exports = function loop() {
  //de setInterval functie is asynchroon
  id = setInterval(vraagDataOp, 60000);
};



//stap 1: sqllite databank
//stap 2: observaties toevoegen
//stap 3: basisbestand aanmaken
//stap 4: indien die aan gevraagd wordt de LDE teruggegeven met de juiste gegevens