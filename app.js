var express = require("express");
var config = require("config");
var bodyParser = require("body-parser");
var session = require("express-session");
var socketio = require("socket.io");

var app = express();
var controllers = require(__dirname + "/apps/controllers");
var host = config.get("server.host");
var port = config.get("server.port")

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: config.get("secret_key"),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))
app.use(controllers);

app.set("views", __dirname + "/apps/views");
app.set("view engine", "ejs");
app.use("/static", express.static(__dirname + "/public"));

var server = app.listen(port, host, function(){
    console.log("Server in running on port ", port)
});

var io = socketio(server);
var socketControl = require("./apps/common/socketControl")(io);