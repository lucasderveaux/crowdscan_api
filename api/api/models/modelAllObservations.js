const N3 = require('n3');
const { namedNode, literal } = N3.DataFactory;
const { Sequelize, DataTypes } = require('sequelize');

let writer;

async function zetNaarLDES(req) {
  let tekst='';

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
          crowdscan: 'https://production.crowdscan.be/dataapi/gent/environments/',
          tree: 'https://w3id.org/tree#',
          ldes: 'https://w3id.org/ldes#' 
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

async function getConnectie(environment) {


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

  let sensors = await Sensor.findOne({
    where: {
      environment: environment
    },
    raw: true,
    nest: true
  });


  let aantal = sensors.sensors;
  if (aantal == 1) {
    writer.addQuad(
      namedNode(environment + '_platform'),
      namedNode('http://www.w3.org/ns/sosa/hosts'),
      namedNode(environment + '0_sensor')
    );

    writer.addQuad(
      namedNode(environment + '0_sensor'),//hier ga ik gewoon een cijfer achter zetten
      namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      namedNode('http://www.w3.org/ns/sosa/sensor')
    );

    writer.addQuad(
      namedNode(environment + '0_sensor'),
      namedNode('http://www.w3.org/ns/sosa/isHostedBy'),
      namedNode(environment + '_platform')
    );
  } else {
    for (let i = 1; i <= aantal; i++) {
      writer.addQuad(
        namedNode('https://production.crowdscan.be/dataapi/gent/environments/' + environment),
        namedNode('http://www.w3.org/ns/sosa/hasSample'),
        namedNode(environment + i + '_sample')
      );
    }

    //samples aanmaken
    for (let i = 1; i <= aantal; i++) {
      writer.addQuad(
        namedNode(environment + i + '_sample'),
        namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        namedNode('http://www.w3.org/ns/sosa/Sample')
      );

      writer.addQuad(
        namedNode(environment + i + '_sample'),
        namedNode('http://www.w3.org/ns/sosa/isSampleOf'),
        namedNode('https://production.crowdscan.be/dataapi/gent/environments/' + environment)
      );

      writer.addQuad(
        namedNode(environment + i + '_sample'),
        namedNode('http://www.w3.org/2000/01/rdf-schema#comment'),
        literal(environment + ' is opgedeeld in ' + aantal + ' delen en dit is het sample van deel ' + i)
      );
    }
    for (let i = 1; i <= aantal; i++) {

      writer.addQuad(
        namedNode(environment + '_platfom'),
        namedNode('http://www.w3.org/ns/sosa/hosts'),
        namedNode(environment + i + '_sensor')
      );
    }
    //sensoren aanmaken
    for (let i = 1; i <= aantal; i++) {
      writer.addQuad(
        namedNode(environment + i + '_sensor'),//hier ga ik gewoon een cijfer achter zetten
        namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        namedNode('http://www.w3.org/ns/sosa/sensor')
      );

      writer.addQuad(
        namedNode(environment + i + '_sensor'),
        namedNode('http://www.w3.org/ns/sosa/isHostedBy'),
        namedNode(environment + '_platform')
      );
    }
  }

  writer.addQuad(
    namedNode('https://production.crowdscan.be/dataapi/gent/environments/eventStream'),
    namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
    namedNode('https://w3id.org/ldes#EventStream')
  );

  

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

  let observations = await Observation.findAll({
    where: {
      naam: environment
    },
    raw: true,
    nest: true
  });
  for (let observation of observations) {
   // console.log(observation);
    writer.addQuad(
      namedNode('https://production.crowdscan.be/dataapi/gent/environments/evenstream'),
      namedNode('https://w3id.org/tree#member'),
      namedNode('observation'+observation.id)
    );
    writer.addQuad(
      namedNode('Observation' + observation.id),
      namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      namedNode('http://www.w3.org/ns/sosa/Observation')
    );

    writer.addQuad(
      namedNode('Observation' + observation.id),
      namedNode('http://www.w3.org/ns/sosa/hasFeatureOfInterest'),
      namedNode('https://production.crowdscan.be/dataapi/gent/environments/' + environment)
    );

    writer.addQuad(
      namedNode('Observation' + observation.id),
      namedNode('http://www.w3.org/ns/sosa/observedProperty'),
      namedNode('hoeveelheid_mensen')
    );

    writer.addQuad(
      namedNode('Observation' + observation.id),
      namedNode('http://www.w3.org/ns/sosa/resultTime'),
      literal(new Date(observation.resultTime))  //hoe ^^xsd:dateTime? -> niet automatisch?
    );

    writer.addQuad(
      namedNode('Observation' + observation.id),
      namedNode('http://www.w3.org/ns/sosa/hasSimpleResult'),
      literal(observation.hasSimpleResult)  //hoe ^^xsd:double -> automatisch
    );

    writer.addQuad(
      namedNode('Observation' + observation.id),
      namedNode('http://www.w3.org/ns/sosa/phenomenonTime'),
      writer.blank([
        {
          predicate: namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
          object: namedNode('http://www.w3.org/2006/time#Interval')
        }, {
          predicate: namedNode('http://www.w3.org/2006/time#hasBeginning'),
          object: writer.blank([{
            predicate: namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
            object: namedNode('http://www.w3.org/2006/time#Instant')
          }, {
            predicate: namedNode('http://www.w3.org/2006/time#inXSDDateTimeStamp'),
            object: literal(new Date(new Date(observation.resultTime) - observation.timeDelta * 60000))
          }])
        },
        {
          predicate: namedNode('http://www.w3.org/2006/time#hasEnd'),
          object: writer.blank([{
            predicate: namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
            object: namedNode('http://www.w3.org/2006/time#Instant')
          }, {
            predicate: namedNode('http://www.w3.org/2006/time#inXSDDateTimeStamp'),
            object: literal(new Date(observation.resultTime))
          }])
        }
      ])
    );

    writer.addQuad(
      namedNode('Observation' + observation.id),
      namedNode('http://www.w3.org/ns/sosa/madeBySensor'),
      namedNode(observation.madeBySensor)
    );
  }
}

module.exports = {
  zetNaarLDES
};