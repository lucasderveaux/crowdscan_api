const sqlite3 = require('sqlite3').verbose();
const { OPEN_CREATE,OPEN_READWRITE } = require('sqlite3');


let db = new sqlite3.Database('../databank/test2.db',sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)=>{
  console.log(err.message);
});

db.close((err)=>{
  console.log(err.message);
});

module.exports = function loop(){


  setInterval((req,res)=>{
    console.log("dag lucas");
  },60000);
};



//stap 1: sqllite databank
//stap 2: observaties toevogen
//stap 3: basisbestand aanmaken
//stap 4: indien die aan gevraagd wordt de LDE teruggeven met ede juiste gegevens