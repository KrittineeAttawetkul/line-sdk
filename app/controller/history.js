const History = require('../model/history');



exports.getHistoryByUserId = async function (req, res) {
    const { user_id, pageNo, itemPerPage } = req.body
    // console.log('user_id:', user_id);
    await History.getHistoryByUserId(user_id, pageNo, itemPerPage)
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(400).send(err)
        });
}

exports.balanceRanking = async function (req, res) {
    await History.balanceRanking(req.body)
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(400).send(err)
        });
}
