import { APP_CONSTANTS, getAppConfig } from './app-config';
import { reAssignPriceValues } from './reassign-price-values';
import { getCookie, isMobile, jsonBooleanReviver, singleUnbxdFacetToFilterString } from './util';

const { userDefaultCityCode, userSelectedCityCode, unbxdSearchConfig, restockable } =
	getAppConfig();
let userCurrentCityCode = userSelectedCityCode || userDefaultCityCode;

export const UnbxdAvailableAPIs = {
	AUTOSUGGEST: 'AUTOSUGGEST',
	SEARCH: 'SEARCH',
	PDP: 'PDP',
	BROWSE: 'BROWSE',
	NONE: 'NONE'
};
const base_url = unbxdSearchConfig?.url;
const api_key = unbxdSearchConfig?.apiKey;
const site_key = unbxdSearchConfig?.siteKey;
const queryBoostingEnabled =
	'queryBoostingEnabled' in unbxdSearchConfig ? unbxdSearchConfig?.queryBoostingEnabled : true; // default is taken as true, if config not found.
const unxSpecialCharacters = [
	'\\',
	'+',
	'-',
	'&&',
	'||',
	'!',
	'(',
	')',
	'{',
	'}',
	'[',
	']',
	'^',
	'"',
	'~',
	'*',
	'?',
	':'
];

export function unxFetchRequestHeaders() {
	let operatingSystem = 'Web';
	if (navigator.appVersion?.indexOf('Win') != -1) operatingSystem = 'WINDOWS';
	if (navigator.appVersion?.indexOf('Mac') != -1) operatingSystem = 'MACOS';
	if (navigator.appVersion?.indexOf('X11') != -1) operatingSystem = 'UNIX';
	if (navigator.appVersion?.indexOf('Linux') != -1) operatingSystem = 'LINUX';

	const devType = isMobile() ? 'mobile' : 'desktop';
	const deviceType = {
		type: devType,
		os: operatingSystem,
		source: 'browser'
	};

	return {
		Authorization: api_key,
		'unbxd-user-id': getCookie('unbxd.userId'),
		'unbxd-device-type': JSON.stringify(deviceType)
	};
}
export function getProductById(productIds) {
	// productIds can be a string or an array of strings for multiple productIds
	const url = getProductsAPIUrl(productIds);

	return fetch(url, { method: 'GET', headers: unxFetchRequestHeaders() }).then((r) => r.json());
}

export function getSearchAPIResults(unbxdQueryParams) {
	const url = getSearchAPIUrl(unbxdQueryParams);

	return fetch(url, { method: 'GET', headers: unxFetchRequestHeaders() })
		.then((r) => r.json())
		.then((json) => {
			const shouldRedirect =
				json?.response?.products?.length === 0 &&
				'redirect' in json &&
				json.redirect.type === 'url';
			if (shouldRedirect) {
				window.location.assign(json.redirect.value);
			} else {
				return json;
			}
		})
		.then((jsonResponse) => {
			return JSON.parse(JSON.stringify(jsonResponse, jsonBooleanReviver));
		})
		.then((jsonResponse) => {
			// Early access megasale related reassignments
			const { isMegaSaleDuringAccessStarted, primeLevel } = getAppConfig();
			if (
				jsonResponse.response?.products?.length > 0 &&
				isMegaSaleDuringAccessStarted == true &&
				primeLevel
			) {
				jsonResponse.response.products = reAssignPriceValues(jsonResponse.response.products);
			}
			return jsonResponse;
		});
}

export function getProductsFromUnbxdUsingAlgoliaRequestAsync(
	query,
	algoliaParams,
	forceUnbxdAPI = UnbxdAvailableAPIs.NONE,
	additionalUnbxdParams = null
) {
	const unbxdRequestObject = transformAlgoliaRequestToUnbxd(
		query,
		algoliaParams,
		additionalUnbxdParams
	);

	if (forceUnbxdAPI === UnbxdAvailableAPIs.SEARCH || forceUnbxdAPI === UnbxdAvailableAPIs.NONE) {
		return getSearchAPIResults(unbxdRequestObject).then(transformUnbxdResponseToAlgolia);
	}

	return Promise.resolve();
	// throw Error("Not implemented yet");
}

