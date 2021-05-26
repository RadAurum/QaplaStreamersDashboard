import { database } from './firebase';

const gamesRef = database.ref('/GamesResources');
const InvitationCodeRef = database.ref('/InvitationCode');
const userStreamersRef = database.ref('/UserStreamer');
const streamsApprovalRef = database.ref('/StreamsApproval');
const streamersEventsDataRef = database.ref('/StreamersEventsData');
const streamsRef = database.ref('/eventosEspeciales').child('eventsData');
const streamersHistoryEventsDataRef = database.ref('/StreamersHistoryEventsData');
const streamParticipantsRef = database.ref('/EventParticipants');
const userRef = database.ref('/Users');
const donationsLeaderBoardRef = database.ref('/DonationsLeaderBoard');
const redeemedCustomRewardsRef = database.ref('/RedeemedCustomRewards');
const eventParticipantsRef = database.ref('/EventParticipants');
const userStreamsRewardsRef = database.ref('/UserStreamsRewards');
const nonRedeemedCustomRewardsRef = database.ref('/NonRedeemedCustomRewards');


/**
 * Load all the games ordered by platform from GamesResources
 * database node
 */
export async function loadQaplaGames() {
    return (await gamesRef.once('value')).val();
}

export function loadStreamerProfile(uid, dataHandler) {
    userStreamersRef.child(uid).on('value', (streamerData) => {
        if (streamerData.exists()) {
            dataHandler(streamerData.val());
        }
    });
}

/**
 * Check if the invitation code exists
 * @param {string} invitationCode Random invitation code
 */
export async function invitationCodeExists(invitationCode) {
    if (invitationCode) {
        return (await InvitationCodeRef.child(invitationCode).once('value')).exists();
    }

    return false;
}

/**
 * Return true if the streamer id exists
 * @param {string} uid Streamer Identifier
 */
export async function streamerProfileExists(uid) {
    return (await userStreamersRef.child(uid).once('value')).exists();
}

/**
 * Remove the invitation code and create the profile for the streamer
 * @param {string} uid User Identifier
 * @param {object} userData Data to save
 * @param {string} inviteCode Invitation code used
 */
export async function createStreamerProfile(uid, userData, inviteCode) {
    InvitationCodeRef.child(inviteCode).remove();
    return await userStreamersRef.child(uid).update(userData);
}

/**
 * Update the streamer profile with the given data
 * @param {string} uid User identifier
 * @param {object} userData Data to update
 */
export async function updateStreamerProfile(uid, userData) {
    userStreamersRef.child(uid).update(userData);
}

/**
 * Save on the streamer profile a new custom reward created with the
 * dashboard
 * @param {string} uid User identifier
 * @param {string} rewardId New custom reward identifier
 * @param {string} title Title of the new reward
 * @param {number} cost Cost (in bits) of the new reward
 * @param {string} streamId Id of the stream event
 */
export async function saveStreamerTwitchCustomReward(uid, rewardId, title, cost, streamId) {
    userStreamersRef.child(uid).child('customRewards').child(rewardId).set({ title, cost, streamId });
}

/**
 * Remove a custom reward created from the streamer profile
 * @param {string} uid User identifier
 * @param {string} rewardId New custom reward identifier
 */
export async function removeStreamerTwitchCustomReward(uid, rewardId) {
    userStreamersRef.child(uid).child('customRewards').child(rewardId).remove();
}

/**
 * Create a stream request in the nodes StreamersEvents and StreamsApproval
 * @param {object} streamer User object
 * @param {string} game Selected game for the stream
 * @param {string} date Date in format DD-MM-YYYY
 * @param {string} hour Hour in format hh:mm
 * @param {string} streamType One of 'exp' or 'tournament'
 * @param {timestamp} timestamp Timestamp based on the given date and hour
 * @param {object} optionalData Customizable data for events
 * @param {number} createdAt timestamp of when the request was created
 * @param {string} stringDate Temporary field just to detect a bug
 */
export async function createNewStreamRequest(streamer, game, date, hour, streamType, timestamp, optionalData, createdAt, stringDate) {
    const event = await streamersEventsDataRef.child(streamer.uid).push({
        date,
        hour,
        game,
        status: 1,
        streamType,
        timestamp,
        optionalData,
        createdAt,
        stringDate
    });

    return await streamsApprovalRef.child(event.key).set({
        date,
        hour,
        game,
        idStreamer: streamer.uid,
        streamerName: streamer.displayName,
        streamType,
        timestamp,
        streamerChannelLink: 'https://twitch.tv/' + streamer.login,
        streamerPhoto: streamer.photoUrl,
        optionalData,
        createdAt,
        stringDate
    });
}

