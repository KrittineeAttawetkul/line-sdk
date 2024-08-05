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

exports.earnPoint = async function (req, res) {
    const earnInput = req.body

    await Transfer.earnPoint(earnInput)
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(400).send(err)
        });
}

exports.voidPoint = async function (req, res) {
    const voidInput = req.body

    await Transfer.voidPoint(voidInput)
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(400).send(err)
        });
}

exports.getDataByInvoiceNum = async function (req, res) {
    const invoice_num = req.body.invoice_num
    console.log('invoice_num: ', invoice_num);

    await Transfer.getDataByInvoiceNum(invoice_num)
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(400).send(err)
        });
}

exports.voidEarn = async function (req, res) {
    const voidInput = req.body

    await Transfer.voidEarn(voidInput)
        .then((response) => {
            res.status(response.statusCode).send(response)
        }).catch((err) => {
            res.status(400).send(err)
        });
}