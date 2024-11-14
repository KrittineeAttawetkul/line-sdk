const Auth = require('../model/auth');

exports.Login = async function (req, res) {
    await Auth.Login(req.body)
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(200).send(err)
        });
}

exports.verifyToken = async function (req, res, next) {
    await Auth.verifyToken(req, res, next)
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(200).send(err)
        });
}