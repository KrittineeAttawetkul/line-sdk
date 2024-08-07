const lineConfig = require('../configs/lineConfig');


async function getProfile(userId) {
    try {
        const response = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${lineConfig.channelAccessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // The response is already parsed as an object
        //console.log('data Profile:', data);

        const user = {
            userId: data.userId,
            displayName: data.displayName,
            pictureUrl: data.pictureUrl
        }

        // console.log('User Profile:', user);

        return user

    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
}


module.exports = {
    getProfile
};