const Reward = require('../model/reward');

exports.addReward = async function (req, res) {
    await Reward.addReward(req.body)
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(200).send(err)
        });
}

exports.getRewardByReward_id = async function (req, res) {
    const reward_id = req.body.reward_id
    await Reward.getRewardByReward_id(reward_id)
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(200).send(err)
        });
}

exports.updateReward = async function (req, res) {
    await Reward.updateReward(req.body)
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(200).send(err)
        });
}

exports.allReward = async function (req, res) {
    const { pageNo, itemPerPage } = req.body
    await Reward.allReward(pageNo, itemPerPage)
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(200).send(err)
        });
}

exports.getRewardHistoryByUserId = async function (req, res) {
    const { user_id, pageNo, itemPerPage } = req.body
    await Reward.getRewardHistoryByUserId(user_id, pageNo, itemPerPage)
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(200).send(err)
        });
}