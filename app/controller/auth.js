const Auth = require('../model/auth');

exports.Login = async function (req, res) {
    await Auth.Login(req.body)
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(200).send(err)
        });
}

exports.verifyToken = function (req, res, next) {
    Auth.verifyToken(req, res, next);
};



exports.rewardList = async function (req, res) {
    // console.log('req.query', req.query);
    await Auth.rewardList(req.query)
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(200).send(err)
        });
}
exports.rewardHistory = async function (req, res) {
    // console.log('req.query', req.query);
    await Auth.rewardHistory(req.query)
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(200).send(err)
        });
}

exports.getRewardByReward_id = async function (req, res) {
    const reward_id = req.body.reward_id
    await Auth.getRewardByReward_id(reward_id)
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(200).send(err)
        });
}
