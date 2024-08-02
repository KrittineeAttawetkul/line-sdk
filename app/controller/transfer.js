const Transfer = require('../model/transfer');

exports.getBalanceByUserId = async function (req, res) {
    const user_id = req.body.user_id
    console.log('user_id:', user_id);
    await Transfer.getBalanceByUserId(user_id)
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(400).send(err)
        });
}

exports.transferPoint = async function (req, res) {
    const transferInput = req.body

    await Transfer.transferPoint(transferInput)
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(400).send(err)
        });
}