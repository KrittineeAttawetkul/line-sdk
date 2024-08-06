const Canvas = require('../model/canvas');

exports.pointBalance = async function (req, res) {
    const user_id = req.body.user_id
    console.log('user_id:', user_id);
    await Canvas.pointBalance(user_id)
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(400).send(err)
        });
}