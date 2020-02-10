var mongoose = require("mongoose");

// module.exports = mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });

module.exports = mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/unit18Populater", { useNewUrlParser: true });