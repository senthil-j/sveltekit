import { httpGetJSON, httpPostJSON } from '../lib/ajax-services';
import { APP_CONSTANTS, getAppConfig } from '../lib/app-config';
export function getDataFromAmplienceAsync(id) {
	console.log(id, 'seiddddddddd');
	return (
		retryPromise(5, getContentItemsByKeyOrId([], [id]))
			// .then(() => {throw new HttpError(429, {}, "{'message': 'Manual throw for testing'}")})
			.catch((reason) => {
				console.error('Amplience API failed with reason:', reason);
				return Promise.resolve(null);
			})
	);
}
function getContentItemsByKeyOrId(keys, ids, forcePostRequest = false) {
	const { lang } = getAppConfig();
	const locale = `${lang}-sa`;
	const fetchUrlBase = APP_CONSTANTS.AMPLIENCE_API_BASE;
	console.log(
		fetchUrlBase,
		'fetchUrlBasefetchUrlBasefetchUrlBase',
		keys,
		ids,
		keys.length + ids.length
	);
	if (forcePostRequest || keys.length + ids.length > 1) {
		// do a post request for multi items
		return httpPostJSON(
			`${fetchUrlBase}/fetch`,
			JSON.stringify({
				parameters: {
					depth: 'all',
					format: 'inlined',
					locale
				},
				requests: [...ids.map((id) => ({ id })), ...keys.map((key) => ({ key }))]
			})
		);
	} else if (keys.length + ids.length === 1) {
		const isKey = keys.length > 0;
		const urlSuffix = isKey ? 'key' : 'id';
		const keyOrId = [...keys, ...ids][0];
		const getUrl = `${fetchUrlBase}/${urlSuffix}/${keyOrId}`;
		console.log(getUrl, ' getUrlgetUrl');
		return httpGetJSON(getUrl, {
			'-*': true,
			depth: 'all',
			format: 'inlined',
			locale
		}).then((res) => {
			console.log(res, 'reserer');
			if (!!res?.content) {
				return { body: res.content };
			} else {
				return res;
			}
		});
	}

	throw Error('Key or Id is required');
}
export function retryPromise(retryCount, promiseInput) {
	return new Promise(async (resolve, reject) => {
		for (let i = 0; i < retryCount; i++) {
			try {
				const result = await promiseInput;
				resolve(result);
			} catch (error) {
				if (i == retryCount - 1) {
					reject(error);
				}
			}
		}
	});
}
export function parseImageBannerData(amplienceResponse) {
	let backgroundImage, links;
	const { body } = amplienceResponse;
	if ('backgroundImage' in body) {
		backgroundImage = body.backgroundImage;
		links = body.links;
	} else if ('banner' in body) {
		backgroundImage = body.banner[0].backgroundImage;
		links = body.banner[0].links;
	} else if ('image' in body) {
		backgroundImage = [body];
	} else if ('slotContent' in body) {
		backgroundImage = body.slotContent.backgroundImage;
		links = body.slotContent.links;
	}

	const data = {
		image: getImageUrl(backgroundImage, false),
		mobileImage: getImageUrl(backgroundImage, true),
		link: links && links.length > 0 ? links[0].url : null,
		bannerName: backgroundImage[0]?._meta?.name,
		bannerId: backgroundImage[0]?._meta?.deliveryId
	};
	return data;
}

function getImageUrl(imageObject, isSmallScreenDevice) {
	const obj = imageObject[0];
	const key = isSmallScreenDevice && 'mobileImage' in obj ? 'mobileImage' : 'image';
	return composeAmplienceUrl(obj[key]);
}

function composeAmplienceUrl(imageLinkObject) {
	if (imageLinkObject?.mimeType === 'image/gif') {
		return `https://aurora.a.bigcontent.io/v1/static/${imageLinkObject.name}`;
	}

	let host = 'https://' + imageLinkObject?.defaultHost;
	const ampUrl = new URL(host);
	const isVideo = imageLinkObject?._meta?.schema?.endsWith('video-link');
	const pathname = `${(isVideo && 'v') || 'i'}/${imageLinkObject?.endpoint}/${imageLinkObject.name}`;
	ampUrl.pathname = pathname;

	return ampUrl.href;
}
