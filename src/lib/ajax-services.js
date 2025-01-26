import { APP_CONSTANTS, environment, getAppConfig, getBaseWebServiceUrl } from './app-config';
import { getGuestToken } from './token-services.js';
export function getCMSComponentsFromHybrisAsync(componentUids, isFirstComponentsCall = false) {
	const webServiceEndpoint = getBaseWebServiceUrl();
	const { GET_CMS_COMPONENTS, appId } = APP_CONSTANTS;
	const url = `${webServiceEndpoint}/${GET_CMS_COMPONENTS}`;
	const { lang, jessionId } = getAppConfig();
	const componentIds = componentUids?.join(',');

	const params = {
		fields: 'FULL',
		lang,
		deviceId: jessionId,
		componentIds,
		pageSize: 50
	};
	return { url, params };
}

export async function getUrlWithQueryParams(url, queryParamsOverrides = {}) {
	const isAbsoluteUrl = url?.startsWith('http');
	console.log(url, queryParamsOverrides, 'url, queryParamsOverrides');
	let urlObject = new URL(url, 'https://dummy');
	const parametersFromUrl = Object.fromEntries(urlObject.searchParams.entries());
	console.log(url, parametersFromUrl, ' parametersFromUrlparametersFromUrl');
	const { jessionId, userSelectedCityCode, userDefaultCityCode } = getAppConfig();
	const defaultQueryParams = {
		appId: APP_CONSTANTS.APP_ID,
		AppSessionToken: jessionId,
		charset: 'utf-8',
		city: userSelectedCityCode || userDefaultCityCode
	};

	let mergedQP = {};
	if ('-*' in queryParamsOverrides) {
		delete queryParamsOverrides['-*'];
		mergedQP = Object.assign({}, parametersFromUrl, queryParamsOverrides);
	} else {
		mergedQP = Object.assign({}, defaultQueryParams, parametersFromUrl, queryParamsOverrides);
	}

	let queryString = '';
	const mergedQueryParamObject = new URLSearchParams(mergedQP);
	if (Object.keys(mergedQP).length > 0) {
		queryString = '?' + mergedQueryParamObject.toString();
	}

	let wholeUrl = '';
	if (isAbsoluteUrl) {
		wholeUrl = `${urlObject.origin}`;
	}
	wholeUrl += urlObject.pathname + queryString;

	return wholeUrl;
}
const getAccessToken = async () => {
	let ACCESS_TOKEN = sessionStorage.getItem('accessToken');
	if (!ACCESS_TOKEN || new Date().getTime() > JSON.parse(ACCESS_TOKEN)?.expiryTime) {
		await getGuestToken();
		ACCESS_TOKEN = await sessionStorage.getItem('accessToken');
	}
	let ACCESS_TOKEN_VALUE = await JSON.parse(ACCESS_TOKEN);
	return ACCESS_TOKEN_VALUE?.access_token || environment.BACKUP_TOKEN;
};
async function getAuthHeader() {
	return getAccessToken()
		.then((token) => `Bearer ${token}`)
		.then((Authorization) => {
			return { Authorization };
		});
}
async function getHeaders(headerOverrides = {}, useAuth = true) {
	const defaultHeaders = {
		Accept: 'application/json',
		'Content-Type': 'application/x-www-form-urlencoded'
	};

	const outputHeaders = Object.assign({}, defaultHeaders, headerOverrides);
	if (useAuth) {
		return getAuthHeader().then((authHeader) => Object.assign(outputHeaders, authHeader));
	}
	return outputHeaders;
}

export async function httpGetRaw(url, params = {}, headerOverrides = {}, useAuth = true) {
	const headers = await getHeaders(headerOverrides, useAuth);
	const urlWithParams = await getUrlWithQueryParams(url, params);
	const method = 'GET';
	console.log(urlWithParams, 'ssdfdfurl');
	return fetch(urlWithParams, {
		headers,
		method
	}).then((res) => {
		console.log(res, 'deeeeeee');
		if (res.status === 401) {
			sessionStorage.removeItem('accessToken');
			window.location.reload();
		}
		return res;
	});
}

export async function httpGetJSON(url, params = {}, headerOverrides = {}, useAuth = true) {
	const bb = await httpGetRaw(url, params, headerOverrides, useAuth).then((res) => res.json());
	console.log(bb, 'bbbbddd');
	return bb;
}

export async function httpPostRaw(url, body, headerOverrides = {}, useAuth = true) {
	const headers = await getHeaders(headerOverrides, useAuth);
	const method = 'POST';

	return fetch(url, {
		headers,
		method,
		body
	});
}
export async function httpPostJSON(url, body, headerOverrides = {}, useAuth = true) {
	return httpPostRaw(url, body, headerOverrides, useAuth).then((res) => res.json());
}
