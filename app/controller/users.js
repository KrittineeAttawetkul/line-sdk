const Users = require('../model/users');

exports.getUserByUserId = async function (req, res) {
    const user_id = req.body.user_id
    console.log('user_id: ', user_id);
    await Users.getUserByUserId(user_id)
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(400).send(err)
        });
}

exports.checkTel = async function (req, res) {
    const tel = req.body.tel
    console.log('tel: ', tel);
    await Users.checkTel(tel)
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(400).send(err)
        });
}