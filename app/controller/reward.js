const Reward = require('../model/reward');

exports.addReward = async function (req, res) {
    // console.log('Body: ', req.body);
    // console.log('File: ', req.files);
    await Reward.addReward(req.body, req.files.reward_img)
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

exports.updateForm = async function (req, res) {
    // Check if a file is uploaded
    const file = req.files ? req.files.reward_img : null;

    try {
        const response = await Reward.updateForm(req.body, file);
        res.status(response.statusCode).send(response);
    } catch (err) {
        // Log the error and send the appropriate response
        console.error(err);
        res.status(err.statusCode || 500).send(err); // Default to 500 if no status code in the error
    }
};



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