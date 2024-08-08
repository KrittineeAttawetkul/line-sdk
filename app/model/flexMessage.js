var Flex = function (user) {
    this.created_at = new Date();
};


Flex.pointCard = function (Data) {

    const url = 'https://7980-180-180-122-108.ngrok-free.app'

    const pointCard = [
        {
            "type": "flex",
            "altText": "Image Bubble",
            "contents": {
                "type": "bubble",
                "size": "giga", // "giga" is not a standard size, using "mega"
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "image",
                            "url": `${url}/images/PointBg.png`,
                            "size": "full",
                            "aspectMode": "cover",
                            "aspectRatio": "1:1",
                            "gravity": "center"
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": `${Data.balance}`,
                                    "size": "100px",
                                    "color": "#ffffff",
                                    "weight": "bold",
                                    "offsetTop": "5px"
                                }
                            ],
                            "position": "absolute",
                            "width": "100%",
                            "height": "100%",
                            "offsetBottom": "0px",
                            "offsetStart": "0px",
                            "offsetEnd": "0px",
                            "justifyContent": "center",
                            "alignItems": "center"
                        },
                        {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "Your Nilecon Points",
                                    "align": "center",
                                    "gravity": "center",
                                    "size": "30px",
                                    "color": "#333333",
                                    "weight": "bold"
                                }
                            ],
                            "width": "100%",
                            "height": "30%",
                            "position": "absolute"
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": `${Data.profile.displayName}`,
                                    "align": "center",
                                    "color": "#333333",
                                    "size": "30px",
                                }
                            ],
                            "position": "absolute",
                            "width": "100%",
                            "height": "26%",
                            "alignItems": "center",
                            "offsetEnd": "0px",
                            "offsetStart": "0px",
                            "offsetBottom": "0px",
                            "justifyContent": "center"
                        }
                    ],
                    "paddingAll": "0px"
                }
            }
        }
    ]

    Data.client.pushMessage(Data.profile.userId, pointCard)
}

Flex.earnSlip = function (Data) {

    const Date = timestamp()

    const earnSilp = [
        {
            "type": "flex",
            "altText": "Image Bubble",
            "contents": {
                "type": "bubble",
                "size": "giga",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "image",
                            "url": "https://7980-180-180-122-108.ngrok-free.app/images/PointBg.png",
                            "size": "full",
                            "aspectMode": "cover",
                            "aspectRatio": "1:1",
                            "gravity": "center"
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": `+${Data.transferInfo.point_amount}`,
                                    "size": "100px",
                                    "weight": "bold",
                                    "color": "#ffffff",
                                    "offsetTop": "5px"
                                }
                            ],
                            "alignItems": "center",
                            "justifyContent": "center",
                            "position": "absolute",
                            "width": "100%",
                            "height": "100%"
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "box",
                                    "layout": "baseline",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": `${Data.receiver.displayName}`,
                                            "size": "30px",
                                            "align": "center",
                                            "color": "#333333"
                                        }
                                    ]
                                },
                                {
                                    "type": "box",
                                    "layout": "baseline",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "ได้รับคะแนน",
                                            "size": "25px",
                                            "align": "center",
                                            "color": "#333333"
                                        }
                                    ],
                                    "paddingTop": "10px"
                                }
                            ],
                            "position": "absolute",
                            "width": "100%",
                            "height": "30%",
                            "justifyContent": "center",
                            "alignItems": "center"
                        },
                        {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": `${Data.transferInfo.comment}`,
                                    "size": "15px",
                                    "wrap": true,
                                    "color": "#666666"
                                }
                            ],
                            "width": "100%",
                            "height": "26%",
                            "position": "absolute",
                            "paddingAll": "15px",
                            "offsetBottom": "5px",
                            // "offsetStart": "10px",
                            "justifyContent": "center"
                        },
                        {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": `${Date.timestampTH}`,
                                    "align": "end",
                                    "size": "12px",
                                    "color": "#333333"
                                }
                            ],
                            "width": "100%",
                            "height": "10%",
                            "position": "absolute",
                            "offsetBottom": "0px",
                            "offsetStart": "0px",
                            "offsetEnd": "0px",
                            "alignItems": "center",
                            "paddingAll": "10px",
                        }
                    ],
                    "paddingAll": "0px"
                }
            }
        }
    ]

    Data.client.pushMessage(Data.receiver.userId, earnSilp)

}

function timestamp() {
    // Array of month names
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Array of thai month names
    const monthNamesTH = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    // Generate a timestamp in the format day-MonthName-year
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = monthNames[now.getMonth()]; // Get month name from array
    const monthTH = monthNamesTH[now.getMonth()]; // Get month name from array
    const year = now.getFullYear();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const timestamp = `${day}-${month}-${year}_${hours}.${minutes}.${seconds}`;
    const timestampTH = `${day} ${monthTH} ${year + 543}, ${hours}:${minutes} น.`;

    const timeData = {
        timestamp: timestamp,
        timestampTH: timestampTH
    }

    return timeData
}






module.exports = Flex;
