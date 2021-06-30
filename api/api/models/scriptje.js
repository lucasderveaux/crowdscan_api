const { Sequelize, DataTypes } = require('sequelize');
async function scriptje(req){
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

  await Sensor.sync();
  console.log("synced");

  await Sensor.create({
    environment: 'gent_langemunt',
    sensors: 3
  });

  await Sensor.create({
    environment: "veldstraat",
    sensors: 1
  });
}

module.exports = {
  scriptje
}