<script lang="ts">
    import {
        gtmViewListEvent,
        isMobile,
        isValueSponsoredOrExtraSponsored,
    } from "../../../common/util";
    import RichRelavance from "../../home/component/RichRelavance.svelte";
    import { getDealsProductsAsync } from "../../home/services/home-data-services";
    import viewport from "../components/useViewportAction";

    export let metaData;
    export function onLoad() {
        return getDealsProductsAsync(metaData?.uid)
            .then(
                (res) =>
                    res?.dealProducts?.filter(
                        (x) => x.stock?.stockLevelStatus !== "outOfStock",
                    ) || [],
            )
            .then((dealProducts) => createPropsObject(dealProducts))
            .then((props) => {
                loaded = props.ProductCrouselData.hits.length > 0;
                failedToLoad = !loaded;
                return loaded;
            })
            .catch(() => {
                loaded = false;
                failedToLoad = true;
            });
    }

    let loaded = false;
    let failedToLoad = false;
    let props: any = {};
    let isResponsive = isMobile();

    $: isSponsored =
        metaData && isValueSponsoredOrExtraSponsored(metaData.sponsoredType);

    function createPropsObject(dealProducts) {
        const strategyMessage = metaData?.componentTitle;
        const subtitle = metaData?.description;
        const targetIdWithoutHash = "extra-deals-products-component";

        if (dealProducts?.length > 0) {
            dealProducts = dealProducts.map((dp) =>
                Object.assign({}, dp, {
                    priceValueTasheel: dp.priceValueTasheel?.value,
                    wasPrice: dp.price?.value,
                }),
            );
        }

        const _props = {
            isProductCrousel: true,
            ProductCrouselData: {
                hits: dealProducts,
                strategyMessage,
                subtitle,
            },
            pageData: {
                display: true,
                key: targetIdWithoutHash,
            },
        };

        props = _props;
        return _props;
    }
</script>

{#if !failedToLoad}
    <section
        class="deal-products-container"
        use:viewport
        on:enterViewport={() =>
            loaded && gtmViewListEvent(props.ProductCrouselData.hits)}
    >
        {#if loaded}
            <RichRelavance {isSponsored} {...props} />
        {:else}
            <section class="skeleton-container px48 py80">
                <h2 class="skeleton-item w-25" class:w-50={isResponsive}>
                    &nbsp;
                </h2>
                <p class="skeleton-item w-10" class:w-25={isResponsive}>
                    &nbsp;
                </p>
                <section class="skeleton-tiles">
                    <section class="skeleton-item"></section>
                    <section class="skeleton-item"></section>
                    <section class="skeleton-item"></section>
                    <section class="skeleton-item"></section>
                </section>
            </section>
        {/if}
    </section>
{/if}

<style lang="scss">
    @import "../styles/colors.new.scss";

    .deal-products-container {
        margin-inline: -16px;

        @include desktop-min-width {
            margin-inline: -48px;
        }
    }
    h2.skeleton-item {
        margin: 0;
        line-height: 22px;

        @include desktop-min-width {
            line-height: 40px;
        }
    }
    p.skeleton-item {
        margin-block: 4px 20px;
        line-height: 16px;

        @include desktop-min-width {
            line-height: 20px;
            margin-block: 8px 20px;
        }
    }
    .skeleton-tiles {
        display: flex;
        gap: 4px;

        @include desktop-min-width {
            gap: 16px;
        }
        .skeleton-item {
            width: 170px;
            height: 322px;
            border-radius: 24px;

            @include desktop-min-width {
                width: 300px;
                height: 478px;
            }
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
