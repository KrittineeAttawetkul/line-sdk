const Users = require('../model/users');

exports.getUserByUserId = async function (req, res) {
    const user_id = req.body.user_id
    try {
        await Users.getUserByUserId(user_id)
            .then((response) => {
                res.status(response.statusCode).send(response)
            }).catch((err) => {
                res.status(400).send(err)
            });
    }
    catch (err) {
        let response = {
            status: false,
            errMsg: 'err'
        }
        res.status(500).send(response)
    }

}