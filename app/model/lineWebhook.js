'use strict';

const { Client } = require('@line/bot-sdk');
const lineConfig = require('../../configs/lineConfig');
const client = new Client(lineConfig);
const richmenu = require('../../configs/richmenu');
const Register = require('./register');
const Transfer = require('./transfer');

var LINE_SDK = function (user) {
  this.created_at = new Date();
};

LINE_SDK.Webhook = function (req) {
  return new Promise(async (resolve, reject) => {
    try {
      const events = req.body.events;
      //console.log('events: ', events)

      if (!events) {
        console.error("No events found in the request body.");
        return reject(new Error("No events found."));
      }

      for (const event of events) {
        const userId = event.source.userId;
        const profile = await client.getProfile(userId);

        //console.log("Processing event:", event);
        //console.log(profile)

        // type follow | member joined
        // if (event.type === 'follow' || event.type === 'memberJoined') {
        // }

        // type messasge

        message_trigger(event, userId)

      }
      resolve();
    }
    catch (error) {
      console.error("Error in Webhook function:", error);
      reject(error);
    }
  });
}

const message_trigger = async function (event, userId) {
  if (event.type === 'message') {
    let text = event.message.text;
    if (text === 'สมัครสมาชิก') {
      await Register.Registration(event, client)
    }
    if (text === 'Check point') {
      await Transfer.getBalanceByUserId(userId)
        .then((result) => {

          console.log(result.data)

          const url = `https://2a16-180-180-122-108.ngrok-free.app/images/pointCard_${userId}.png`


          if (!!url) {
            const pointCard = [
              {
                "type": "flex",
                "altText": "Receipt",
                "contents": {
                  "type": "bubble",
                  "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [

                      {
                        "type": "text",
                        "text": `${result.data.balance}`,
                        "weight": "bold",
                        "size": "xxl",
                        "margin": "md"
                      },
                      {
                        "type": "text",
                        "text": "Flex Tower, 7-7-4 Midori-ku, Tokyo",
                        "size": "xs",
                        "color": "#aaaaaa",
                        "wrap": true
                      },
                      {
                        "type": "separator",
                        "margin": "xxl"
                      },
                      {
                        "type": "box",
                        "layout": "vertical",
                        "margin": "xxl",
                        "spacing": "sm",
                        "contents": [
                          {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                              {
                                "type": "text",
                                "text": "Energy Drink",
                                "size": "sm",
                                "color": "#555555",
                                "flex": 0
                              },
                              {
                                "type": "text",
                                "text": "$2.99",
                                "size": "sm",
                                "color": "#111111",
                                "align": "end"
                              }
                            ]
                          },
                          {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                              {
                                "type": "text",
                                "text": "Chewing Gum",
                                "size": "sm",
                                "color": "#555555",
                                "flex": 0
                              },
                              {
                                "type": "text",
                                "text": "$0.99",
                                "size": "sm",
                                "color": "#111111",
                                "align": "end"
                              }
                            ]
                          },
                          {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                              {
                                "type": "text",
                                "text": "Bottled Water",
                                "size": "sm",
                                "color": "#555555",
                                "flex": 0
                              },
                              {
                                "type": "text",
                                "text": "$3.33",
                                "size": "sm",
                                "color": "#111111",
                                "align": "end"
                              }
                            ]
                          },
                          {
                            "type": "separator",
                            "margin": "xxl"
                          },
                          {
                            "type": "box",
                            "layout": "horizontal",
                            "margin": "xxl",
                            "contents": [
                              {
                                "type": "text",
                                "text": "ITEMS",
                                "size": "sm",
                                "color": "#555555"
                              },
                              {
                                "type": "text",
                                "text": "3",
                                "size": "sm",
                                "color": "#111111",
                                "align": "end"
                              }
                            ]
                          },
                          {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                              {
                                "type": "text",
                                "text": "TOTAL",
                                "size": "sm",
                                "color": "#555555"
                              },
                              {
                                "type": "text",
                                "text": "$7.31",
                                "size": "sm",
                                "color": "#111111",
                                "align": "end"
                              }
                            ]
                          },
                          {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                              {
                                "type": "text",
                                "text": "CASH",
                                "size": "sm",
                                "color": "#555555"
                              },
                              {
                                "type": "text",
                                "text": "$8.0",
                                "size": "sm",
                                "color": "#111111",
                                "align": "end"
                              }
                            ]
                          },
                          {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                              {
                                "type": "text",
                                "text": "CHANGE",
                                "size": "sm",
                                "color": "#555555"
                              },
                              {
                                "type": "text",
                                "text": "$0.69",
                                "size": "sm",
                                "color": "#111111",
                                "align": "end"
                              }
                            ]
                          }
                        ]
                      },
                      {
                        "type": "separator",
                        "margin": "xxl"
                      },
                      {
                        "type": "box",
                        "layout": "horizontal",
                        "margin": "md",
                        "contents": [
                          {
                            "type": "text",
                            "text": "PAYMENT ID",
                            "size": "xs",
                            "color": "#aaaaaa",
                            "flex": 0
                          },
                          {
                            "type": "text",
                            "text": "#743289384279",
                            "color": "#aaaaaa",
                            "size": "xs",
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
            ];

            client.pushMessage(userId, pointCard)
          }
        }).catch((err) => {
          console.log(err)
        });
    }
  }
}



module.exports = LINE_SDK;
