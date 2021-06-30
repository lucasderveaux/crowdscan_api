const unirest = require('unirest');
const N3 = require('n3');
const { namedNode, literal } = N3.DataFactory;

async function zetOm(req) {

  let baseurl = 'https://production.crowdscan.be/dataapi/gent/';
  let url = req.url.split('/');

  let val;

  if (url.length < 2) {
    val = await unirest.get(baseurl + 'gent_langemunt/data/5');
  } else {
    if (url.length == 2) {
      if (url[1].length == 0) {
        val = await unirest.get(baseurl + 'gent_langemunt/data/5');
      } else {
        val = await unirest.get(baseurl + url[1] + '/data/5');
      }
    } else {
      let cijfer = (url[2].length == 0 ? 5 : url[2]);
      val = await unirest.get(baseurl + url[1] + '/data/' + cijfer);
    }
  }

  let inhoud = val["body"];

  let header = inhoud["header"];
  let payload = inhoud["payload"]["regions"];

  let tijd = header['time'];
  let timedelta = header['timedelta'];
  let environment = header['environment'];

  let time = new Date(tijd);

  let tekst = "";

  //console.log(environment);
  try {
    let writer = new N3.Writer(
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
      }); //de default is turtle

    //Dit is specifiek voor de langemunt die drie delen heeft
    //de veldstraat heeft er maar 1

    //Feature of interest aanmaken
    writer.addQuad(
      namedNode('https://production.crowdscan.be/dataapi/gent/environments/'+environment),
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

    addObservations(writer, payload, time, timedelta, environment);

    writer.end((error, result) => {
      tekst += result;
      //console.log(result);
    });
  } catch (e) {
    console.log("de error is: " + e);
  }

  return tekst;
}

function addObservations(writer, payload, time, timedelta, environment) {

  if (payload.length < 1) {
    console.error("api van crowdscan werkt niet correct");
  } else {
    if (payload.length == 1) {
      //er is maar 1 sensor en maar 1 observatie
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

      makeSingleObservation(writer, payload[0], 0, time, timedelta, environment);

    } else {
      //environment zijn samples geven
      for (let i = 1; i < payload.length; i++) {
        writer.addQuad(
          namedNode('https://production.crowdscan.be/dataapi/gent/environments/'+environment),
          namedNode('http://www.w3.org/ns/sosa/hasSample'),
          namedNode(environment + i + '_sample')
        );
      }

      //samples aanmaken
      for (let i = 1; i < payload.length; i++) {
        writer.addQuad(
          namedNode(environment + i + '_sample'),
          namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
          namedNode('http://www.w3.org/ns/sosa/Sample')
        );
     
        writer.addQuad(
          namedNode(environment + i + '_sample'),
          namedNode('http://www.w3.org/ns/sosa/isSampleOf'),
          namedNode('https://production.crowdscan.be/dataapi/gent/environments/'+environment)
        );
      
        writer.addQuad(
          namedNode(environment + i + '_sample'),
          namedNode('http://www.w3.org/2000/01/rdf-schema#comment'),
          literal(environment + ' is opgedeeld in ' + payload.length + ' delen en dit is het sample van deel ' + i)
        );
      }
      for (let i = 1; i < payload.length; i++) {

        writer.addQuad(
          namedNode(environment + '_platfom'),
          namedNode('http://www.w3.org/ns/sosa/hosts'),
          namedNode(environment + i + '_sensor')
        );
      }
      //sensoren aanmaken
      for (let i = 1; i < payload.length; i++) {
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
      for (let i = 1; i < payload.length; i++) {
        makeSingleObservation(writer, payload[i], i, time, timedelta, environment);
      }
    }
  }
}

function makeSingleObservation(writer, headCount, suffix, time, timedelta, environment) {
  writer.addQuad(
    namedNode('observation' + suffix),
    namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
    namedNode('http://www.w3.org/ns/sosa/Observation')
  );

  writer.addQuad(
    namedNode('observation' + suffix),
    namedNode('http://www.w3.org/ns/sosa/hasFeatureOfInterest'),
    namedNode('https://production.crowdscan.be/dataapi/gent/environments/'+environment)
  );

  writer.addQuad(
    namedNode('observation' + suffix),
    namedNode('http://www.w3.org/ns/sosa/observedProperty'),
    namedNode('hoeveelheid_mensen')
  );

  writer.addQuad(
    namedNode('observation' + suffix),
    namedNode('http://www.w3.org/ns/sosa/resultTime'),
    literal(time)  //hoe ^^xsd:dateTime? -> niet automatisch?
  );

  writer.addQuad(
    namedNode('observation' + suffix),
    namedNode('http://www.w3.org/ns/sosa/hasSimpleResult'),
    literal(headCount)  //hoe ^^xsd:double -> automatisch
  );

  writer.addQuad(
    namedNode('observation' + suffix),
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
          object: literal(new Date(time - timedelta * 60000))
        }])
      },
      {
        predicate: namedNode('http://www.w3.org/2006/time#hasEnd'),
        object: writer.blank([{
          predicate: namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
          object: namedNode('http://www.w3.org/2006/time#Instant')
        }, {
          predicate: namedNode('http://www.w3.org/2006/time#inXSDDateTimeStamp'),
          object: literal(time)
        }])
      }
    ])
  );

  writer.addQuad(
    namedNode('observation' + suffix),
    namedNode('http://www.w3.org/ns/sosa/madeBySensor'),
    namedNode(environment + suffix + '_sensor')
  );
}

module.exports = {
  zetOm
};