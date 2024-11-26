const path = require('path');

const savePicture = (destPath, rewardImg) => {
    return new Promise((resolve, reject) => {

        // Validate the reward_img object
        if (!rewardImg || typeof rewardImg.mv !== 'function') {
            console.error('Invalid file object:', rewardImg);
            return reject(new Error('Invalid file object: reward_img.mv is not a function'));
        }

        // Ensure the destination directory exists
        const fs = require('fs');
        if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true });
        }

        // Generate a unique filename based on timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const extension = path.extname(rewardImg.name || '.png'); // Use the original file extension
        const newFileName = `${timestamp}${extension}`;
        const filePath = destPath+'/'+newFileName

        // Move the file to the destination path
        rewardImg.mv(filePath, (err) => {
            if (err) {
                console.error('Error moving file:', err);
                return reject(err);
            }
            resolve(`images/${newFileName}`);
        })
    });
};

module.exports = savePicture;
