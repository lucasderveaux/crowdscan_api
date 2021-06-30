let express = require('express');
app = express();

let loop = require('./models/EventStream');
loop();