"use strict";

const Test = require('../model/test');

exports.Test = function(req, res){
    Test.testAPI() 
    .then(resData => {
        res.status(200).send(resData);
    })
    .catch(errRes => {
        res.status(200).send(errRes);
    });
}