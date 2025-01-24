<script lang="ts">
    import {
        isMobile,
        isValueSponsoredOrExtraSponsored,
    } from "../../../common/util";
    import RecentlyViewed from "../../home/component/RecentlyViewed.svelte";
    import RecommendationsMain from "../../home/component/Recommendation/RecommendationsMain.svelte";
    import RichRelavance from "../../home/component/RichRelavance.svelte";
    import { getCMSComponentsFromHybrisAsync } from "../services/hybris";
    import {
        fetchAndMergeProductDataFromAlgoliaToRR,
        getRichRelevanceDataForPlacementIdAsync,
        makeDataComponentCompatible,
    } from "../services/rich-relevance";

    export let metaData;
    export function onLoad() {
        let onLoadPromise;
        if ("categoryRichRelevanceComponents" in metaData) {
            // fetch categories from hybris first
            const childUids =
                metaData.categoryRichRelevanceComponents.split(" ");
            onLoadPromise = processCategoryRRComponent(childUids);
        } else {
            onLoadPromise = Promise.resolve({});
        }

        return onLoadPromise
            .then((additionalParams) =>
                getRichRelevanceDataForPlacementIdAsync(
                    metaData.placementId,
                    additionalParams,
                ),
            )
            .then((res) => fetchAndMergeProductDataFromAlgoliaToRR(res))
            .then((rrAlgoliaMergedData) =>
                makeDataComponentCompatible(rrAlgoliaMergedData),
            )
            .then((rrAlgoliaMergedData) => {
                if (!rrAlgoliaMergedData) {
                    return false;
                }
                const targetIdWithoutHash =
                    rrAlgoliaMergedData.placement.replace(/\./g, "_");

                let resultForCard: string | boolean = true;
                // set the props required by the rr component
                switch (componentName) {
                    case "RichRelavance":
                        rrComponentMap[metaData.placementId].props = {
                            isProductCrousel: true,
                            isSponsored: isValueSponsoredOrExtraSponsored(
                                metaData?.sponsoredType,
                            ),
                            ProductCrouselData: rrAlgoliaMergedData,
                            pageData: {
                                display: true,
                                key: targetIdWithoutHash,
                            },
                            isRRComponent: true,
                        };
                        break;

                    case "RecommendationsMain":
                        const isLightThemed =
                            rrComponentMap[metaData.placementId].variant ===
                            "light";

                        // return 'dark' or 'light', so that the entire card can be styled in the parent lazy container
                        resultForCard =
                            rrComponentMap[metaData.placementId].variant;

                        // set the cache to avoid future algolia calls
                        categoryCacheMap[activeCategoryId] =
                            rrAlgoliaMergedData.hits;

                        const recommendationType = isLightThemed ? 1 : 2;
                        rrComponentMap[metaData.placementId].props = {
                            recommendationType,
                            productCategories: categories,
                            activeCategoryId,
                            productList: rrAlgoliaMergedData.hits,
                            message:
                                metaData.placementId ===
                                "category_page.category-top-sellers-widget"
                                    ? metaData.title
                                        ? metaData.title
                                        : rrAlgoliaMergedData.strategyMessage
                                    : rrAlgoliaMergedData.strategyMessage,
                            isSponsored: isValueSponsoredOrExtraSponsored(
                                metaData?.sponsoredType,
                            ),
                        };
                        break;

                    case "RecentlyViewed":
                        rrComponentMap[metaData.placementId].props = {
                            historyItems: rrAlgoliaMergedData.hits,
                            wishlistItems: [],
                            mainTitle: rrAlgoliaMergedData.strategyMessage,
                            showTabs: false,
                        };
                        break;
                }

                return resultForCard;
            })
            .then((shouldLoadComponent) => {
                loaded = shouldLoadComponent;
                failedToLoad = !loaded;
                return shouldLoadComponent;
            })
            .catch(() => {
                loaded = false;
                failedToLoad = true;
            });
    }

    let categories = []; // only used for category rr component
    let categoryCacheMap = {};
    let activeCategoryId: string | number = -1; // only used for category rr component
    let loaded = false;
    let failedToLoad = false;

    $: componentName =
        (metaData?.placementId &&
            rrComponentMap[metaData.placementId]?.componentName) ||
        "";
    $: isResponsive = isMobile();

    const rrComponentMap = {
        "home_page.rank1": {
            componentName: "RichRelavance",
            component: RichRelavance,
        },
        "home_page.rank2": {
            componentName: "RichRelavance",
            component: RichRelavance,
        },
        "home_page.rank3": {
            componentName: "RichRelavance",
            component: RichRelavance,
        },
        "home_page.history": {
            componentName: "RecentlyViewed",
            component: RecentlyViewed,
        },
        "home_page.best-selling-widget": {
            componentName: "RecommendationsMain",
            component: RecommendationsMain,
            variant: "light",
        },
        "home_page.category-top-sellers-widget": {
            componentName: "RecommendationsMain",
            component: RecommendationsMain,
            variant: "dark",
        },
        "category_page.category-top-sellers-widget": {
            componentName: "RecommendationsMain",
            component: RecommendationsMain,
            variant: "dark",
        },
        "add_to_cart_page.rank1": {
            componentName: "RichRelavance",
            component: RichRelavance,
        },
    };

    function processCategoryRRComponent(categoryUids: string[]) {
        return getCMSComponentsFromHybrisAsync(categoryUids)
            .then((res) => res.component)
            .then((components) => {
                categories = components.map(
                    ({ categoryCode: id, title: label }) =>
                        Object.create({ id, label }),
                );
                if (categories?.length > 0) {
                    activeCategoryId = categories[0].id;
                    return { chi: activeCategoryId };
                } else {
                    return {};
                }
            });
    }

    function categoryChangeHandler(newCategoryId: string) {
        activeCategoryId = newCategoryId;

        if (newCategoryId in categoryCacheMap) {
            // load data from cache
            rrComponentMap[metaData.placementId].props = Object.assign(
                {},
                rrComponentMap[metaData.placementId].props,
                {
                    productList: categoryCacheMap[newCategoryId],
                    activeCategoryId,
                },
            );
        } else {
            // current category is not yet cached, fetch and cache
            getRichRelevanceDataForPlacementIdAsync(
                metaData.placementId,
                { chi: newCategoryId },
                false,
            )
                .then((res) => fetchAndMergeProductDataFromAlgoliaToRR(res))
                .then((rrAlgoliaMergedData) =>
                    makeDataComponentCompatible(rrAlgoliaMergedData),
                )
                .then((rrAlgoliaMergedData) => {
                    const hits = rrAlgoliaMergedData?.hits || null;
                    categoryCacheMap[activeCategoryId] = hits;

                    rrComponentMap[metaData.placementId].props = Object.assign(
                        {},
                        rrComponentMap[metaData.placementId].props,
                        {
                            productList: hits,
                            activeCategoryId,
                        },
                    );
                })
                .catch((err) => {
                    const hits = null;
                    categoryCacheMap[activeCategoryId] = hits;

                    rrComponentMap[metaData.placementId].props = Object.assign(
                        {},
                        rrComponentMap[metaData.placementId].props,
                        {
                            productList: hits,
                            activeCategoryId,
                        },
                    );
                });
        }
    }
