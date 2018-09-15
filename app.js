 let PORT = 8080 | process.env.PORT;
 let apiRouter = require('./router/api');
 let sensor = require('./router/socket');
 //let board = require('./router/board');
 let bodyParser = require('body-parser');
 let morgan = require('morgan');
 let express = require('express');
 let app = express();
 let http = require('http').Server(app);
 let io = require('socket.io')(http);
 let path = require('path');
 let firebase = require("firebase");
 let config = {
     apiKey: "AIzaSyCJnzs4O75wPW84hLY60emfEsNZNQpwSo4",
     authDomain: "simfus-99f7c.firebaseapp.com",
     databaseURL: "https://simfus-99f7c.firebaseio.com",
     projectId: "simfus-99f7c",
     storageBucket: "simfus-99f7c.appspot.com",
     messagingSenderId: "92041910717"
 };
 firebase.initializeApp(config);

 let database = firebase.database();

 sensor.sensorStart(io, database);
 //board.BoardStart(database);

 app.use('/api', apiRouter);
 app.use(morgan('dev'));
 app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({ extended: true }));
 app.set('views', __dirname + './dist');
 app.use(express.static(path.join(__dirname, './dist')));

 http.listen(PORT, '0.0.0.0', function() {
     console.log("System Running On Port " + PORT);
 });