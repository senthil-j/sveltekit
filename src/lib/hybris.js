import { getCMSComponentsFromHybrisAsync, getUrlWithQueryParams } from './ajax-services';

export async function getGroupedCMSComponentsFromHybrisAsync(
	componentUidGroups,
	isFirstComponentsCall = false
) {
	// this method is introduced to reduce the number of calls sent to hybris
	// componentUidGroups => [[uid1, uid2, uid3], [uid4, uid5]]
	// { uid1: 0, uid2: 0, uid3: 0, uid4: 1, uid5: 1 }

	const uidToGroupIndexMap = {};
	const allUids = [];
	componentUidGroups.forEach((uidGroup, groupIndex) => {
		uidGroup.forEach((uid) => {
			uidToGroupIndexMap[uid] = groupIndex;
			allUids.push(uid);
		});
	});

	const urlParams = getCMSComponentsFromHybrisAsync(allUids);
	const apiUrl = await getUrlWithQueryParams(urlParams.url, urlParams.params);

	return await fetch(apiUrl)
		.then((res) => res.json())
		.then((cmsLinks) => cmsLinks.component)
		.then((linksData) => {
			const outputLength = new Set(Object.values(uidToGroupIndexMap)).size;
			const outputArray = Array(outputLength)
				.fill(null)
				.map((x) => new Array(0));

			linksData.forEach((l) => {
				if (l.uid in uidToGroupIndexMap) {
					const index = uidToGroupIndexMap[l.uid];
					outputArray[index].push(l);
				}
			});

			return outputArray;
		});
}