</script>

{#if !failedToLoad}
    <section
        class="rich-relevance-container"
        data-placement-id={metaData?.placementId}
    >
        {#if loaded}
            {@const rrCompData = rrComponentMap[metaData.placementId]}
            <svelte:component
                this={rrCompData.component}
                {...rrCompData.props}
                on:categoryChange={(e) => categoryChangeHandler(e.detail)}
            />
        {:else}
            <section class="skeleton-container px48 py80">
                {#if componentName === "RichRelavance"}
                    <h2 class="skeleton-item w-25" class:w-50={isResponsive}>
                        &nbsp;
                    </h2>
                    <section class="skeleton-tiles">
                        <section class="skeleton-item" />
                        <section class="skeleton-item" />
                        <section class="skeleton-item" />
                        <section class="skeleton-item" />
                    </section>
                {:else if componentName === "RecommendationsMain"}
                    <h2 class="skeleton-item w-25">&nbsp;</h2>
                    <section class="tabs skeleton-container">
                        <span class="tab-skeleton skeleton-item w-10"
                            >&nbsp;</span
                        >
                        <span class="tab-skeleton skeleton-item w-10"
                            >&nbsp;</span
                        >
                    </section>
                    <section class="skeleton-tiles">
                        <section class="skeleton-item" />
                        <section class="skeleton-item" />
                        <section class="skeleton-item" />
                        <section class="skeleton-item" />
                    </section>
                {/if}
            </section>
        {/if}
    </section>
{/if}

<style lang="scss">
    @import "../styles/colors.new.scss";

    h2.skeleton-item {
        margin: 0;
        line-height: 22px;

        @include desktop-min-width {
            line-height: 40px;
        }
    }
    .skeleton-tiles {
        margin-top: 20px;
        display: flex;
        gap: 8px;

        @include desktop-min-width {
            gap: 16px;
            margin-top: 50px;
        }
        .skeleton-item {
            width: 170px;
            height: 386px;
            border-radius: 12px;

            @include desktop-min-width {
                width: 300px;
                height: 569px;
                border-radius: 24px;
            }
        }
    }
    .tabs.skeleton-container {
        margin-block: 16px 0;

        @include desktop-min-width {
            margin-block: 16px 8px;
        }
    }
    .tab-skeleton {
        margin-right: 8px;
        display: inline-block;
        min-width: 100px;
        line-height: 16px;
        padding: 12px;

        @include desktop-min-width {
            height: 36px;
        }
    }
</style>