// utility functions
function transformAlgoliaRequestToUnbxd(query, algoliaParams, additionalUnbxdParams) {
	const unbxdRequest = new URLSearchParams();

	// process query
	// unbxdRequest['q'] = query;
	unbxdRequest.set('q', query);

	// process params
	// productcodes
	let facetFilters = [];
	if ('filters' in algoliaParams && algoliaParams?.filters.length > 0) {
		facetFilters = transformAlgoliaFiltersToFacetFilter(algoliaParams.filters);
	}
	if ('facetFilters' in algoliaParams && algoliaParams?.facetFilters?.length > 0) {
		// other facet filters are processed here
		facetFilters = [...facetFilters, ...algoliaParams.facetFilters.filter((x) => x?.length > 0)];
	}

	if (facetFilters.length > 0) {
		const unbxdFilterList = facetFilters
			.map(transformAlgoliaFacetFilterToUnbxd)
			.filter((x) => x?.length > 0);
		if (unbxdFilterList?.length > 0) {
			// unbxdRequest['filters'] = unbxdFilterList;
			for (let unxFilter of unbxdFilterList) {
				unbxdRequest.append('filter', unxFilter);
			}
		}
	}

	if ('attributesToRetrieve' in algoliaParams) {
		// unbxdRequest['fields'] = algoliaParams.attributesToRetrieve.join(',');
		unbxdRequest.set('fields', algoliaParams.attributesToRetrieve.join(','));
	}

	if ('page' in algoliaParams) {
		// unbxdRequest['page'] = algoliaParams.page;
		unbxdRequest.set('page', algoliaParams.page);
	}

	if ('hitsPerPage' in algoliaParams) {
		// unbxdRequest['rows'] = +algoliaParams.hitsPerPage;
		unbxdRequest.set('rows', algoliaParams.hitsPerPage);
	} else {
		// unbxdRequest['rows'] = 10;
		unbxdRequest.set('rows', '10');
	}

	if ('ruleContexts' in algoliaParams) {
		if (algoliaParams.ruleContexts?.length > 0) {
			// unbxdRequest['q'] = algoliaParams.ruleContexts[0];
			unbxdRequest.set('q', algoliaParams.ruleContexts[0]);
		}
	}

	if ('responseFields' in algoliaParams) {
		if (algoliaParams.responseFields.includes('facets_stats')) {
			unbxdRequest.set('stats', 'price');
		}
	}

	if ('numericFilters' in algoliaParams) {
		algoliaParams.numericFilters
			?.flat()
			.filter((x) => x?.length > 0)
			.forEach((n) => {
				unbxdRequest.append('filter', n.replace(/(\w+): ?(\d+) TO (\d+)/, '$1:[$2 TO $3]'));
			});
	}

	// merge all price filters
	const allPriceFilters = unbxdRequest.getAll('filter').filter((x) => x.startsWith('price:'));
	if (allPriceFilters.length > 1) {
		const combinedPriceFilter = allPriceFilters.join(' OR ');
		// @ts-ignore
		allPriceFilters.forEach((priceFilter) => unbxdRequest.delete('filter', priceFilter));
		unbxdRequest.append('filter', combinedPriceFilter);
	}

	// merge additionalUnbxdParams
	if (additionalUnbxdParams !== null) {
		for (let [apKey, apValue] of additionalUnbxdParams.entries()) {
			if (apKey === 'filter') {
				unbxdRequest.append(apKey, apValue);
			} else {
				unbxdRequest.set(apKey, apValue);
			}
		}
	}
	// const finalRequest = Object.assign({}, unbxdRequest, additionalUnbxdParams);
	return unbxdRequest;
}
export function transformUnbxdResponseToAlgolia(unbxdResponse) {
	const result = {
		results: [
			{
				hits: unbxdResponse.response.products.map(transformSingleUnbxdHitToAlgolia),
				...(!!unbxdResponse.stats && { facets_stats: unbxdResponse.stats }),
				...(!!unbxdResponse.facets && { facets: unbxdResponse.facets })
			}
		],
		unbxd: {
			...unbxdResponse
		}
	};

	return Promise.resolve(result);
}
function transformAlgoliaFiltersToFacetFilter(filters) {
	// '(sellingOutFastCities: SA-riyadh OR inStockCities: SA-riyadh) AND brandEn:SAMSUNG AND "productFeaturesEn.Warranty(compressor)":"10 Years" AND categories:4-401 AND numberOfReviews>0'
	// 'brandEn:SAMSUNG AND "productFeaturesEn.Warranty(compressor)":"10 Years" AND categories:4-401 AND numberOfReviews>0'
	// [(sellingOutFastCities: SA-riyadh OR inStockCities: SA-riyadh), brandEn:SAMSUNG , "productFeaturesEn.Warranty(compressor)":"10 Years" , categories:4-401 , numberOfReviews>0]

	return filters
		.split(' AND ')
		.map((f) =>
			f.includes(' OR ')
				? f.split(' OR ').map((ff) => ff.replace(/^\(|\)$/g, ''))
				: f.replace(/"/g, '')
		);
}
function transformAlgoliaFacetFilterToUnbxd(facetFilter) {
	if (typeof facetFilter === 'string') facetFilter = [facetFilter];
	return facetFilter
		.map((f) => {
			if (f.includes(':')) {
				const [fKey, fValue] = f.split(':');
				if (['price', 'rating', 'restockableCities'].indexOf(fKey) === -1) {
					return `${fKey}_uFilter:"${fValue}"`;
				}
				if (/^\d+ TO \d+$/.test(fValue)) {
					return `${fKey}:[${fValue}]`;
				}
				const fValueFix = fValue.includes(' ') ? `"${fValue}"` : fValue;
				if (['price', 'rating', 'restockableCities'].indexOf(fKey) === -1) {
					return `${fKey}_uFilter:${fValueFix}`;
				}
				return `${fKey}:${fValue}`;
			}
			return '';
		})
		.filter((f) => f?.length > 0)
		.join(' OR ');
}
function transformSingleUnbxdHitToAlgolia(algoliaHitObject) {
	// transform product object from unbxd => Algolia hit

	const revivedAlgoliaHit = JSON.parse(JSON.stringify(algoliaHitObject), jsonBooleanReviver);
	return revivedAlgoliaHit;
}
function getUniqueId(productId) {
	return productId;
}
function getProductsAPIUrl(productIds) {
	let id = '';
	if (typeof productIds === 'string') {
		id = getUniqueId(productIds);
	} else {
		id = productIds.map((x) => getUniqueId(x)).join(',');
	}

	const url = [base_url, 'sites', site_key, APP_CONSTANTS.GET_UNBXD_PRODUCTS_ENDPOINT]
		.join('/')
		.replace(/([^:]\/)\/+/g, '$1');
	const urlObject = new URL(url);
	urlObject.searchParams.set('id', id);

	return urlObject.href;
}
function getSearchAPIUrl(querySearchParams) {
	// remove multiple price filters, if applied.
	const allPriceFilters = [
		...querySearchParams.getAll('filter').filter((x) => x.startsWith('price'))
	];
	if (allPriceFilters?.length > 1) {
		for (let i = 0; i < allPriceFilters.length - 1; i++) {
			// @ts-ignore
			querySearchParams.delete('filter', allPriceFilters[i]);
		}
	}

	const { category } = getAppConfig();
	const isSlashCPage = window.location.pathname.includes('/c/');
	const hasRuleName = isSlashCPage && category?.ruleName?.length > 0;
	const isCategoryUrl = !hasRuleName && querySearchParams.has('p');

	const url = [
		base_url,
		api_key,
		site_key,
		isCategoryUrl
			? APP_CONSTANTS.GET_UNBXD_CATEGORY_ENDPOINT
			: APP_CONSTANTS.GET_UNBXD_SEARCH_ENDPOINT
	]
		.join('/')
		.replace(/([^:]\/)\/+/g, '$1');

	const urlObject = new URL(url);

	for (let [qpKey, qpValue] of querySearchParams.entries()) {
		if (!qpValue.startsWith('productFeatures')) {
			urlObject.searchParams.append(qpKey, qpValue);
		}
	}
	urlObject.searchParams.set('version', 'V2');

	// if sort = relevance
	const inStockFilter = getInStockFilterForCity(userCurrentCityCode);
	if (urlObject.searchParams.has('sort')) {
		userCurrentCityCode = userSelectedCityCode || userDefaultCityCode;
		let currentSortValue = urlObject.searchParams.get('sort');
		if (currentSortValue.includes(',')) currentSortValue = currentSortValue.split(',')[0].trim();
		const currentCitySort = `${userCurrentCityCode}-status-unx-ts desc`;
		urlObject.searchParams.set('sort', [currentCitySort, currentSortValue].join(','));
	}

	// if stock filter is present, remove boost and bfrule (so that global boost can have an effect)
	// @ts-ignore
	const urlHasStockFilter = urlObject.searchParams.has('filter', inStockFilter);
	const isQueryBoostingDisabled = !queryBoostingEnabled;
	if (urlHasStockFilter || isQueryBoostingDisabled) {
		urlObject.searchParams.delete('boost');
		urlObject.searchParams.delete('bfrule');
	}

	// const hasProductCodes = urlObject.searchParams.getAll('filter').some(x => x.startsWith('productCode_uFilter'));
	// @ts-ignore
	const alreadyHasAnalytics = urlObject.searchParams.has('analytics', 'true');
	// const analyticsNotRequired = hasProductCodes || hasRuleName;

	if (!alreadyHasAnalytics) {
		urlObject.searchParams.set('analytics', 'false');
	} else {
		urlObject.searchParams.delete('analytics');
	}

	if (!!APP_CONSTANTS.UNX_APPEND_TYPE_FILTER_IN_REQUESTS) {
		// append a filter=type:"PRODUCT", if not present already
		const hasTypeFilter =
			urlObject.searchParams.getAll('filter').filter((x) => x.startsWith('type:')).length > 0;
		if (!hasTypeFilter) {
			urlObject.searchParams.append('filter', getTypeFilter());
		}
	}

	//decode p parameter to enable space in between the category code
	if (urlObject.searchParams.has('p')) {
		const qParam = decodeURIComponent(urlObject.searchParams.get('p'));
		urlObject.searchParams.set('p', qParam);
	}

	// append user id from unbxd cookies
	const unxUid = getCookie('unbxd.userId') || '';
	urlObject.searchParams.set('uid', unxUid);

	return urlObject.href;
}
export function convertUnbxdFacetsToSearchParams(facets) {
	const output = [];
	for (const facet of facets) {
		// facet.facetName = brandEn_uFilter
		// facet.values = [ Apples, Samsung ]
		// output = [[ 'filter', 'brandEn_uFilter:"Apples" OR brandEn_uFilter:"Samsung"' ]]
		if (facet?.values?.length > 0) {
			const key = 'filter';
			const value = singleUnbxdFacetToFilterString(facet.facetName, facet.values);
			output.push([key, value]);
		}
	}

	return new URLSearchParams(output);
}

export function getInStockFilterForCity(cityCode) {
	let inStockFilterString = `inStockCities:"${cityCode}" OR sellingOutFastCities:"${cityCode}"`;
	if (restockable) {
		inStockFilterString += ` OR restockableCities:${cityCode}`;
	}
	return inStockFilterString;
}

export function getTypeFilter(typeValue = 'PRODUCT') {
	return `type:${typeValue}`;
}

export function unxEscapeSpecialCharacters(value) {
	if (!value?.length) return value;

	let targetValue = value;
	for (let i = 0; i < unxSpecialCharacters.length; i++) {
		const sc = unxSpecialCharacters[i];
		const escapedSc = `\\${sc}`;
		if (value.includes(sc)) {
			const index = value.indexOf(sc);
			if (index === 0 || value[index - 1] !== '\\') {
				targetValue = value.replaceAll(sc, escapedSc);
			}
		}
	}
	return targetValue;
}
