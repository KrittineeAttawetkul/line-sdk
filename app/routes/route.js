"use strict";

module.exports = function(app){
  var test = require("../controller/test");

  app.route("/api/test").get(test.Test) //การแลก rewards
}
