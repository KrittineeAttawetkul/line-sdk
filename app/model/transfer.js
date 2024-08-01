const sql = require('../../configs/db');

var Transfer = function () {
    this.created_at = new Date()
}

Transfer.getBalanceByUserId = function (sender_id ) {
    return new Promise((resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: [],
            statusCode: 200
        }

        const balance = "SELECT * FROM point_transfer WHERE sender_id  = ?"

        try {
            sql.query(
                balance,
                [sender_id ], // ค่าที่รับเข้ามาเพื่อทำการค้นหา
                //call back function
                (err, results, fields) => { //results ที่ได้เป็นรูปแบบของ Array
                    if (err) {
                        console.log(err)
                        response.errMsg = err
                        response.status = false
                        response.statusCode = 500
                        reject(response)
                    }
                    else {
                        if (results.length > 0) {
                            response["data"] /* รูปแบบที่ 2 */ = results[0]; //ทำให้เป็๋น Obj
                        }
                        else {
                            response.errMsg = 'ไม่พบข้อมูลในระบบ'
                        }
                        resolve(response)
                    }
                }
            )
        } catch (err) {
            reject(err)
        }
    })
}