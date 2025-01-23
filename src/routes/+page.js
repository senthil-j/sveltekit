import { redirect } from '@sveltejs/kit';
import { defaultAppSettings } from '../stores/languageStore';
export const load = async (params) => {
	let defaultLanguage = '';
	let defaultStore = '';
	const unsubscribe = defaultAppSettings.subscribe((defaultSettings) => {
		defaultLanguage = defaultSettings?.defaultLanguage;
		defaultStore = defaultSettings?.defaultStore;
	});
	if (!params?.language || !params?.store) {
		redirect(307, `/${defaultLanguage}-${defaultStore}/`);
	}
};
