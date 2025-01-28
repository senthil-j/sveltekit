import { getUrlWithQueryParams, httpPostRaw } from './ajax-services.js';
import { APP_CONSTANTS, getAppConfig } from './app-config.js';

let tokenServicePromise = null;
const { jessionId } = getAppConfig();

export async function getGuestToken() {
	if (tokenServicePromise === null) {
		tokenServicePromise = new Promise(async (resolve) => {
			const params = {
				client_id: APP_CONSTANTS.CLIENT_ID,
				client_secret: APP_CONSTANTS.CLIENT_SECRET,
				deviceId: jessionId,
				grant_type: 'client_credentials',
				'-*': true
			};
			const _url = `${APP_CONSTANTS.APP_BASE_URL}/${APP_CONSTANTS.GET_TOKEN_URL}`;
			let tokenUrl = getUrlWithQueryParams(_url, params);
			let response = await httpPostRaw(tokenUrl, null, {}, false); // postData({url:tokenUrl,headers:headers});
			if (response.status === 200) {
				const access_token = await response.json();
				const EXPIRE_IN = access_token.expires_in || 0;
				const expiryTime = new Date(new Date().getTime() + EXPIRE_IN * 1000);

				sessionStorage.setItem(
					'accessToken',
					JSON.stringify({ ...access_token, expiryTime: expiryTime.getTime() })
				);
				resolve(true);
			} else {
				resolve(false);
			}
		});
	}
	return tokenServicePromise;
}
