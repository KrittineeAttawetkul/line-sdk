const Reward = require('../model/reward');

exports.addReward = async function (req, res) {
    // console.log('user_id:', user_id);
    await Reward.addReward(req.body)
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(400).send(err)
        });
}

exports.getRewardByReward_id = async function (req, res) {
    const reward_id = req.body.reward_id
    // console.log('user_id:', user_id);
    await Reward.getRewardByReward_id(reward_id)
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(400).send(err)
        });
}