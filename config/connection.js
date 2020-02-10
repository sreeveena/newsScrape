var mongoose = require("mongoose");

module.exports = 
    // database: process.env.MONGODB_URI || 'mongodb://localhost:27017/mongoScraper'
    // mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });
    mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });

