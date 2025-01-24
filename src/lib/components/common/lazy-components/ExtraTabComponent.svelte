<script lang="ts">
    import { getCartLoginDetails } from "../../header/services/header-service";
    import RecentlyViewed from "../../home/component/RecentlyViewed.svelte";
    import { getCMSComponentsFromHybrisAsync } from "../services/hybris";
    import {
        fetchAndMergeProductDataFromAlgoliaToRR,
        getRichRelevanceDataForPlacementIdAsync,
        makeDataComponentCompatible,
    } from "../services/rich-relevance";

    export let metaData;
    export function onLoad() {
        const tabElements = metaData?.tabElements.split(" ");
        const onLoadPromise = getCMSComponentsFromHybrisAsync(tabElements)
            .then((res) => res.component)
            .then((component) => getTabsData(component))
            .then((promiseResults) => Object.assign({}, ...promiseResults))
            .then((tabsObject) => createPropsObject(tabsObject))
            .then((compProps) => {
                const hasHistoryItems = compProps.historyItems?.length > 0;
                const hasWishlistItems = compProps.wishlistItems?.length > 0;
                const shouldLoadComponent = hasHistoryItems || hasWishlistItems;
                loaded = shouldLoadComponent;
                failedToLoad = !loaded;
                return shouldLoadComponent;
            });

        return onLoadPromise;
    }

    let loaded = false;
    let failedToLoad = false;
    let props: any = {};

    function getTabsData(tabElementList: any[]) {
        return Promise.all(
            tabElementList.map((te) => {
                if (te?.component?.typeCode === "ExtraRichRelevanceComponent") {
                    return getHistory(te.component.placementId);
                } else if (
                    te?.component?.typeCode === "ExtraWishlistComponent"
                ) {
                    return getCurrentUserWishlist(te);
                } else {
                    return Promise.resolve(null);
                }
            }),
        );
    }
    function getCurrentUserWishlist(tabElement) {
        const { title: wishlistTitle } = tabElement;
        return getCartLoginDetails(true).then((cartDetails) => {
            const {
                customer: { wishlist, wishlistSize, uid },
            } = cartDetails;
            const isGuestUser = uid === "anonymous";
            const userHasWishlist = !isGuestUser && wishlistSize > 0;
            if (userHasWishlist) {
                const wishlistItems = wishlist.entries.map((e) => e.product);
                return {
                    ExtraWishlistComponent: { wishlistItems, wishlistTitle },
                };
            }
            return {
                ExtraWishlistComponent: {
                    wishlistItems: [],
                    wishlistTitle: "",
                },
            };
        });
    }
    function getHistory(placementId: string) {
        return getRichRelevanceDataForPlacementIdAsync(placementId)
            .then((res) => fetchAndMergeProductDataFromAlgoliaToRR(res))
            .then((mergedData) => makeDataComponentCompatible(mergedData))
            .then((res) => {
                const { hits: historyItems, strategyMessage: historyTitle } =
                    res;
                return {
                    ExtraRichRelevanceComponent: {
                        historyItems,
                        historyTitle,
                    },
                };
            })
            .catch(() => {
                return {
                    ExtraRichRelevanceComponent: {
                        historyItems: [],
                        historyTitle: "",
                    },
                };
            });
    }
    function createPropsObject(tabsObject) {
        let _props: any = {};

        // for wishlist
        if ("ExtraWishlistComponent" in tabsObject) {
            _props = Object.assign(
                {},
                _props,
                tabsObject.ExtraWishlistComponent,
            );
        }

        // for history
        if ("ExtraRichRelevanceComponent" in tabsObject) {
            _props = Object.assign(
                {},
                _props,
                tabsObject.ExtraRichRelevanceComponent,
            );
        }

        // for common
        _props.mainTitle = metaData.title || "";

        props = _props;
        return _props;
    }
</script>

{#if !failedToLoad}
    <section class="tab-component-container">
        {#if loaded}
            <RecentlyViewed {...props} />
        {:else}
            <section class="skeleton-container px48 py80">
                <h2 class="skeleton-item w-25">&nbsp;</h2>
                <section class="tabs">&nbsp;</section>
                <section class="tiles">
                    <section class="skeleton-tile skeleton-item"></section>
                    <section class="skeleton-tile skeleton-item"></section>
                    <section class="skeleton-tile skeleton-item"></section>
                    <section class="skeleton-tile skeleton-item"></section>
                </section>
            </section>
        {/if}
    </section>
{/if}

<style lang="scss">
    @import "../styles/colors.new.scss";

    .skeleton-container {
        h2 {
            line-height: 40px;
            margin: 0;
        }
        .tabs {
            height: 48px;
        }
        .tiles {
            display: flex;
            gap: 8px;
            margin-top: 16px;

            @include desktop-min-width {
                margin-top: 40px;
                gap: 24px;
            }
            .skeleton-tile {
                width: 170px;
                height: 204px;
                border-radius: 8px;

                @include desktop-min-width {
                    width: 300px;
                    height: 357px;
                }
            }
        }
    }
</style>
