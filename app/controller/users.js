const Users = require('../model/users');

exports.getUserByUserId = async function (req, res) {
    const user_id = req.body.user_id
    // console.log('user_id: ', user_id);
    await Users.getUserByUserId(user_id)
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(200).send(err)
        });
}

exports.getQrByUserId = async function (req, res) {
    const user_id = req.body.user_id
    // console.log('user_id: ', user_id);
    await Users.getQrByUserId(user_id)
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(200).send(err)
        });
}

exports.Register = async function (req, res) {
    // console.log('tel: ', req.body);
    await Users.checkTel(req.body)
        .then((response) => {
            res.status(response.statusCode).send(response)
            //  console.log(response)
        }).catch((err) => {
            res.status(200).send(err)
        });
}