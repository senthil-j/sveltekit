import { APP_CONSTANTS, getAppConfig } from './app-config';
import { reAssignPriceValues } from './reassign-price-values';
import { UnbxdAvailableAPIs, getProductsFromUnbxdUsingAlgoliaRequestAsync } from './unbxd';

const {
	userSelectedCityCode,
	userDefaultCityCode,
	isMegaSaleDuringAccessStarted,
	primeLevel,
	unbxdEnabled,
	restockable
} = getAppConfig();
const cityCode = userSelectedCityCode || userDefaultCityCode;

export function OPTION_ATTRIBUTES_TO_RETRIEVE(attrList) {
	return { attributesToRetrieve: attrList };
}

// optional filters related builders
export function FILTER_IN_STOCK_CITY(cityCode) {
	let inStockFilter = `sellingOutFastCities:${cityCode} OR inStockCities:${cityCode}`;
	if (restockable) {
		// restockable is enabled, add the restockableCities:${cityCode} also in the stock check
		inStockFilter += ` OR restockableCities:${cityCode}`;
	}

	return `(${inStockFilter})`;
}

export function OPTION_FILTERS(filters) {
	return { filters };
}

export function combineFilters(optionalParams) {
	const allFiltersCombined = optionalParams
		.filter((p) => 'filters' in p)
		.map((p) => p.filters)
		.join(' AND ');
	const otherParams = (optionalParams = optionalParams.filter((p) => !('filters' in p)));

	return [OPTION_FILTERS(allFiltersCombined), ...otherParams];
}

export function getProductsFromAlgoliaAsync(productCodes, ...optionalParams) {
	const facetFilters = [productCodes.map((p) => `productCode:${p}`)];

	const indexSuffixIndex = optionalParams.findIndex((p) => 'INDEX_SUFFIX' in p);
	let indexSuffix = '';
	if (indexSuffixIndex > -1) {
		indexSuffix = optionalParams[indexSuffixIndex].INDEX_SUFFIX;
		delete optionalParams[indexSuffixIndex].INDEX_SUFFIX;
	}

	const alreadyHasStockFilter =
		optionalParams?.filter(
			(p) => 'filters' in p && p.filters.indexOf(FILTER_IN_STOCK_CITY(cityCode)) > -1
		).length > 0;

	if (!alreadyHasStockFilter) {
		optionalParams.push(OPTION_FILTERS(FILTER_IN_STOCK_CITY(cityCode)));
	}
	optionalParams = combineFilters(optionalParams);
	const params = Object.assign({}, { facetFilters, attributesToHighlight: [] }, ...optionalParams);

	let additionalUnbxdParams = new URLSearchParams();
	if (indexSuffix?.length > 0) {
		const sortParam = indexSuffix.replace(/_/g, ' ').trim();
		additionalUnbxdParams.set('sort', sortParam);
	}
	const promise = getProductsFromUnbxdUsingAlgoliaRequestAsync(
		'*',
		params,
		UnbxdAvailableAPIs.NONE,
		additionalUnbxdParams
	).then((res) => {
		const results = res.results;
		if (
			typeof results[0]['hits'] != 'undefined' &&
			results[0]['hits'].length > 0 &&
			isMegaSaleDuringAccessStarted == true &&
			primeLevel
		) {
			results[0]['hits'] = reAssignPriceValues(results[0]['hits']);
		}
		return results[0];
	});

	if (APP_CONSTANTS.IS_DEMO_MODE) {
		return promise.then(delayPromise(2000));
	}
	return promise;
}
