
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

module.exports = Flex;
