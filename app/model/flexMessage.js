var Flex = function (user) {
    this.created_at = new Date();
};

const url = 'https://nilecon-hr-api-git-master-krittinees-projects.vercel.app/'

Flex.pointCard = function (Data) {
    const pointCard = [
        {
            "type": "flex",
            "altText": "My Points",
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
                                    "text": `${Data.balance ? Data.balance : 0}`,
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

    // const Date = timestamp()

    const earnSilp = [
        {
            "type": "flex",
            "altText": "คุณได้รับคะแนน",
            "contents": {
                "type": "bubble",
                "size": "kilo",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "image",
                            "url": `${url}/images/Nilecon_Logo.png`,
                            "align": "start",
                            "aspectRatio": "4:1",
                            "size": "sm"
                        },
                        {
                            "type": "text",
                            "text": "คุณได้รับคะแนน",
                            "weight": "bold",
                            "size": "xl",
                            "margin": "md",
                            "color": "#34A853"
                        },
                        {
                            "type": "separator",
                            "margin": "lg"
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "margin": "lg",
                            "spacing": "sm",
                            "contents": [
                                {
                                    "type": "box",
                                    "layout": "horizontal",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "จำนวนคะแนน:",
                                            "size": "sm",
                                            "color": "#666666"
                                        },
                                        {
                                            "type": "text",
                                            "text": `${Data.transferInfo.point_amount} คะแนน`,
                                            "size": "sm",
                                            "color": "#111111",
                                            "align": "end",
                                            "weight": "bold"
                                        }
                                    ]
                                },
                                {
                                    "type": "box",
                                    "layout": "vertical",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "หมายเหตุ:",
                                            "size": "sm",
                                            "color": "#666666"
                                        },
                                        {
                                            "type": "box",
                                            "layout": "vertical",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": `${Data.transferInfo.comment}`,
                                                    "size": "sm",
                                                    "color": "#333333",
                                                    "align": "start",
                                                    "wrap": true
                                                }
                                            ],
                                            "paddingTop": "5px"
                                        }
                                    ],
                                    "paddingTop": "2px"
                                }
                            ]
                        },
                        {
                            "type": "separator",
                            "margin": "lg"
                        },
                        {
                            "type": "box",
                            "layout": "horizontal",
                            "margin": "lg",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "TRANSFER ID ",
                                    "size": "xxs",
                                    "color": "#aaaaaa"
                                },
                                {
                                    "type": "text",
                                    "text": `${Data.invoiceNum}`,
                                    "color": "#aaaaaa",
                                    "size": "xxs",
                                    "align": "end"
                                }
                            ]
                        }
                    ]
                },
                "styles": {
                    "footer": {
                        "separator": true
                    }
                }
            }
        }
    ]

    Data.client.pushMessage(Data.receiver.userId, earnSilp)
}

Flex.voidSlip = function (Data) {

    const Date = timestamp()

    const voidSilp = [
        {
            "type": "flex",
            "altText": "คุณถูกหักคะแนน",
            "contents": {
                "type": "bubble",
                "size": "kilo",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "image",
                            "url": `${url}/images/Nilecon_Logo.png`,
                            "align": "start",
                            "aspectRatio": "4:1",
                            "size": "sm"
                        },
                        {
                            "type": "text",
                            "text": "คุณถูกหักคะแนน",
                            "weight": "bold",
                            "size": "xl",
                            "margin": "md",
                            "color": "#FF1400"
                        },
                        {
                            "type": "separator",
                            "margin": "lg"
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "margin": "lg",
                            "spacing": "sm",
                            "contents": [
                                {
                                    "type": "box",
                                    "layout": "horizontal",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "จำนวนคะแนน:",
                                            "size": "sm",
                                            "color": "#666666"
                                        },
                                        {
                                            "type": "text",
                                            "text": `${Data.transferInfo.point_amount ? Data.transferInfo.point_amount : Data.point_amount} คะแนน`,
                                            "size": "sm",
                                            "color": "#111111",
                                            "align": "end",
                                            "weight": "bold"
                                        }
                                    ]
                                },
                                {
                                    "type": "box",
                                    "layout": "vertical",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "หมายเหตุ:",
                                            "size": "sm",
                                            "color": "#666666"
                                        },
                                        {
                                            "type": "box",
                                            "layout": "vertical",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": `${Data.transferInfo.comment}`,
                                                    "size": "sm",
                                                    "color": "#333333",
                                                    "align": "start",
                                                    "wrap": true
                                                }
                                            ],
                                            "paddingTop": "5px"
                                        }
                                    ],
                                    "paddingTop": "2px"
                                }
                            ]
                        },
                        {
                            "type": "separator",
                            "margin": "lg"
                        },
                        {
                            "type": "box",
                            "layout": "horizontal",
                            "margin": "lg",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "TRANSFER ID ",
                                    "size": "xxs",
                                    "color": "#aaaaaa"
                                },
                                {
                                    "type": "text",
                                    "text": `${Data.invoiceNum}`,
                                    "color": "#aaaaaa",
                                    "size": "xxs",
                                    "align": "end"
                                }
                            ]
                        }
                    ]
                },
                "styles": {
                    "footer": {
                        "separator": true
                    }
                }
            }
        }
    ]

    Data.client.pushMessage(Data.sender.userId, voidSilp)
}

