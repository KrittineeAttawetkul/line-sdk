'use strict';
let response = {};

var Test = function(user) {
    this.created_at = new Date();
};

Test.testAPI = function(){
    return new Promise(async resolve => {
        response["status"] = true;
        response["msg"] = 'API Version (1.3)';
        resolve(response);
    })
}


module.exports = Test;