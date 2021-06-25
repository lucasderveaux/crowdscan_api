const sqlite3 = require('sqlite3').verbose();
const { OPEN_CREATE,OPEN_READWRITE } = require('sqlite3');

module.exports = function loop(){
  let db = new sqlite3.Database('./api/databank/observations.db',sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)=>{
    if(err){
      console.log(err.message);
    }else{
      console.log("db is open");
    }
  });

  db.close((err)=>{
    if(err){
      console.log(err.message);
    }
  });

  setInterval((req,res)=>{
    console.log("dag lucas");
  },60000);
};



//stap 1: sqllite databank
//stap 2: observaties toevoegen
//stap 3: basisbestand aanmaken
//stap 4: indien die aan gevraagd wordt de LDE teruggegeven met de juiste gegevens