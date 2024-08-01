const Transfer = require('../model/transfer');

exports.getBalanceByUserId = async function (req, res) {
    const sender_id  = req.body.user_id
    console.log('user_id: ', sender_id );
    await Transfer.getBalanceByUserId(sender_id )
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(400).send(err)
        });
}