/**
 * Streams
 */

/**
 * Load all the strams of StreamersEventsData based on their value on the status flag
 * @param {string} uid User identifier
 * @param {number} status Value of the status to load
 */
export async function loadStreamsByStatus(uid, status) {
    return await streamersEventsDataRef.child(uid).orderByChild('status').equalTo(status).once('value');
}

/**
 * Removes a stream request of the database
 * @param {string} uid User identifier
 * @param {string} streamId Identifier of the stream to remove
 */
export async function cancelStreamRequest(uid, streamId) {
    await streamersEventsDataRef.child(uid).child(streamId).remove();
    await streamsApprovalRef.child(streamId).remove();
}

/**
 * Returns the value of the participantsNumber node of the given stream
 * @param {string} streamId Stream unique identifier
 */
export async function getStreamParticipantsNumber(streamId) {
    return await streamsRef.child(streamId).child('participantsNumber').once('value');
}

/**
 * Returns the value of the title node of the given stream
 * @param {string} streamId Stream unique identifier
 */
export async function getStreamTitle(streamId) {
    return await streamsRef.child(streamId).child('title').once('value');
}

/**
 * Returns the value of the timestamp node of the given stream
 * @param {string} streamId Stream unique identifier
 */
export async function getStreamTimestamp(streamId) {
    return await streamsRef.child(streamId).child('timestamp').once('value');
}

/**
 * Returns all the data of the given stream
 * @param {string} streamId Stream unique identifier
 */
export async function loadApprovedStreamTimeStamp(streamId) {
    return await streamsRef.child(streamId).child('timestamp').once('value');
}

/**
 * Update the date, hour and timestamps of the given stream
 * @param {string} uid User identifier
 * @param {string} streamId Streamer identifier
 * @param {string} dateUTC Date UTC in format DD-MM-YYYY
 * @param {string} hourUTC Hour UTC in format HH:MM
 * @param {string} date Local Date in format DD-MM-YYYY
 * @param {string} hour Local hour in format HH:MM
 * @param {number} timestamp Timestamp of the dates
 */
export async function updateStreamDate(uid, streamId, dateUTC, hourUTC, date, hour, timestamp) {
    streamsRef.child(streamId).update({
        dateUTC,
        hourUTC,
        tiempoLimite: date,
        hour,
        timestamp
    });

    return streamersEventsDataRef.child(uid).child(streamId).update({
        date: dateUTC,
        hour: hourUTC,
        timestamp
    });
}

/**
 * Stream Participants
 */

/**
 * Returns the value of the participantsNumber node of the given past stream
 * @param {string} uid User identifier
 * @param {string} streamId Stream unique identifier
 */
export async function getPastStreamParticipantsNumber(uid, streamId) {
    return await streamersHistoryEventsDataRef.child(uid).child(streamId).child('participantsNumber').once('value');
}

/**
 * Returns the list of participants of the given stream
 * @param {string} streamId Stream unique identifier
 */
export async function getStreamParticipantsList(streamId) {
    return await streamParticipantsRef.child(streamId).once('value');
}

/**
 * Returns the value of the participantsNumber node of the given past stream
 * @param {string} uid User identifier
 * @param {string} streamId Stream unique identifier
 */
export async function getPastStreamTitle(uid, streamId) {
    return await streamersHistoryEventsDataRef.child(uid).child(streamId).child('title').once('value');
}

export async function giveStreamExperienceForRewardRedeemed(uid, qaplaLevel, userName, amountOfExperience) {
    let userUpdate = {};
    let userExperience = qaplaLevel || 0;
    const userLeaderboardExperience = (await donationsLeaderBoardRef.child(uid).child('totalDonations').once('value')).val() || 0;

    userUpdate[`/Users/${uid}/qaplaLevel`] = amountOfExperience + userExperience;
    userUpdate[`/DonationsLeaderBoard/${uid}/totalDonations`] = userLeaderboardExperience + amountOfExperience;
    userUpdate[`/DonationsLeaderBoard/${uid}/userName`] = userName;

    database.ref('/').update(userUpdate);
}


export function getCustomRewardId(streamerId ,streamId) {

     userStreamersRef.child(streamerId).child('customRewards').orderByChild('streamId').equalTo(streamId).once('value', (streamerData) => {
        if (streamerData.exists()) {
            return streamerData.key   
        }
    })
    
}

export async function isRewardAlreadyActive(streamerId ,streamId) {
    return (await userStreamersRef.child(streamerId).child('customRewards').orderByChild('streamId').equalTo(streamId).once('value')).exists();
}

