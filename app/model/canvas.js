const sql = require('../../configs/db');
const fs = require('fs')
const { createCanvas, loadImage, registerFont } = require('canvas')
const path = require('path');
const LINE_SDK = require('./lineWebhook');

var Canvas = function () {
    this.created_at = new Date()
}

Canvas.transferSlip = function (transferInput) {
    return new Promise(async (resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: [],
            statusCode: 200
        }

        let transferData = {
            sender_id: transferInput.sender_id,
            receiver_id: transferInput.receiver_id,
            point_amount: transferInput.point_amount,
        }

        try {
            const sender = await LINE_SDK.getProfile(transferData.sender_id)
            const receiver = await LINE_SDK.getProfile(transferData.receiver_id)

            if (!sender && !receiver) {
                console.error('No profile data returned');
                return;
            }

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
            const timestampTH = `${day} ${monthTH} ${year + 543} ${hours}:${minutes} น.`;

            // Register the custom font
            const fontPrompt = path.join(__dirname, '../../assets/Prompt/Prompt-Bold.ttf');
            registerFont(fontPrompt, { family: 'Prompt' });

            const width = 1040
            const height = 585
            const canvas = createCanvas(width, height)
            const ctx = canvas.getContext('2d')

            ctx.fillStyle = '#fff'
            ctx.fillRect(0, 0, width, height)
            // ctx.textAlign = 'center'
            // ctx.textBaseline = 'top'

            const receiver_name = receiver.displayName || 'Default Name';
            ctx.fillStyle = '#000'
            ctx.font = '46px Prompt'
            ctx.fillText(`ให้คะแนน`, 350, 75)

            ctx.fillStyle = '#000'
            ctx.font = '46px Sans'
            ctx.fillText(`${receiver_name}`, 530, 75)

            ctx.fillStyle = '#555555'
            ctx.font = '36px Prompt'
            ctx.fillText(`${transferData.point_amount} Point`, 63, 180)

            ctx.fillStyle = '#555555'
            ctx.font = '36px Prompt'
            ctx.fillText(`${timestampTH}`, 63, 540)

            // const buffer = canvas.toBuffer('image/png')
            // fs.writeFileSync('./output.png', buffer)

            ctx.strokeStyle = '#C1C1C1'
            ctx.beginPath()
            ctx.lineTo(1000, 120)
            ctx.lineTo(50, 120)
            ctx.stroke()

            // Function to draw a rounded image
            function drawRoundedImage(ctx, image, x, y, width, height) {
                const radius = Math.min(width, height) / 2;
                ctx.save();
                ctx.beginPath();
                ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(image, x, y, width, height);
                ctx.restore();
            }

            // Ensure the output directory exists
            const outputDir = 'eSlip_images';
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir);
            }

            const receiver_img = receiver.pictureUrl
            const sender_img = sender.pictureUrl
            const arrowPath = path.join(__dirname, '../../assets/transferArrow.png');

            Promise.all([loadImage(receiver_img), loadImage(sender_img), loadImage(arrowPath)])
                .then(([receiver_img, sender_img, arrowImg]) => {

                    // Draw the image onto the canvas
                    drawRoundedImage(ctx, receiver_img, 338, 210, 236, 236);

                    drawRoundedImage(ctx, sender_img, 762.65, 210, 236, 236);

                    ctx.drawImage(arrowImg, 620, 310, 100, 40);

                    // Save the canvas to a file
                    const out = fs.createWriteStream('TransferSlip.png');
                    const stream = canvas.createPNGStream();
                    stream.pipe(out);
                    out.on('finish', () => console.log('The PNG file was created.'));

                    // Save the canvas to a file with the current date as the name
                    // const outPath = path.join(outputDir, `sender_${timestamp}.png`);
                    // const outFile = fs.createWriteStream(outPath);
                    // const streamFile = canvas.createPNGStream();
                    // streamFile.pipe(outFile);
                    // outFile.on('finish', () => console.log(`The PNG file was created at ${outPath}`));
                    resolve()
                })
                .catch((err) => {
                    console.error('Failed to load images:', err);
                    reject(err)
                });
        } catch (err) {
            reject(err)
        }
    })
}

module.exports = Canvas