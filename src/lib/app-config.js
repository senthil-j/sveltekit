export function getAppConfig() {
	return {
		contextPath: '',
		encodedContextPath: '/en-sa',
		countryCode: 'SA',
		pageType: 'HOMEPAGE',
		pageId: 'homepage',
		lang: 'en',
		datelang: 'en-SA',
		currency: 'SAR ',
		currencyIso: 'SAR',
		currencyDecimal: '0',
		decimalCount: '2',
		currentPageId: 'homepage',
		jessionId: 'Y1-eb471a58-d2aa-4305-a87e-fdb14257bc52',
		siteBaseUrl:
			'https://accstorefront.czzt37btqp-extraunit1-s1-public.model-t.cc.commerce.ondemand.com/en-sa',
		userSelectedCity: '',
		userSelectedCityCode: '',
		userDefaultCityCode: 'SA-alkhobar',
		contentSlotInfo:
			'{Slot2=[homePageTopTiles], Slot6=[cmsitem_00225000, cmsitem_00145000, comp_00128002, accessoriesyoumightlike], Slot7=[extraTasheelBanner-homepage]}',
		amplienceBannerBaseUrl: 'https://bdkbpklt25el1gonxadugljq5.staging.bigcontent.io',
		amplienceBannerJsonBaseUrl:
			'https://bdkbpklt25el1gonxadugljq5.staging.bigcontent.io/content/id',
		amplienceid: {
			guestUser: '191c7248-64d3-48b9-b00f-9413f014c0b1'
		}
	};
}

export const environment = {
	IS_PRODUCTION: false,
	IS_DEMO_MODE: false,
	API_BASE_URL: 'https://stageapi.extra.com',
	API_CLIENT_ID: 'web',
	API_CLIENT_SECRET: 'c6HyoQeV57n7ZHf0GyqSvn78rguCbzspesj8gI94',
	BACKUP_TOKEN: 'h-Qjsw1Anzqu65lAwmgBsQkamqk',
	AMPLIENCE_API_BASE: 'https://bdkbpklt25el1gonxadugljq5.staging.bigcontent.io/content/'
};

const { countryCode = 'SA', lang } = getAppConfig();
export const APP_CONSTANTS = {
	AMPLIENCE_IMAGE_BASE_URL: 'https://media.extra.com/i/aurora/',
	AMPLIENCE_IMAGE_BASE_URL_S: 'https://media.extra.com/s/aurora/',
	AMPLIENCE_API: 'https://extra.cdn.content.amplience.net/content/id/',
	AMPLIENCE_API_HTML_BASE_URL: 'https://c1.adis.ws/v1/content/aurora/content-item/',
	AMPLIENCE_API_BASE: environment.AMPLIENCE_API_BASE,
	APP_BASE_URL: environment.API_BASE_URL,
	BASE_WEB_SERVICE_URL: '/extracommercewebservices/v2/',
	CLIENT_ID: environment.API_CLIENT_ID,
	CLIENT_SECRET: environment.API_CLIENT_SECRET,
	APP_ID: 'Desktop',
	GET_PARA_SLOT_DETAILS: 'getParagraphSlotDetails',
	RR_API_KEY: '08932f0b537182dc',
	RR_API_CLIENT_KEY: '9832da62305a1cb0',
	TEST_FREAKS_API: 'https://api.testfreaks.com',
	POST_TEST_FREAKS_REVIEW: 'product/reviews/submit',
	GET_CMS_COMPONENTS: 'cms/components',
	GET_PAGE_CONTENT: 'cms/pages/{pageId}',
	appId: 'IphoneApp',
	AMPLIENCE_HUB_NAME: 'extra',
	IS_DEMO_MODE: environment.IS_DEMO_MODE,
	GET_RR_PLACEMENTS_DATA: 'api/rrPlatform/recsForPlacements',
	GET_RR_BASE_URL: 'https://integration.richrelevance.com/rrserver/'
};

export const getBaseWebServiceUrl = () => {
	let cc = countryCode.toLowerCase();
	return `${APP_CONSTANTS.APP_BASE_URL}${APP_CONSTANTS.BASE_WEB_SERVICE_URL}extra_${cc}`;
};
