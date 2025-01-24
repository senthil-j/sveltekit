import { error } from '@sveltejs/kit';
import { HOMEPAGE_CONTENT_SLOT_ORDER, slotGroups } from '../../lib/common-mapper.js';
import { contentSlotInfo } from '../../lib/homepage-contentslot-info.js';
import { languageStoreDetails } from '../../stores/languageStore';

export async function load({ params, loadEvent }) {
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

	//console.log(contentSlotInfo, HOMEPAGE_CONTENT_SLOT_ORDER, slotGroups);

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
		slotNameToGroupedUidsArray.map(([, componentUids]) => componentUids).flat();
	// componentUids &&
	// 	componentUids.length > 0 &&
	// 	getCMSComponentsFromHybrisAsync(componentUids, true).then(
	// 		(data) => (componentData = transformComponentData(data))
	// 	);

	if (componentUids?.length) {
		const params = {
			ppId: 'Desktop',
			AppSessionToken: 'Y8-be8ff8fc-7ba4-4e72-894f-d84c740de62a',
			charset: 'utf-8',
			city: 'SA-alkhobar',
			fields: 'FULL',
			lang: 'en',
			deviceId: 'Y8-be8ff8fc-7ba4-4e72-894f-d84c740de62a'
		};
		const url =
			'https://stageapi.extra.com/extracommercewebservices/v2/extra_sa/cms/components?appId=Desktop&AppSessionToken=Y8-3795e459-051d-4247-bd72-3e8406a22e0d&charset=utf-8&city=SA-alkhobar&fields=FULL&lang=en&deviceId=Y8-3795e459-051d-4247-bd72-3e8406a22e0d&componentIds=homePageTopTiles%2CextraPs5-homepage%2CclearanceSaleComponent%2Ccomp_00122000%2CdealsCategoryListComponent%2CExtraDealProducts%2CdontForgetCartItemsComponent%2CtabComponent1%2Ccmsitem_00238003%2CtrendingThisHour%2Ccmsitem_00225000%2Ccmsitem_00145000%2Ccomp_00128002%2Caccessoriesyoumightlike%2CextraTasheelBanner-homepage%2CthemedCategory%2ChomePageshoppingservices%2CextraSponsorBanner1X2-homepage%2CtopBrandsComponentHomePage%2CclassProExclusiveComponent%2CextraServicesComponent%2Chome_page.category-top-sellers-widget%2CextraAmplienceSlot14BannerComponent%2CextraAmplienceSlot15BannerComponent%2CextraAmplienceSlot16BannerComponent%2CextraAmplienceSlot17BannerComponent%2CextraAmplienceSlot18BannerComponent%2CextraAmplienceSlot19BannerComponent%2CextraAmplienceSlot20BannerComponent%2CextraAmplienceSlot21BannerComponent%2CextraAmplienceSlot22BannerComponent%2CextraAmplienceSlot23BannerComponent%2CextraAmplienceSlot24BannerComponent%2CextraAmplienceSlot25BannerComponent%2CextraAmplienceSlot26BannerComponent%2CextraAmplienceSlot27BannerComponent%2CextraAmplienceSlot28BannerComponent%2CextraAmplienceSlot29BannerComponent%2CextraAmplienceSlot30BannerComponent&pageSize=50';

		const response = await fetch(url, params);
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

		//console.log(componentDataMap);
		return componentDataMap;
	}

	// const url =
	// 	'https://stageapi.extra.com/extracommercewebservices/v2/extra_sa/cms/components?appId=Desktop&AppSessionToken=Y8-3795e459-051d-4247-bd72-3e8406a22e0d&charset=utf-8&city=SA-alkhobar&fields=FULL&lang=en&deviceId=Y8-3795e459-051d-4247-bd72-3e8406a22e0d&componentIds=homePageTopTiles%2CextraPs5-homepage%2CclearanceSaleComponent%2Ccomp_00122000%2CdealsCategoryListComponent%2CExtraDealProducts%2CdontForgetCartItemsComponent%2CtabComponent1%2Ccmsitem_00238003%2CtrendingThisHour%2Ccmsitem_00225000%2Ccmsitem_00145000%2Ccomp_00128002%2Caccessoriesyoumightlike%2CextraTasheelBanner-homepage%2CthemedCategory%2ChomePageshoppingservices%2CextraSponsorBanner1X2-homepage%2CtopBrandsComponentHomePage%2CclassProExclusiveComponent%2CextraServicesComponent%2Chome_page.category-top-sellers-widget%2CextraAmplienceSlot14BannerComponent%2CextraAmplienceSlot15BannerComponent%2CextraAmplienceSlot16BannerComponent%2CextraAmplienceSlot17BannerComponent%2CextraAmplienceSlot18BannerComponent%2CextraAmplienceSlot19BannerComponent%2CextraAmplienceSlot20BannerComponent%2CextraAmplienceSlot21BannerComponent%2CextraAmplienceSlot22BannerComponent%2CextraAmplienceSlot23BannerComponent%2CextraAmplienceSlot24BannerComponent%2CextraAmplienceSlot25BannerComponent%2CextraAmplienceSlot26BannerComponent%2CextraAmplienceSlot27BannerComponent%2CextraAmplienceSlot28BannerComponent%2CextraAmplienceSlot29BannerComponent%2CextraAmplienceSlot30BannerComponent&pageSize=50';

	// const response = await fetch(url, params);
	// console.log(response, 'footer dataaaaaaaaaa');
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
