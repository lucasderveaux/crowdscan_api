const N3 = require('n3');
const { namedNode, literal } = N3.DataFactory;
const { Sequelize, DataTypes } = require('sequelize');

let writer;

async function zetNaarLDES(req) {
  let tekst;

  let url = req.url.split('/');
  let environment = url[2];

  // Om te starten ga ik er van uit gaan dat ik al weet Welke 
  // observaties, platformen en dergelijke er al zijn en dan ga 
  // ik de observations uit de databank hiervoor toevoegen

  try {
    writer = new N3.Writer(
      {
        prefixes:
        {
          rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
          sosa: 'http://www.w3.org/ns/sosa/',
          rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
          xsd: 'http://www.w3.org/2001/XMLSchema#',
          time: 'http://www.w3.org/2006/time#',
          crowdscan: 'https://production.crowdscan.be/dataapi/gent/environments/'
        }
      });
    //hoe ga ik dit aanpakken eigenlijk....
    //er is één featureOfInterest
    //ik denk dat ik misschien toch het even voor de langemunt ga bekijken

    //Feature of interest aanmaken
    writer.addQuad(
      namedNode('https://production.crowdscan.be/dataapi/gent/environments/' + environment),
      namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      namedNode('sosa:FeatureOfInterest')
    );
    //observable property opstellen
    writer.addQuad(
      namedNode('hoeveelheid_mensen'),
      namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      namedNode('http://www.w3.org/ns/sosa/ObservableProperty')
    );
    writer.addQuad(
      namedNode('hoeveelheid_mensen'),
      namedNode('rdfs:label'),
      literal("hoeveelheid mensen")
    );
    //platform
    writer.addQuad(
      namedNode(environment + '_platform'),
      namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      namedNode('http://www.w3.org/ns/sosa/Platform')
    );

    let test = await getConnectie(environment);
    console.log(test);
    writer.end((error, result) => {
      tekst += result;
      //console.log(result);
    });
  } catch (e) {
    console.log("de error is: " + e);
  }
  return tekst;
}

async function getConnectie( environment) {
  

  //console.log("getConnectie wordt opgeroepen");
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
  

  async function getSensors(omgeving) {
    
    Sensor = sequelize.define('sensor', {
      environment: {
        type: DataTypes.STRING,
        allowNull: false
      },
      sensors: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      timestamps: false
    });
    
    let sensors = Sensor.findOne({
      where: {
        environment: omgeving
      },raw:true,
      nest: true
    });
    
    console.log(sensors.sensors);
    makeSensors(6, omgeving);
  }

  async function getObservations() {
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

    let observations = await Observation.findAll();
    console.log(observations);
  }

  getSensors(environment);
  console.log("het aantal sensors zijn");
  //getObservations();
}

function makeSensors(aantal, environment) {
  console.log("dit wordt opgeroepen"+aantal);
  if (aantal == 1) {
    console.log('dit kan niet');
  } else {
    console.log('dit wel');
    writer.addQuad(
      namedNode(environment+'_platform'),
      namedNode('http://www.w3.org/ns/sosa/hosts'),
      namedNode('litterally whatever')
    );
  }
  console.log("it's over");
  return 'oké';
}

module.exports = {
  zetNaarLDES
};