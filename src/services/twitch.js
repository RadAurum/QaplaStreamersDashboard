import { TWITCH_CLIENT_ID } from '../utilities/Constants';

/**
 * Create a custom reward in the user´s twitch
 * @param {string} uid User identifier
 * @param {string} twitchId Twitch identifier
 * @param {string} accessToken Twitch access token
 * @param {string} title Title of the reward
 * @param {number} cost Cost for redeem the reward
 * @param {boolean} enabled true if the reward must be enable when created
 * @param {string} streamId Id of the stream event
 * @param {boolean} isMaxPerStreamEnabled Whether a maximum per stream is enabled
 * @param {number} maxPerStream The maximum number per stream if enabled
 */
export async function createCustomReward(twitchId, accessToken, title, cost, enabled, isMaxPerUserPerStreamEnabled = true, maxPerUserPerStream = 0, isMaxPerStreamEnabled = false, maxPerStream = 0) {
    try {
        let res = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${twitchId}`, {
            method: 'POST',
            headers: {
                'Client-Id': TWITCH_CLIENT_ID,
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                cost,
                is_max_per_user_per_stream_enabled: isMaxPerUserPerStreamEnabled,
                max_per_user_per_stream: maxPerUserPerStream,
                is_max_per_stream_enabled: isMaxPerStreamEnabled,
                max_per_stream: maxPerStream,
                is_enabled: enabled,
                should_redemptions_skip_request_queue: true
            })
        });

        const response = await res.json();
        if (response.data && response.data[0]) {

            return { status: res.status, data: response.data[0] };
        } else if (response.error) {
            if (res.status === 400) {
                return { status: res.status, error: response.error, message: response.message };
            }
        } else {
            return { status: res.status };
        }
    } catch (e) {
        console.log('Error: ', e);
    }
}

/**
 * Update a custom reward in the user´s twitch
 * @param {string} twitchId Twitch identifier
 * @param {string} accessToken Twitch access token
 * @param {string} rewardId Id of the reward to delete
 */
export async function enableCustomReward(twitchId, accessToken, rewardId) {
    try {
        let response = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${twitchId}&id=${rewardId}`, {
            method: 'PATCH',
            headers: {
                'Client-Id': TWITCH_CLIENT_ID,
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                is_enabled: true
            })
        });

        return response.status;
    } catch (e) {
        console.log('Error: ', e);
    }
}

/**
 * Update a custom reward in the user´s twitch
 * @param {string} uid User identifier
 * @param {string} twitchId Twitch identifier
 * @param {string} accessToken Twitch access token
 * @param {string} refreshToken Twitch refresh token
 * @param {string} rewardId Id of the reward to delete
 * @param {function} onInvalidRefreshToken Callback for invalid twitch refresh token
 */
 export async function disableCustomReward(twitchId, accessToken, rewardId) {
    try {
        let response = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${twitchId}&id=${rewardId}`, {
            method: 'PATCH',
            headers: {
                'Client-Id': TWITCH_CLIENT_ID,
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                is_enabled: false
            })
        });

        return response.status;
    } catch (e) {
        console.log('Error: ', e);
    }
}

/**
 * Delete a custom reward in the user´s twitch
 * @param {string} twitchId Twitch identifier
 * @param {string} accessToken Twitch access token
 * @param {string} rewardId Id of the reward to delete
 */
export async function deleteCustomReward(twitchId, accessToken, rewardId) {
    try {
        let response = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${twitchId}&id=${rewardId}`, {
            method: 'DELETE',
            headers: {
                'Client-Id': TWITCH_CLIENT_ID,
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json; charset=utf-8'
            }
        });

        return response.status;
    } catch (e) {
        console.log('Error: ', e);
    }
}

export async function getAllRewardRedemptions(twitchId, accessToken, rewardId) {
    let response = await fetch('https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?' +
    `broadcaster_id=${twitchId}` +
    `&reward_id=${rewardId}` +
    '&status=FULFILLED' +
    '&first=50', {
        method: 'GET',
        headers: {
            'Client-Id': TWITCH_CLIENT_ID,
            Authorization: `Bearer ${accessToken}`
        }
    });

    const redemptions = [];

    response = await response.json();
    if (response.data) {
        response.data.forEach(redemption => {
            redemptions.push(redemption);
        });
        while (response.pagination && response.pagination.cursor && response.pagination.cursor !== 'IA') {
            response = await getRewardRedemptionsWithCursor(response.pagination.cursor, twitchId, accessToken, rewardId);
            if (response.data) {
                response.data.forEach(redemption => {
                    redemptions.push(redemption);
                });
            }
        }
    }

    return redemptions;
}

async function getRewardRedemptionsWithCursor(cursor, twitchId, accessToken, rewardId) {
    let response = await fetch('https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?' +
    `&broadcaster_id=${twitchId}` +
    `&reward_id=${rewardId}` +
    '&status=FULFILLED' +
    `&after=${cursor}` +
    '&first=50', {
        method: 'GET',
        headers: {
            'Client-Id': TWITCH_CLIENT_ID,
            Authorization: `Bearer ${accessToken}`
        }
    });

    return await response.json();
}