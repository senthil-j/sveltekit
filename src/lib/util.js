import { getAppConfig } from './app-config';
const { encodedContextPath, sponsoredKey, extraSponsoredKey } = getAppConfig();
export function getContextedUrl(url) {
	if (!url) {
		return '';
	}
	if (url.startsWith('http') || url.startsWith(encodedContextPath)) {
		return url;
	}
	if (url.length > 0 && url[0] !== '/') {
		url = '/' + url;
	}
	return encodedContextPath + url;
}
export function isValueSponsoredOrExtraSponsored(value) {
	return (
		sponsoredKey.length > 0 &&
		extraSponsoredKey.length > 0 &&
		typeof value === 'string' &&
		[sponsoredKey, extraSponsoredKey].indexOf(value) > -1
	);
}

export function getLangSpecificFieldname(fieldname, _lang = lang, suffix = '') {
	if (_lang.length > 0) {
		_lang = _lang[0].toUpperCase() + _lang.substr(1);
	} else {
		_lang = 'Ar';
	}
	return `${fieldname}${_lang}${suffix}`;
}

export function numberTo2Digits(n) {
	if (n !== undefined && n !== null) {
		const nn = +n; // convert to number, if not already
		return nn >= 0 && n <= 9 ? `0${nn}` : `${nn}`;
	}
	return '';
}

export function singleUnbxdFacetToFilterString(facetName, values) {
	if (facetName === 'price')
		return `${facetName}:[${values[0].replace('-', ' TO ').replace(/[\[\]]/g, '')}]`;
	else if (facetName === 'ratingFacet') {
		// coming from parseUrl
		const minRatingSelected = Math.min(...values.map((v) => +v));
		if (get(unxSelectedRatings) === null) {
			unxSelectedRatings.setSingleRatingStatus(minRatingSelected, true);
		}
		return `rating:[${minRatingSelected} TO 5]`;
	} else if (facetName === 'rating') {
		// coming from unbxd params
		return values[0].startsWith('[') ? `rating:${values[0]}` : values[0];
	} else if (facetName === 'inStock_uFilter') {
		const currentCity = userSelectedCityCode || userDefaultCityCode;
		// const value = `inStockCities:"${currentCity}" OR sellingOutFastCities:"${currentCity}"`;
		const value = `inStock_uFilter:${currentCity}_inStock`;
		return value;
	} else
		return values
			?.map((v) =>
				typeof v === 'string' && v?.includes(' ')
					? `${facetName}:"${unxEscapeSpecialCharacters(v)}"`
					: `${facetName}:${unxEscapeSpecialCharacters(v)}`
			)
			.join(' OR ');
}

export function getCookie(name) {
	const cookieObj = Object.fromEntries(document.cookie.split(';').map((x) => x.trim().split('=')));

	return name in cookieObj ? cookieObj[name] : null;
}

export function isMobileWidth() {
	return window.matchMedia('only screen and (max-width: 899px)').matches;
}

export function isMobile() {
	const toMatch = [
		/Android/i,
		/webOS/i,
		/iPhone/i,
		/iPad/i,
		/iPod/i,
		/BlackBerry/i,
		/Windows Phone/i
	];
	return (
		toMatch.some((toMatchItem) => {
			return navigator.userAgent.match(toMatchItem);
		}) || isMobileWidth()
	);
}

export function jsonBooleanReviver(_, value) {
	if (value === 'true') return true;
	if (value === 'false') return false;
	return value;
}
