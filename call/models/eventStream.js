const { Sequelize, DataTypes } = require('sequelize');
const unirest = require('unirest');

let Observation;

let straten = ["gent_langemunt", "veldstraat"];

async function getConnectie() {
  let sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: '../databank/observations.db'
  });

  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }


  Observation = sequelize.define('observation', {
    naam: {
      type: DataTypes.STRING,
      allowNull: false
    },
    resultTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    hasSimpleResult: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    timeDelta: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    madeBySensor: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    timestamps: false
  });


  await Observation.sync();
  console.log("synced");
}

async function vraagDataOp() {
  let val;
  let payload;
  let tijd;
  let timedelta;
  let environment;

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
        await Observation.create({
          naam: environment,
          resultTime: tijd,
          hasSimpleResult: payload[i],
          timeDelta: timedelta,
          madeBySensor: environment + i + '_sensor'
        });
      }
    } else {
      if (payload.length == 1) {
        await Observation.create({
          naam: environment,
          resultTime: tijd,
          hasSimpleResult: payload[0],
          timeDelta: timedelta,
          madeBySensor: environment + '0_sensor'
        });
      }
    }
  }
}

module.exports = function loop() {
  getConnectie()
  //de setInterval functie is asynchroon
  setInterval(vraagDataOp, 60000);
}
