import { getAppConfig } from "../../../../common/config/app-config";

type CountryCode = 'SA' | 'OM' | 'BH';

const { countryCode }: { countryCode: CountryCode } = getAppConfig();

// key can be slotName or componentUid
export const cardClassesMap = {
    'homePagePolicylLinks': 'light-03-card',
    'Slot3A': 'multi-banner-card',
    'Slot3B': 'multi-banner-card',
    'DealsSlot': 'multi-banner-card',
};

// content slot orders.
// Variable name must be ${pageId}_CONTENT_SLOT_ORDER
//'Slot16' is removed from homepage slot as it is part of footer
export const HOMEPAGE_CONTENT_SLOT_ORDER = ['Slot1', 'Slot2', 'HomePageMainBannerSlot', 'UpcomingOrderStatus', 'Slot3A', 'Slot3B', 'DealsSlot', 'DontForgetSlot', 'StartWhereYouLeftSlot', 'Slot4', 'Slot5', 'Slot6', 'Slot7', 'Top5bestSellingSlot', 'Slot8', 'SpecialOffersSlot', 'GiftIdeasSlot', 'ShoppingJourneySlot', 'Slot9', 'Slot10', 'Slot11', 'Slot12', 'Slot13', 'Slot14', 'Slot15', 'AmplienceSlot14', 'AmplienceSlot15', 'AmplienceSlot16', 'AmplienceSlot17', 'AmplienceSlot18', 'AmplienceSlot19', 'AmplienceSlot20', 'AmplienceSlot21', 'AmplienceSlot22', 'AmplienceSlot23', 'AmplienceSlot24', 'AmplienceSlot25', 'AmplienceSlot26', 'AmplienceSlot27', 'AmplienceSlot28', 'AmplienceSlot29', 'AmplienceSlot30', 'Service', 'ExtraRichRelevance'];
export const BRAND_CONTENT_SLOT_ORDER = ['BrandPageMainBannerSlot', 'Slot2', 'Slot3', 'Slot4', 'Slot5', 'Slot6', 'Slot7', 'Slot8', 'Slot9', 'Slot10', 'Slot11', 'Slot12', 'Slot13', 'Slot14', 'Slot15', 'Slot16'];
export const CATEGORY_CONTENT_SLOT_ORDER = ['bannerslot', 'topsection1', 'topsection2', 'topsection3', 'middlesection1', 'middlesection2', 'middlesection3', 'middlesection4', 'bottomsection1', 'bottomsection2', 'bottomsection3', 'bottomsection4'];
export const FOOTER_CONTENT_SLOTS = ['FooterTopFull', 'FooterTop', 'FooterMiddleA', 'FooterMiddleB', 'FooterMiddleC', 'Footer', 'FooterMciCertificate'];
export const FOOTER_MIDDLE_CONTENT_SLOTS = ['FooterMiddleA', 'FooterMiddleB', 'FooterMiddleC'];


// work in progress
export const slotGroups = {
    'Slot3A': 1,
    'Slot3B': 1,
    'DealsSlot': 1
};

// Price Split provider for Installments
export type PriceSplitProviderType = 'baseeta' | 'tamara' | 'tabby' | 'easyPaymentDetails';

// Installment order based on Country
export const instalmentOrder: PriceSplitProviderType[] = countryCode === 'SA' ? ["baseeta", "tamara", "tabby"] : countryCode === 'OM' ? ["tabby", "easyPaymentDetails"] : ["tabby"];
