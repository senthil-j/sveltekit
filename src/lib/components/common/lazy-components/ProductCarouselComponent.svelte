<script lang="ts">
    import { getAppConfig } from "../../../common/config/app-config";
    import {
        gtmViewListEvent,
        isValueSponsoredOrExtraSponsored,
    } from "../../../common/util";
    import RichRelavance from "../../home/component/RichRelavance.svelte";
    import viewport from "../components/useViewportAction";
    import {
        FILTER_IN_STOCK_CITY,
        OPTION_HITS_PER_PAGE,
        OPTION_FILTERS,
        getProductsByRuleContextFromAlgoliaAsync,
        getProductsFromAlgoliaAsync,
    } from "../services/algolia";
    import { getModifiedAlgoliaSingleHit } from "../services/rich-relevance";

    export let metaData;
    export function onLoad() {
        const {
            ruleName = "",
            productCodes = "",
            hitsPerPage = 10,
            showOutOfStockProducts = true,
            title = "",
        } = metaData;
        strategyMessage = title;

        // prepare queryParams for algolia call
        const queryParams = [];
        if (showOutOfStockProducts == "false") {
            // should not show OOS products, add an optional filter to include only
            // the products which are in stock for current city
            const { userDefaultCityCode, userSelectedCityCode } =
                getAppConfig();
            const cityCode = userSelectedCityCode || userDefaultCityCode;
            queryParams.push(OPTION_FILTERS(FILTER_IN_STOCK_CITY(cityCode)));
        }

        let dataPromise: Promise<any> = null;
        let productCodesArray: any[] = [];

        if (ruleName.length > 0) {
            // add hitsPerPage param only for ruleContexts
            queryParams.push(OPTION_HITS_PER_PAGE(hitsPerPage));
            dataPromise = getProductsByRuleContextFromAlgoliaAsync(
                ruleName,
                ...queryParams,
            );
        } else if (productCodes.length > 0) {
            productCodesArray = productCodes.split(" ");
            dataPromise = getProductsFromAlgoliaAsync(
                productCodesArray,
                ...queryParams,
            );
        }

        if (dataPromise !== null) {
            return dataPromise
                .then((res) => res.hits || [])
                .then((hits) =>
                    prepareAlgoliaHitsForComponent(hits, productCodesArray),
                )
                .then((preparedHits) => (hits = preparedHits))
                .then((hits) => {
                    loaded = hits.length > 0;
                    failedToLoad = !loaded;
                    return loaded;
                });
        }
        failedToLoad = true;
        return false; // if algolia call was not made, hide the component
    }

    function prepareAlgoliaHitsForComponent(
        hitsArray: any[],
        refProductCodesArrayForSorting: any[],
    ) {
        // refProductCodesArrayForSorting can be empty array, return original array in that case
        return hitsArray
            .map((h, i) => getModifiedAlgoliaSingleHit(h, i))
            .sort(sortOnReferenceArray(refProductCodesArrayForSorting));
    }

    function sortOnReferenceArray(refArray) {
        return (a, b) => refArray.indexOf(a.code) - refArray.indexOf(b.code);
    }

    /*
    new RichRelavanceSvelteComponent({
        target: target,
        props: {
            isProductCrousel: true,
            ProductCrouselData: {
                strategyMessage: carousalData.title,
                hits: carousalData.products
            },
            pageData: {
                display: true,
                key: 'svelte product carousal'
            }
        }
    });
    */

    let loaded = false;
    let failedToLoad = false;
    let hits = [];
    let strategyMessage: string = "";

    $: isSponsored =
        metaData && isValueSponsoredOrExtraSponsored(metaData.sponsoredType);
</script>

{#if !failedToLoad}
    <section
        class="product-carousel-container"
        use:viewport
        on:enterViewport={() => loaded && gtmViewListEvent(hits)}
    >
        {#if loaded}
            <RichRelavance
                {isSponsored}
                isProductCrousel={true}
                ProductCrouselData={{ strategyMessage, hits }}
                pageData={{
                    display: true,
                    key: metaData?.uid || "svelte-product-carousel",
                }}
            />
        {:else}
            <section class="skeleton-container px48 py80">
                <h2 class="skeleton-item w-25">&nbsp;</h2>
                <section class="skeleton-tiles">
                    <section class="skeleton-item" />
                    <section class="skeleton-item" />
                    <section class="skeleton-item" />
                    <section class="skeleton-item" />
                </section>
            </section>
        {/if}
    </section>
{/if}

<style lang="scss">
    h2.skeleton-item {
        margin: 0;
        line-height: 40px;
    }
    .skeleton-tiles {
        margin-top: 50px;
        display: flex;
        gap: 16px;
        .skeleton-item {
            width: 318px;
            height: 625px;
            border-radius: 24px;
        }
        .tabs {
            margin-block: 16px 8px;
        }
        .tab-skeleton {
            height: 36px;
            margin-right: 8px;
            display: inline-block;
        }
    }
</style>
