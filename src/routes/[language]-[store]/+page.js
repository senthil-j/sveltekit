import { error } from '@sveltejs/kit';
import { getCMSComponentsFromHybrisAsync, getUrlWithQueryParams } from '../../lib/ajax-services.js';
import { getAppConfig } from '../../lib/app-config.js';
import { HOMEPAGE_CONTENT_SLOT_ORDER, slotGroups } from '../../lib/common-mapper.js';
import { languageStoreDetails } from '../../stores/languageStore';
const { contentSlotInfo } = getAppConfig();

export async function load({ params, fetch }) {
	let availableLanguages = '';
	let availableStore = '';
	const unsubscribe = languageStoreDetails.subscribe((availableSettings) => {
		availableLanguages = availableSettings?.availableLanguages;
		availableStore = availableSettings?.availableLanguages;
	});
	const { language, store } = params;
	// Validate lang and store
	if (!availableLanguages.includes(language) || !availableStore.includes(store)) {
		error(404, 'Not found');
	}

	const contentSlotToComponentUidsArray =
		contentSlotInfo &&
		contentSlotInfo
			.substring(1, contentSlotInfo.length - 2)
			.split('], ')
			.map((s) => s.replace(/=\[/g, '='))
			.map((s) => s.split('='))
			.map(([a, b]) => [a, b])
			.filter(([slotName]) => HOMEPAGE_CONTENT_SLOT_ORDER.includes(slotName))
			.map(([slotName, compsString]) => [slotName, compsString.split(', ')])
			.sort(sorterBasedOnAnotherArray(HOMEPAGE_CONTENT_SLOT_ORDER));

	const slotNameToGroupedUidsArray =
		contentSlotToComponentUidsArray &&
		contentSlotToComponentUidsArray.length > 0 &&
		groupSlots(contentSlotToComponentUidsArray, slotGroups);

	let componentUids =
		slotNameToGroupedUidsArray &&
		slotNameToGroupedUidsArray
			.map(function (item) {
				return item[1];
			})
			.flat();
	//const componentIds = componentUids?.join(',');

	if (slotNameToGroupedUidsArray && componentUids?.length) {
		const urlParams = await getCMSComponentsFromHybrisAsync(componentUids, true);
		const apiUrl = await getUrlWithQueryParams(urlParams.url, urlParams.params);
		const response = await fetch(apiUrl);
		const slotData = await response.json();
		const componentData = await transformComponentData(slotData);

		const componentDataMap =
			componentData &&
			componentData.component &&
			componentData.component
				.map((c) => {
					return { [c.uid]: c };
				})
				.reduce((prev, curr) => Object.assign(prev, curr), {});
		return { componentDataMap, slotNameToGroupedUidsArray };
	}

	/*if (componentUids?.length) {
		const componentIds = componentUids?.join(',');
		const apiParams = {
			fields: 'FULL',
			lang: 'en',
			deviceId: 'Y8-be8ff8fc-7ba4-4e72-894f-d84c740de62a',
			componentIds,
			pageSize: 50,
			city: 'SA-riyadh'
		};

		const url = getUrlWithQueryParams(
			'https://stageapi.extra.com/extracommercewebservices/v2/extra_sa/cms/components?appId=Desktop&AppSessionToken=Y8-be8ff8fc-7ba4-4e72-894f-d84c740de62a&charset=utf-8',
			apiParams
		);

		const response = await fetch(url);
		const slotData = await response.json();
		const componentData = await transformComponentData(slotData);

		const componentDataMap =
			componentData &&
			componentData.component &&
			componentData.component
				.map((c) => {
					return { [c.uid]: c };
				})
				.reduce((prev, curr) => Object.assign(prev, curr), {});
		return componentDataMap;
	}*/
}

async function getHomePageData(url, fetch) {
	const response = await fetch(url);
	const slotData = await response.json();
	const componentData = await transformComponentData(slotData);
}

function sorterBasedOnAnotherArray(refArray) {
	return (a, b) => refArray.indexOf(a[0]) - refArray.indexOf(b[0]);
}

function groupSlots(sortedSlots, slotGroups) {
	const output = [];
	const processedCombineIds = [];
	sortedSlots.forEach((sortedSlot) => {
		const [slotname] = sortedSlot;
		if (slotname in slotGroups) {
			const combineId = slotGroups[slotname];
			if (processedCombineIds.indexOf(combineId) === -1) {
				// combine the slots
				const slotNamesWithCurrentCombineId = Object.keys(slotGroups).filter(
					(x) => slotGroups[x] === combineId
				);
				const combinedUids = sortedSlots
					.filter((x) => slotNamesWithCurrentCombineId.indexOf(x[0]) > -1)
					.map((x) => x[1])
					.flat();
				const combinedSlot = [slotname, combinedUids];
				output.push(combinedSlot);
				processedCombineIds.push(combineId);
			}
		} else {
			output.push(sortedSlot);
		}
	});
	return output;
}

function transformComponentData(componentData) {
	// if both tabComponent and history are present, delete history to avoid duplicate history render
	// because tabComponent also contains history
	const tabComponentIndex = componentData.component.findIndex(
		(c) => c.typeCode === 'ExtraTabComponent'
	);
	const historyComponentIndex = componentData.component.findIndex(
		(c) => c.placementId && c.placementId === 'home_page.history'
	);

	if (tabComponentIndex > -1 && historyComponentIndex > -1) {
		componentData.component[historyComponentIndex].HIDE_COMPONENT = true;
		// componentData.component.splice(historyComponentIndex, 1);
	}

	return componentData;
}