Flex.senderSlip = function (Data) {

    const Date = timestamp()

    const senderSlip = [
        {
            "type": "flex",
            "altText": "คุณได้ให้คะแนน",
            "contents": {
                "type": "bubble",
                "size": "kilo",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "image",
                            "url": `${url}/images/Nilecon_Logo.png`,
                            "align": "start",
                            "aspectRatio": "4:1",
                            "size": "sm"
                        },
                        {
                            "type": "text",
                            "text": "คุณได้ให้คะแนน",
                            "weight": "bold",
                            "size": "xl",
                            "margin": "md",
                            "color": "#FF1400"
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": `To: ${Data.receiver.displayName}`,
                                    "size": "xs",
                                    "color": "#444444",
                                    "wrap": true,
                                    "weight": "bold",
                                    "margin": "md"
                                }
                            ]
                        },
                        {
                            "type": "separator",
                            "margin": "lg"
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "margin": "lg",
                            "spacing": "sm",
                            "contents": [
                                {
                                    "type": "box",
                                    "layout": "horizontal",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "จำนวนคะแนน:",
                                            "size": "sm",
                                            "color": "#666666"
                                        },
                                        {
                                            "type": "text",
                                            "text": `${Data.transferInfo.point_amount} คะแนน`,
                                            "size": "sm",
                                            "color": "#111111",
                                            "align": "end",
                                            "weight": "bold"
                                        }
                                    ]
                                },
                                {
                                    "type": "box",
                                    "layout": "vertical",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "เหตุผลการให้คะแนน:",
                                            "size": "sm",
                                            "color": "#666666"
                                        },
                                        {
                                            "type": "box",
                                            "layout": "vertical",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": `${Data.transferInfo.comment}`,
                                                    "size": "sm",
                                                    "color": "#333333",
                                                    "align": "start",
                                                    "wrap": true
                                                }
                                            ],
                                            "paddingTop": "5px"
                                        }
                                    ],
                                    "paddingTop": "2px"
                                }
                            ]
                        },
                        {
                            "type": "separator",
                            "margin": "lg"
                        },
                        {
                            "type": "box",
                            "layout": "horizontal",
                            "margin": "lg",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "TRANSFER ID ",
                                    "size": "xxs",
                                    "color": "#aaaaaa"
                                },
                                {
                                    "type": "text",
                                    "text": `${Data.invoiceNum}`,
                                    "color": "#aaaaaa",
                                    "size": "xxs",
                                    "align": "end"
                                }
                            ]
                        }
                    ]
                },
                "styles": {
                    "footer": {
                        "separator": true
                    }
                }
            }
        }
    ]

    Data.client.pushMessage(Data.sender.userId, senderSlip)
}

Flex.receiverSlip = function (Data) {

    const Date = timestamp()

    const receiverSlip = [
        {
            "type": "flex",
            "altText": "คุณได้รับคะแนน",
            "contents": {
                "type": "bubble",
                "size": "kilo",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "image",
                            "url": `${url}/images/Nilecon_Logo.png`,
                            "align": "start",
                            "aspectRatio": "4:1",
                            "size": "sm"
                        },
                        {
                            "type": "text",
                            "text": "คุณได้รับคะแนน",
                            "weight": "bold",
                            "size": "xl",
                            "margin": "md",
                            "color": "#34A853"
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": `From: ${Data.sender.displayName}`,
                                    "size": "xs",
                                    "color": "#444444",
                                    "wrap": true,
                                    "weight": "bold",
                                    "margin": "md"
                                }
                            ]
                        },
                        {
                            "type": "separator",
                            "margin": "lg"
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "margin": "lg",
                            "spacing": "sm",
                            "contents": [
                                {
                                    "type": "box",
                                    "layout": "horizontal",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "จำนวนคะแนน:",
                                            "size": "sm",
                                            "color": "#666666"
                                        },
                                        {
                                            "type": "text",
                                            "text": `${Data.transferInfo.point_amount} คะแนน`,
                                            "size": "sm",
                                            "color": "#111111",
                                            "align": "end",
                                            "weight": "bold"
                                        }
                                    ]
                                },
                                {
                                    "type": "box",
                                    "layout": "vertical",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "เหตุผลการให้คะแนน:",
                                            "size": "sm",
                                            "color": "#666666"
                                        },
                                        {
                                            "type": "box",
                                            "layout": "vertical",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": `${Data.transferInfo.comment}`,
                                                    "size": "sm",
                                                    "color": "#333333",
                                                    "align": "start",
                                                    "wrap": true
                                                }
                                            ],
                                            "paddingTop": "5px"
                                        }
                                    ],
                                    "paddingTop": "2px"
                                }
                            ]
                        },
                        {
                            "type": "separator",
                            "margin": "lg"
                        },
                        {
                            "type": "box",
                            "layout": "horizontal",
                            "margin": "lg",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "TRANSFER ID ",
                                    "size": "xxs",
                                    "color": "#aaaaaa"
                                },
                                {
                                    "type": "text",
                                    "text": `${Data.invoiceNum}`,
                                    "color": "#aaaaaa",
                                    "size": "xxs",
                                    "align": "end"
                                }
                            ]
                        }
                    ]
                },
                "styles": {
                    "footer": {
                        "separator": true
                    }
                }
            }
        }
    ]

    Data.client.pushMessage(Data.receiver.userId, receiverSlip)
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
