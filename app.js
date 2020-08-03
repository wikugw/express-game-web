const express = require("express");
const app = express();
const request = require("request");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");

mongoose.connect("mongodb+srv://nodejs:123@cluster0-rv9fy.gcp.mongodb.net/test?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useFindAndModify: false
}, function (error) {
  if (error) {
    throw error;
  } else {
    console.log("a");
  }
});

var gameSchema = new mongoose.Schema({
  title: String,
  creator: String,
  width: Number,
  height: Number,
  fileName: String,
  thumbnailFile: String
});

var Game = mongoose.model("Game", gameSchema);

app.use("/", express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(fileUpload());

const games = [
  { title: "Learn to Fly 2", creator: "light_bringer777", width: 640, height: 480, fileName: "learntofly2.swf", thumbnailFile: "Learn_To_Fly_2.jpg" },
  { title: "Run 3", creator: "player_03", width: 800, height: 600, fileName: "run3.swf", thumbnailFile: "run3.jpg" },
  { title: "Continuity", creator: "glimajr", width: 640, height: 480, fileName: "continuity.swf", thumbnailFile: "booty.png" }
];

app.get("/", function (req, res) {
  res.render("homepage");
});

app.get("/game/:id", function (req, res) {
  var id = req.params.id;
  Game.findById(id, function (error, game) {
    if (error) {
      console.log(error);
    } else {
      res.render("game", {
        title: game.title,
        creator: game.creator,
        width: game.width,
        height: game.height,
        fileName: game.fileName
      });
    }
  });
});

app.get("/list", function (req, res) {
  Game.find({}, function (error, games) {
    if (error) {
      console.log(error);
    } else {
      res.render("list", {
        gamesList: games,
      });
    }
  });
});

app.get("/pics/:page", function (req, res) {
  var pageNumber = req.params.page;
  request("https://api.unsplash.com/photos?client_id=WHIH_Jg1nBL5APYh3JKB1VDKo9faYKxBAy_O2VFzXAI&page=" + pageNumber, function (error, response, body) {
    if (error) {
      console.log("error");
    } else {
      res.render("picture", {
        picData: JSON.parse(body),
        pageNumber: pageNumber
      });
    }
  });
});

app.get("/pics", function (req, res) {
  var searchTerm = req.query.searchterm;
  var pageNumber = req.query.page;
  console.log(searchTerm);
  request("https://api.unsplash.com/search/photos?client_id=WHIH_Jg1nBL5APYh3JKB1VDKo9faYKxBAy_O2VFzXAI&query=" + searchTerm + "&page=" + pageNumber, function (error, response, body) {
    if (error) {
      console.log("error");
    } else {
      res.render("picture", {
        picData: JSON.parse(body),
        pageNumber: pageNumber
      });
    }
  });
});

app.get("/search", function (req, res) {
  res.render("search");
});

app.get("/addgame", function (req, res) {
  res.render("addgame");
});

app.post("/addgame", function (req, res) {
  var data = req.body;
  var fileName = req.files.fileName;
  var thumbnailFile = req.files.thumbnailFile;
  fileName.mv("public/games/" + fileName.name, function (error) {
    if (error) {
      console.log(error);
    } else {
      console.log("upload fileName success!");
    }
  });
  thumbnailFile.mv("public/games/thumbnails/" + thumbnailFile.name, function (error) {
    if (error) {
      console.log(error);
    } else {
      console.log("Upload thumbnailFile success!");
    }
  });
  Game.create({
    title: data.title,
    creator: data.creator,
    width: data.width,
    height: data.height,
    fileName: fileName.name,
    thumbnailFile: thumbnailFile.name
  }, function (error, data) {
    if (error) {
      console.log(error);
    } else {
      console.log(data);
    }
  });
  res.redirect("/list");
});

app.get("/game/edit/:id", function (req, res) {
  var id = req.params.id;
  Game.findById(id, function (error, game) {
    if (error) {
      console.log(error);
    } else {
      res.render("edit", {
        id: id,
        title: game.title,
        creator: game.creator,
        width: game.width,
        height: game.height
      });
    }
  });
});

app.post("/game/edit/:id", function (req, res) {
  var id = req.params.id;
  Game.findByIdAndUpdate(id, {
    title: req.body.title,
    creator: req.body.creator,
    width: req.body.width,
    height: req.body.height
  }, function (error, game) {
    if (error) {
      console.log(error);
    } else {
      console.log(game);
      res.redirect("/list");
    }
  });
});

app.get("/game/delete/:id", function (req, res) {
  var id = req.params.id;
  Game.findByIdAndDelete(id, function (error, game) {
    if (error) {
      console.log(error);
    } else {
      console.log(game.title + "deleted");
      res.redirect("/list");
    }
  });
});

app.listen("3000", function () {
  console.log("coba website is now online");
});
