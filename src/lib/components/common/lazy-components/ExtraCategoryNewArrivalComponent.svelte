<script lang="ts">
    import { fade } from "svelte/transition";
    import type { SwiperOptions } from "swiper/types";
    import { getAppConfig } from "../../../common/config/app-config";
    import { getContextedUrl, isMobile } from "../../../common/util";
    import ExtraProductTileSlideTemplate from "../components/ExtraProductTileSlideTemplate.svelte";
    import ExtraSwiper from "../components/ExtraSwiper.svelte";
    import viewport from "../components/useViewportAction";
    import {
        OPTION_FILTERS_CATEGORY_FILTER,
        OPTION_HITS_PER_PAGE,
        OPTION_NUMERIC_FILTER,
        composeSingleProductQueryForAlgolia,
        getProductsByMultiQueriesFromAlgoliaAsync,
    } from "../services/algolia";
    import { getCMSComponentsFromHybrisAsync } from "../services/hybris";
    import CategoryButtons from "./child-helpers/CategoryButtons.svelte";

    export let metaData;
    export function onLoad() {
        const { capsules, viewAllLink } = metaData;
        const minArrivalValue = +metaData?.minArrivalValue;
        const maxArrivalValue = +metaData?.maxArrivalValue;

        viewAllLinkObject = viewAllLink;
        categoryCode = getCategoryCodeFromViewAllLinkObject(viewAllLinkObject);

        const capsuleArray = capsules.split(" ");

        return getCMSComponentsFromHybrisAsync(capsuleArray)
            .then((res) => res.component)
            .then((capsuleArray) =>
                getCapsuleListDataFromAlgoliaAsync(capsuleArray),
            )
            .then((capsuleData) => {
                loaded = capsuleData.some((c) => !!c.visible);
                failedToLoad = !loaded;
                return loaded;
            })
            .catch(() => {
                failedToLoad = true;
                return false;
            });
    }
    function onViewSlider(productData) {
        if (productData.length > 0) {
            window["ACC"].extragtm.click.trackViewList("", "", productData);
        }
    }
    function getCapsuleListDataFromAlgoliaAsync(capsuleListInput: any[]) {
        return getProductsByMultiQueriesFromAlgoliaAsync(
            capsuleListInput.map((c) =>
                composeSingleProductQueryForAlgolia(
                    "*",
                    OPTION_FILTERS_CATEGORY_FILTER(categoryCode),
                    OPTION_HITS_PER_PAGE(10),
                    OPTION_NUMERIC_FILTER(
                        `newArrivalOffset:${c.minArrivalValue} TO ${c.maxArrivalValue}`,
                    ),
                ),
            ),
        ).then((results: any) => {
            categoryListWithAlgoliaResults = (results as any[]).map(
                (algoliaResult, i) =>
                    Object.assign(
                        {
                            algoliaResult,
                            visible: algoliaResult.hits.length > 0,
                        },
                        { ...capsuleListInput[i] },
                    ),
            );
            return categoryListWithAlgoliaResults;
        });
    }

    function setActiveCategoryData(categoryItem) {
        activeCategoryData = categoryItem;
        console.log("New arrivals category data change :::", categoryItem);
    }

    function getCategoryCodeFromViewAllLinkObject(linkObject: any) {
        const { url } = linkObject;
        const urlObject = new URL(url, "https://extra.com");
        const { pathname } = urlObject;
        if (pathname.includes("/c/")) {
            return pathname.split("/c/")[1].split("/")[0];
        }
        return null;
    }

    const { encodedContextPath } = getAppConfig();

    let failedToLoad = false;
    let loaded = false;
    let categoryCode;
    let categoryListWithAlgoliaResults = [];
    let activeCategoryData = null;
    let viewAllLinkObject = null;
    let isResponsive = isMobile();

    $: componentTitle = metaData?.title || "";
    $: viewAllLinkName = viewAllLinkObject?.linkName || "";
    $: productTileSwiperOptions = getSwiperOptions();

    function getSwiperOptions(): SwiperOptions {
        return {
            slidesPerView: "auto",
            navigation: isResponsive ? false : true,
            spaceBetween: 16,
        };
    }
</script>

{#if !failedToLoad}
    <section
        class="category-new-arrival-container px48 py80"
        use:viewport
        on:enterViewport={() =>
            loaded && onViewSlider(activeCategoryData.algoliaResult.hits)}
    >
        {#if loaded}
            <section class="header-wrapper">
                <h2>{componentTitle}</h2>
                {#if !isResponsive && viewAllLinkName.length > 0}
                    <a
                        class="view-all-link"
                        href={getContextedUrl(viewAllLinkObject?.url)}
                        >{viewAllLinkName}</a
                    >
                {/if}
            </section>
            <section class="category-list">
                <CategoryButtons
                    categoryList={categoryListWithAlgoliaResults.filter(
                        (c) => c.visible,
                    )}
                    initialSelectedIndex={0}
                    propertyNameToDisplay="label"
                    on:categorySelected={({ detail: categoryItem }) =>
                        setActiveCategoryData(categoryItem)}
                />
            </section>
            <section class="product-list">
                {#if activeCategoryData}
                    <ExtraSwiper
                        slidesData={activeCategoryData.algoliaResult.hits}
                        slideTemplate={ExtraProductTileSlideTemplate}
                        swiperOptions={productTileSwiperOptions}
                    />
                {:else}
                    <div class="product-list-item skeleton-item" in:fade></div>
                    <div class="product-list-item skeleton-item" in:fade></div>
                    <div class="product-list-item skeleton-item" in:fade></div>
                {/if}
            </section>
            {#if isResponsive}
                <section class="footer-wrapper">
                    <a
                        class="view-all-link"
                        href={getContextedUrl(viewAllLinkObject?.url)}
                        >{viewAllLinkObject?.linkName}</a
                    >
                </section>
            {/if}
        {:else}
            <div class="product-list-item skeleton-item" in:fade></div>
            <div class="product-list-item skeleton-item" in:fade></div>
            <div class="product-list-item skeleton-item" in:fade></div>
        {/if}
    </section>
{/if}

<style lang="scss">
    @import "../../common/styles/colors.new.scss";

    .header-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
    }
    .view-all-link {
        font-size: 14px;
        font-weight: 700;
        color: $primary-blue;
        border: 1px solid $primary-blue;
        border-radius: 100px;
        padding: 10px 24px;
    }
    .footer-wrapper {
        display: flex;
        justify-content: stretch;
        margin-top: 20px;

        .view-all-link {
            flex-grow: 1;
            text-align: center;
        }
    }
    .category-new-arrival-container {
        h2 {
            font-size: 20px;
            font-weight: 700;
            line-height: 22px;
            color: $neutral-dark-01;
            margin-block: 0;

            @include desktop-min-width {
                font-size: 36px;
                line-height: 40px;
            }
        }
        .category-list {
            margin-block: 20px;

            @include desktop-min-width {
                margin-block: 20px 46px;
            }
        }

        .product-list-item.skeleton-item {
            border-radius: 12px;
            width: 170px;
            height: 322px;
            display: inline-block;
            margin-right: 8px;

            @include desktop-min-width {
                border-radius: 20px;
                width: 318px;
                height: 490px;
                margin-right: 16px;
            }
        }
    }
</style>
