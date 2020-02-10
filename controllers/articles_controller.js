var mongoose = require("mongoose");
var db = require("../models");
var express = require("express");
var router = express.Router();
var axios = require("axios");
var cheerio = require("cheerio");

//Save one article
function saveOneArticle(webUrl, webTitle, response, res, last) {

    var $ = cheerio.load(response.data);
    $(".content__article-body").each(function(i, element) {
      var para = $(this).children("p").text();
      var paraOneSentence =  para.substring(0,para.indexOf("."));
      var result = {};

      result.title = webTitle;
      result.link = webUrl;
      result.para = paraOneSentence;
      result.saved = false;
      db.Article.create(result)
      .then(function(dbArticle) {
        // View the added result in the console
        // console.log(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, log it
        console.log(err);
      });
    });
}

//Scrape new articles and save in database with saved attribute as false.
router.get("/scrape", function(req, res) {

  // db.Article.remove({}, function(err) {
  //   console.log("Emptied the database");
  // });
  // db.Note.remove({}, function(err) {
  //   console.log("Emptied the database");
  // });

    axios.get("https://content.guardianapis.com/search?q=debates&api-key=9de03749-45a9-4fc5-9470-290f07c52983").then(function(news){

      db.Article.find({})
      .then(function(dbArticles) {
        let dbTitles = dbArticles.map(function(article) { 
          return article.title;
        });
        var newArticles = news.data.response.results;
        var newarticles = 0;
        for(var i =0; i < newArticles.length; i++) {
          //Store only if it already doesn't exist
          if(!dbTitles.includes(newArticles[i].webTitle) && newArticles[i].webUrl.indexOf("live") < 0) {
            newarticles++;
            fetchOneArticleAndSave(newArticles[i].webUrl, newArticles[i].webTitle, res, i == (news.data.response.results.length-1));
          }
          
        }
        res.json({result: newarticles});

      })
      .catch(function(err) {
        // res.json(err);
        console.log(err);
      });
        
    });
    // res.json({result: "success"});
    
  });

//Fetch an article and save
function fetchOneArticleAndSave(webUrl, webTitle,res, last) {
  axios.get(webUrl).then(function(response) {

      saveOneArticle(webUrl, webTitle,response,res, last);

    });
  }

// Fetch stored or saved article
//   stored: /articles?saved=false
//   saved:  /articles?saved=true
router.get("/articles", function(req, res) {

  // db.Article.remove({}, function(err) {
  //   console.log("Emptied the database");
  // });
  // db.Note.remove({}, function(err) {
  //   console.log("Emptied the database");
  // });




    var value = false;
    if(req.query.saved) {
      if(req.query.saved == "true") {
        value = true;
      }
    }
    db.Article.find({saved: value})
      .then(function(dbArticle) {
 
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
});

//Save an article
router.put("/articles/:id", function(req, res) {
  
  db.Article.update({_id: req.params.id}, { saved: true})
    .then(function(result) {
      res.json(result);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//Delete an article
router.delete("/articles/:id", function(req, res) {
  
  db.Article.remove({_id: req.params.id})
    .then(function(result) {

      res.json(result);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//Get all notes of an article
router.get("/articles/:id/notes", function(req, res){
    db.Article.findOne({ _id: req.params.id })
    .populate("notes")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});



//Create a new note for an article
router.post("/articles/:id/notes", function(req, res) {
    db.Note.create(req.body)
      .then(function(dbNote) {
        db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: {notes: dbNote._id }}, { new: true })
        .then(function(dbArticle) {
          res.json(dbArticle);
        })
        .catch(function(err) {
          res.json(err);
        });
    })
    .catch(function(err) {
      res.json(err);
    });
  });

//Get a note
router.get("/notes/:id", function(req, res){
  db.Note.findOne({ _id: req.params.id })
  .then(function(dbNote) {
    res.json(dbNote);
  })
  .catch(function(err) {
    res.json(err);
  });
});

//Delete a note
router.delete('/notes/:id', function(req,res) {
  db.Note.remove({_id: req.params.id})
    .then(function(noteResult) {
      res.json(noteResult);
    })
    .catch(function(err) {
      res.json(err);
    });
});
  
  module.exports = router;