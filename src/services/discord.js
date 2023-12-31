
/**
 * Send a message to an admin Qapla discord server with the information about the update
 * @param {string} streamId Id of the streamer
 * @param {string} streamerName Name of the streamer
 * @param {Date} newDateObject Date information to notify to admins
 */
export async function notifyUpdateToQaplaAdmins(streamId, streamerName, newDateObject = new Date()) {
	let adminsToTagOnDiscordMessage = ['524674047456444416', '630187691757273119'];

	let adminTags = '';
	adminsToTagOnDiscordMessage.forEach((adminId) => {
		adminTags += `<@${adminId}>`;
	});

    await fetch(
		'https://discord.com/api/webhooks/854481795700490280/qCl8z1-IDV6WQ-teWP69zDMULfFJ3jJb_brQYbUA1XiW7o2kE6EkXKI_k5ayU-HP64Ho',
        {
            method: 'POST',
            headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				content: `Evento de ${streamerName} ha cambiado de fecha\nNueva fecha: ${newDateObject.toLocaleString('es-mx')}\nID del evento: ${streamId}\n${adminTags}`,
            	username: "Qapla Date Notifier",
				tts: false
			})
        }
    );
}

export async function notifyBugToDevelopTeam(error) {
	let adminsToTagOnDiscordMessage = ['586019077546442752', /* '269616250861256712' */];

	let adminTags = '';
	adminsToTagOnDiscordMessage.forEach((adminId) => {
		adminTags += `<@${adminId}>`;
	});

    await fetch(
		'https://discord.com/api/webhooks/906607024811417651/o6TiSFGNFH57VN8z5v56LJQ-UNa_nvRUzSKjndzWi_0txhAP4rKMXtmNS8TP0mGrA2S-',
        {
            method: 'POST',
            headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				content: `${error} \n${adminTags}`,
            	username: "Qapla Bug Notifier",
				tts: false
			})
        }
    );
}

export async function notifyActivationWithReferralCode(referrerStreamerName, referredStreamerName) {
	let adminsToTagOnDiscordMessage = ['630187691757273119'];

	let adminTags = '';
	adminsToTagOnDiscordMessage.forEach((adminId) => {
		adminTags += `<@${adminId}>`;
	});

    await fetch(
		'https://discord.com/api/webhooks/982036841878413322/xHb-x674puSbxzBxtcTTBS81wCTZgp1sRlc5iKz_haBSs2QEs83_5x2XUExARFtFniSS',
        {
            method: 'POST',
            headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				content: `${referredStreamerName} ha publicado su primer evento con código de referido de ${referrerStreamerName}\n${adminTags}`,
            	username: "Notifier",
				tts: false
			})
        }
    );
}

export async function notifyCashOutToQaplaAdmin(streamerUid, streamerName, qoinsCashOut, amountBits) {
	let adminsToTagOnDiscordMessage = ['524674047456444416'];

	let adminTags = '';
	adminsToTagOnDiscordMessage.forEach((adminId) => {
		adminTags += `<@${adminId}>`;
	});

    await fetch(
		'https://discord.com/api/webhooks/1016735734494920704/aSTJNQzG9Z02bBT9M5i6OpW-z6vcI7AJiCMkjeQYc4pkWZqHeedRuFyvQ7JEMXoPanVA',
        {
            method: 'POST',
            headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				content: `${streamerName} quiere cambiar ${qoinsCashOut} Qoins por ${amountBits} Bits.\nUid: ${streamerUid}\n${adminTags}`,
            	username: "Qapla Cash Out Notifier",
				tts: false
			})
        }
    );
}