const unirest = require('unirest');
const N3 = require('n3');
const { namedNode, literal } = N3.DataFactory;

async function do_the_thing(req) {

  let baseurl = 'https://production.crowdscan.be/dataapi/gent/';
  let test = req.url.split('/');

  let val;

  if (test.length == 1) {
    val = await unirest.get(baseurl+'gent_langemunt/data/5');
  }else{
    if(test.length == 2){
      val = await unirest.get(baseurl+test[1]+'/data/5');
    }else{
      val = await unirest.get(baseurl+test[1]+'/data/'+test[2]);
    }
  }



  let inhoud = val["body"];

  let header = inhoud["header"];
  let payload = inhoud["payload"]["regions"];

  let time = header['time'];
  let timedelta = header['timedelta'];
  let environment = header['environment'];

  let tekst = "";



  //console.log(environment);
  try {
    let writer = new N3.Writer(
      {
        prefixes:
        {
          rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
          sosa: 'http://www.w3.org/ns/sosa/',
          rdf: 'http://wwww.w3.org/1999/02/22-rdf-syntax-ns#',
          xsd: 'https://www.w3.org/2001/XMLSchema#',
          time: 'http://www.w3.org/2006/time#',
        }
      }); //de default is turtle

    //Dit is specifiek voor de langemunt die drie delen heeft
    //de veldstraat heeft er maar 1

    //Feature of interest aanmaken
    writer.addQuad(
      namedNode('crowdscanDrukte'),
      namedNode('http://wwww.w3.org/1999/02/22-rdf-syntax-ns#type'),
      namedNode('sosa:FeatureOfInterest')
    );

    writer.addQuad(
      namedNode('crowdscanDrukte'),
      namedNode('rdfs:label'),
      literal('Drukte in ' + environment)
    );

    //observable property opstellen
    writer.addQuad(
      namedNode('averageHeadCount'),
      namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      namedNode('http://www.w3.org/ns/sosa/ObservableProperty')
    );

    writer.addQuad(
      namedNode('averageHeadCount'),
      namedNode('rdfs:label'),
      literal("Average amount of people within a certain timeframe")
    );

    //platform
    writer.addQuad(
      namedNode(environment),
      namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      namedNode('http://www.w3.org/ns/sosa/Platform')
    );

    addObservations(writer, payload, time, timedelta, environment);

    writer.end((error, result) => {
      tekst += result;
      //console.log(result);
    });
  } catch (e) {
    console.log("de error is: "+e);
  }

  return tekst;
}

function addObservations(writer, payload, time, timedelta, environment) {
  if (payload.length == 1) {
    //er is maar 1 sensor en maar 1 observatie
    writer.addQuad(
      namedNode(environment),
      namedNode('http://www.w3.org/ns/sosa/hosts'),
      namedNode(environment + '0')
    );

    writer.addQuad(
      namedNode(environment + '0'),//hier ga ik gewoon een cijfer achter zetten
      namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      namedNode('http://www.w3.org/ns/sosa/sensor')
    );

    writer.addQuad(
      namedNode(environment + '0'),
      namedNode('http://www.w3.org/ns/sosa/isHostedBy'),
      namedNode(environment)
    );

    makeSingleObservation(writer, payload[0], 0, time, timedelta, environment);

  } else {
    for (let i = 1; i < payload.length; i++) {
      writer.addQuad(
        namedNode(environment),
        namedNode('http://www.w3.org/ns/sosa/hosts'),
        namedNode(environment + 'i')
      );

      writer.addQuad(
        namedNode(environment + 'i'),//hier ga ik gewoon een cijfer achter zetten
        namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        namedNode('http://www.w3.org/ns/sosa/sensor')
      );

      writer.addQuad(
        namedNode(environment + 'i'),
        namedNode('http://www.w3.org/ns/sosa/isHostedBy'),
        namedNode(environment)
      );

      makeSingleObservation(writer, payload[i], i, time, timedelta, environment);
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
    namedNode('crowdscanDrukte')
  );

  writer.addQuad(
    namedNode('observation' + suffix),
    namedNode('http://www.w3.org/ns/sosa/observedProperty'),
    namedNode('averageHeadCount')
  );

  writer.addQuad(
    namedNode('observation' + suffix),
    namedNode('http://www.w3.org/ns/sosa/resultTime'),
    literal(time)  //hoe ^^xsd:dateTime?
  );

  writer.addQuad(
    namedNode('observation' + suffix),
    namedNode('http://www.w3.org/ns/sosa/hasSimpleResult'),
    literal(headCount)  //hoe ^^xsd:double
  );

  writer.addQuad(
    namedNode('observation' + suffix),
    namedNode('http://www.w3.org/ns/sosa/phenomenonTime'),
    writer.blank([
      {
        predicate: namedNode('http://wwww.w3.org/1999/02/22-rdf-syntax-ns#type'),
        object: namedNode('http://www.w3.org/2006/time#Interval')
      }, {
        predicate: namedNode('http://www.w3.org/2006/time#minutes'),
        object: literal(timedelta)
      }
    ])
  );

  writer.addQuad(
    namedNode('observation' + suffix),
    namedNode('http://www.w3.org/ns/sosa/madeBySensor'),
    namedNode(environment + suffix)
  );
}

module.exports = {
  do_the_thing
}