const sqlite3 = require('sqlite3').verbose();
const { OPEN_CREATE, OPEN_READWRITE } = require('sqlite3');

let i = 0;
let id;
let db;

function VoerUit(req, res) {
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
    console.log("Dag Lucas");

    db.run(`INSERT INTO Gent_langemunt VALUES (?,?,?,?,?)`,["test"+i,Date.now(),55.22,3,"sensor"+i],(err)=>{
      if(err){
        console.log(err);
      }
    });

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
  id = setInterval(VoerUit, 6000);
};



//stap 1: sqllite databank
//stap 2: observaties toevoegen
//stap 3: basisbestand aanmaken
//stap 4: indien die aan gevraagd wordt de LDE teruggegeven met de juiste gegevens