/**
 * Save on database the information about a redemption of a twitch custom reward
 * @param {string} uid User identifier
 * @param {string} photoUrl Photo of the user
 * @param {string} twitchIdThatRedeemed Id of the user that redeemed the custom reward
 * @param {string} displayName Twitch display name of the user
 * @param {string} streamId Stream identifier in our database
 * @param {string} redemptionId Id of the twitch redemption
 * @param {string} rewardId Id of the reward
 * @param {string} status Status of the redemption
 */
export async function saveCustomRewardRedemption(uid, photoUrl, twitchIdThatRedeemed, displayName, streamId, redemptionId, rewardId, status) {
    await redeemedCustomRewardsRef.child(streamId).child(redemptionId).update({ uid, photoUrl, id: twitchIdThatRedeemed, displayName, rewardId, status });
}

/**
 * Return all the custom rewards redeemed by the given user in the given stream
 * @param {string} streamId Stream identifier on the database
 * @param {String} uid User identifier
 */
export async function getCustomRewardRedemptions(streamId, uid) {
    return await redeemedCustomRewardsRef.child(streamId).orderByChild('uid').equalTo(uid).once('value');
}

/**
 * Update the status of the given custom redemption
 * @param {string} streamId Stream identifier in our database
 * @param {string} redemptionId Id of the twitch redemption
 * @param {string} status Status of the redemption
 */
export async function updateCustomRewardRedemptionStatus(streamId, redemptionId, status) {
    await redeemedCustomRewardsRef.child(streamId).child(redemptionId).update({ status });
}

/**
 * Set a listener for the redeemedCustomRewardsRef/streamId node
 * @param {string} streamId Stream identifier in our database
 * @param {function} callback Handler of the returned data
 */
export async function listenCustomRewardRedemptions(streamId, callback) {
    redeemedCustomRewardsRef.child(streamId).on('value', callback);
}

/**
 * Return a user profile object (node Users in our database) based on their twitchId or null
 * if it does not exist
 * @param {string} twitchId Twitch id
 */
export async function getUserByTwitchId(twitchId) {
    const users = await userRef.orderByChild('twitchId').equalTo(twitchId).once('value');
    return users.exists() ? users.val()[Object.keys(users.val())[0]] : null;
}

/**
 * Returns true if the user is registered to the given stream false if he is not
 * @param {string} uid User identifier
 * @param {string} streamId Stream identifier in our database
 */
export async function isUserRegisteredToStream(uid, streamId) {
    return (await eventParticipantsRef.child(streamId).child(uid).once('value')).exists();
}

/**
 * Add the specified field on the EventParticipant node of the given stream and user
 * @param {string} streamId Stream identifier in our database
 * @param {string} uid User identifier
 * @param {string} fieldName Name of the field to create
 * @param {any} value Value to save
 */
export async function addInfoToEventParticipants(streamId, uid, fieldName, value) {
    eventParticipantsRef.child(streamId).child(uid).update({ [fieldName]: value });
}

/**
 * Add the specific amount of Qoins to the given user
 * @param {string} uid user identifier
 * @param {number} qoinsToAdd Qoins to add
 */
export function addQoinsToUser(uid, qoinsToAdd) {
    try {
        userRef.child(uid).child('credits').transaction((credits) => {
            if (typeof credits === 'number') {
                return credits + qoinsToAdd;
            }

            return credits;
        }, (error) => {
            console.log(error);
        });
    } catch (error) {
        console.error(error);
    }
}

/**
 * Saves a reward information on the UserStreamsRewards node on the database
 * @param {string} uid User identifier
 * @param {string} type Type of reward (One of qoins or xq)
 * @param {string} streamerName Name of the streamer
 * @param {string} streamId Stream identifier
 * @param {number} amount Numeric value of the reward
 */
export async function saveUserStreamReward(uid, type, streamerName, streamId, amount) {
    const date = new Date();
    return await userStreamsRewardsRef.child(uid).push({ type, streamerName, streamId, amount, timestamp: date.getTime() });
}

/**
 * Save redemption of user that are not registered to the stream
 * @param {string} uid User identifier
 * @param {string} photoUrl Photo of the user
 * @param {string} twitchIdThatRedeemed Id of the user that redeemed the custom reward
 * @param {string} displayName Twitch display name of the user
 * @param {string} streamId Stream identifier
 * @param {string} redemptionId Id of the twitch redemption
 * @param {string} rewardId Id of the reward
 * @param {string} status Status of the redemption
 */
export async function saveCustomRewardNonRedemption(uid, photoUrl, twitchIdThatRedeemed, displayName, streamId, redemptionId, rewardId, status) {
    await nonRedeemedCustomRewardsRef.child(streamId).child(redemptionId).update({ uid, photoUrl, id: twitchIdThatRedeemed, displayName, rewardId, status });
}