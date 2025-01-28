import { httpGetJSON, httpPostJSON } from '../lib/ajax-services';
import { APP_CONSTANTS, getAppConfig } from '../lib/app-config';

export function parseCarouselData(amplienceResponse) {
	const targetResponseObject =
		'slotContent' in amplienceResponse.body
			? amplienceResponse.body.slotContent
			: amplienceResponse.body;
	const { loop, navigationDots, slides } = targetResponseObject;
	const data = {
		loop,
		navigationDots,
		slides: slides.map((s) =>
			Object.assign(
				{},
				{
					link: s.links && s.links.length > 0 ? s.links[0].url : null,
					image: getImageUrl(s.backgroundImage, false),
					mobileImage: getImageUrl(s.backgroundImage, true),
					bannerName: s?.backgroundImage[0]._meta?.name,
					bannerId: s?.backgroundImage[0]._meta?.deliveryId
				}
			)
		)
	};
	return data;
}

export function parseCarouselDataForBrandHero(amplienceResponse) {
	const { loop, navigationDots, slides } = amplienceResponse.body;
	const data = {
		loop,
		navigationDots,
		slides: slides.map((s) =>
			Object.assign(
				{},
				{
					link: (s?.links?.length > 0 && s?.links[0]?.url) || null,
					image: getImageUrl(s.backgroundImage, false),
					mobileImage: getImageUrl(s.backgroundImage, true),
					bannerName: s?.backgroundImage[0]._meta?.name,
					bannerId: s?.backgroundImage[0]._meta?.deliveryId
				}
			)
		)
	};
	return data;
}

export function parseMultiBrandImageBannersData(amplienceResponse) {
	const { bannerPosition, headingText, slides } = amplienceResponse.body;
	const data = {
		bannerPosition,
		headingText,
		slides: slides.map((s) =>
			Object.assign(
				{},
				{
					bodyText: s?.bodyText,
					image: getImageUrl(s?.backgroundImage, false),
					mobileImage: getImageUrl(s?.backgroundImage, true),
					headingText: s?.headingText,
					subHeadingText: s?.subHeadingText,
					price: s?.price,
					link: s?.links[0]?.url,
					backgroundColor: s?.backgroundColor,
					bannerName: s?.backgroundImage[0]?._meta?.name,
					bannerId: s?.backgroundImage[0]?._meta?.deliveryId
				}
			)
		)
	};
	return data;
}

export function parseSponsorBanner1x2Data(amplienceResponse) {
	const { leftBanner, rightBanner } = amplienceResponse.body;

	return [leftBanner, rightBanner].map((b) =>
		Object.assign(
			{},
			{
				image: getImageUrl(b[0].backgroundImage, false),
				mobileImage: getImageUrl(b[0].backgroundImage, true),
				link: b[0].links && b[0].links.length > 0 ? b[0].links[0].url : null,
				bannerName: b[0].backgroundImage[0]?._meta?.name,
				bannerId: b[0].backgroundImage[0]?._meta?.deliveryId
			}
		)
	);
}

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

export function separateMobileDesktopParamsFromString(paramString) {
	const ws = paramString.split(';');
	const mobile = ws[0];
	const desktop = ws.length > 1 ? ws[1] : ws[0];

	return { mobile, desktop };
}

export function getAllImageSrcsets(
	image,
	mobileImage,
	getAllResolutions,
	templateName,
	width,
	height
) {
	if (!mobileImage) {
		mobileImage = image;
	}

	if (templateName.length > 0) {
		return getImageSrcsetUsingTemplateName(image, mobileImage, templateName);
	}

	let pictureConfig = [
		{ minWidth: 1280, extension: 'auto', densities: null },
		{
			minWidth: 1024,
			extension: 'auto',
			densities: [
				['1x', 1280],
				['2x', 2560]
			]
		},
		{
			minWidth: 768,
			extension: 'auto',
			densities: [
				['1x', 1024],
				['2x', 2048]
			]
		},
		{
			maxWidth: 768,
			extension: 'auto',
			densities: [
				['1x', 768],
				['2x', 1536]
			]
		}
	];

	if (getAllResolutions === false) {
		pictureConfig = [];
		if (width !== undefined) {
			// width is given
			const { mobile: mobileWidth, desktop: desktopWidth } =
				separateMobileDesktopParamsFromString(width);

			if (mobileWidth.length > 0) {
				pictureConfig = [
					...pictureConfig,
					{
						width: true,
						widthValue: mobileWidth,
						maxWidth: 768,
						extension: 'auto',
						densities: [
							['1x', parseInt(mobileWidth)],
							['2x', 2 * parseInt(mobileWidth)]
						]
					}
				];
			}
			if (desktopWidth.length > 0) {
				pictureConfig = [
					...pictureConfig,
					{
						width: true,
						widthValue: desktopWidth,
						minWidth: 768,
						extension: 'auto',
						densities: [
							['1x', parseInt(desktopWidth)],
							['2x', 2 * parseInt(desktopWidth)]
						]
					}
				];
			}
		}
		if (height !== undefined) {
			// height is given
			const { mobile: mobileHeight, desktop: desktopHeight } =
				separateMobileDesktopParamsFromString(height);

			if (mobileHeight.length > 0) {
				pictureConfig = [
					...pictureConfig,
					{
						height: true,
						heightValue: mobileHeight,
						maxWidth: 768,
						extension: 'auto',
						densities: [
							['1x', parseInt(mobileHeight)],
							['2x', 2 * parseInt(mobileHeight)]
						]
					}
				];
			}
			if (desktopHeight.length > 0) {
				pictureConfig = [
					...pictureConfig,
					{
						height: true,
						heightValue: desktopHeight,
						minWidth: 768,
						extension: 'auto',
						densities: [
							['1x', parseInt(desktopHeight)],
							['2x', 2 * parseInt(desktopHeight)]
						]
					}
				];
			}
		}
	}

	return pictureConfig.map((pc) => {
		const output = {};
		const ext = pc.extension || '';
		let url;
		if ('minWidth' in pc || 'maxWidth' in pc) {
			const width = pc.minWidth || pc.maxWidth || 0;
			const media = 'minWidth' in pc ? 'min-width' : 'max-width';
			const isMaxWidth = 'maxWidth' in pc;
			url = isMaxWidth ? mobileImage : image;
			output.media = `(${media}: ${width}px)`;
		} else {
			url = image;
		}
		if (pc.extension !== null && pc.extension !== 'auto') {
			output.type = `image/${pc.extension}`;
		}
		if (pc.densities && pc.densities.length > 0) {
			output.srcset = pc.densities
				.map((d) => `${url}?fmt=${ext}&${'height' in pc ? 'h' : 'w'}=${d[1]} ${d[0]}`)
				.join(', ');
		} else {
			output.srcset = `${url}?fmt=auto`;
		}
		if ('widthValue' in pc) output.widthValue = parseInt(pc.widthValue);
		if ('heightValue' in pc) output.heightValue = parseInt(pc.heightValue);

		return output;
	});
}
