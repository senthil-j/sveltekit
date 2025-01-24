<script lang="ts">
    import { fade } from "svelte/transition";
    import { isMobile } from "../../../common/util";
    import { brandGtmFilterEvent } from "../../brand/services/brand-data-services";
    import {
        OPTION_ATTRIBUTES_TO_RETRIEVE,
        OPTION_FILTERS,
        OPTION_HITS_PER_PAGE,
        getProductsByUrlFromAlgoliaAsync,
    } from "../../common/services/algolia";
    import { getCMSComponentsFromHybrisAsync } from "../../common/services/hybris";
    import { getTestFreaksReviewCommentsForProductIdAsync } from "../../common/services/test-freaks";
    import CategoryButtons from "./child-helpers/CategoryButtons.svelte";
    import ExtraBrandProductReviewsTile from "./child-helpers/ExtraBrandProductReviewsTile.svelte";

    export let metaData;
    export function onLoad() {
        const categoryCMSLinks = metaData?.cmsLinks?.split(" ") || [];

        return (
            categoryCMSLinks.length > 0 &&
            getCMSComponentsFromHybrisAsync(categoryCMSLinks)
                .then((res) => res.component)
                .then((categoryListData) => (categoryList = categoryListData))
                .then(() => (loaded = categoryList?.length > 0))
        );
    }

    let loaded = false;
    let categoryList = [];
    let categoryDataCache = {};
    let activeCategoryData = null;
    let isResponsive = isMobile();

    function setActiveCategoryDataAsync(categoryItem: any) {
        activeCategoryData = null;
        if (categoryItem.uid in categoryDataCache) {
            // data is present in cache, load directly
            setTimeout(() => {
                activeCategoryData = categoryDataCache[categoryItem.uid];
            });
        } else {
            const url = categoryItem.algoliaUrl || categoryItem.url;
            // data is not present, load from algolia + test-freaks
            getProductsFromAlgoliaUrlAsync(url)
                .then((res) => (res as any).hits)
                .then((hits) =>
                    mergeTestFreakDataIntoAlgoliaHitsAsync(hits, isResponsive),
                )
                .then((mergedHits) => {
                    categoryDataCache[categoryItem.uid] = mergedHits;
                    activeCategoryData = categoryDataCache[categoryItem.uid];
                });
        }
        brandGtmFilterEvent(categoryItem?.linkName, "");
    }

    function mergeTestFreakDataIntoAlgoliaHitsAsync(
        hits: any[],
        isResponsive = false,
    ) {
        const tfPromiseArray = hits.map((hit, index) => {
            const requireTestFreaksComments = isResponsive || index === 0;
            return getTestFreaksReviewCommentsForProductIdAsync(
                hit.productCode,
                requireTestFreaksComments ? 3 : 0,
            ).then((testFreakData) =>
                Object.assign({}, hit, { testFreakData }),
            );
        });

        return Promise.all(tfPromiseArray);
    }

    function getProductsFromAlgoliaUrlAsync(url: string) {
        return getProductsByUrlFromAlgoliaAsync(
            url,
            OPTION_ATTRIBUTES_TO_RETRIEVE([
                "productCode",
                "amplienceProductBaseUrl",
                "numberOfReviews",
                "rating",
                "nameEn",
                "nameAr",
                "price",
                "wasPrice",
                "priceValueDiscountPercentageFlag",
                "priceValueDiscount",
                "priceValueTasheel",
                "urlEn",
                "urlAr",
            ]),
            OPTION_HITS_PER_PAGE(3),
            OPTION_FILTERS("numberOfReviews>0"),
        );
    }
</script>

<section class="popular-products-container px48 py80">
    {#if loaded}
        <h2>{metaData?.title}</h2>
        <section class="category-list">
            <CategoryButtons
                {categoryList}
                initialSelectedIndex={0}
                propertyNameToDisplay="linkName"
                on:categorySelected={({ detail: categoryItem }) =>
                    setActiveCategoryDataAsync(categoryItem)}
            />
        </section>
        <section class="product-grid scrollbar-hidden">
            {#if activeCategoryData}
                {#each activeCategoryData as tileData, categoryTileIndex}
                    {@const isLargeTile =
                        !isResponsive && categoryTileIndex === 0}
                    <ExtraBrandProductReviewsTile {tileData} {isLargeTile} />
                {/each}
            {:else}
                <div class="product-grid-tile skeleton-item" in:fade></div>
                <div class="product-grid-tile skeleton-item" in:fade></div>
                <div class="product-grid-tile skeleton-item" in:fade></div>
            {/if}
        </section>
    {/if}
</section>

<style lang="scss">
    @import "../../common/styles/colors.new.scss";

    .popular-products-container {
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
        .product-grid {
            display: grid;
            grid-template-rows: 1fr;
            grid-template-columns: repeat(3, 285px);
            grid-template-areas: "product1 product2 product3";
            gap: 16px;
            overflow-x: auto;

            @include desktop-min-width {
                grid-template-rows: repeat(2, minmax(0, 1fr));
                grid-template-columns: repeat(2, minmax(0, 1fr));
                grid-template-areas:
                    "product1 product2"
                    "product1 product3";
                gap: 24px;
                height: 560px;
            }

            :global {
                .product-grid-tile:nth-child(1) {
                    grid-area: product1;
                }
                .product-grid-tile:nth-child(2) {
                    grid-area: product2;
                }
                .product-grid-tile:nth-child(3) {
                    grid-area: product3;
                }
            }
        }

        .product-grid-tile.skeleton-item {
            border-radius: 12px;

            @include desktop-min-width {
                border-radius: 20px;
            }
        }
    }
</style>
