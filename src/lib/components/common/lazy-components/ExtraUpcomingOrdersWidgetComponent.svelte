<script lang="ts">
    import { getAppConfig } from "../../../common/config/app-config";
    import { getContextedUrl, isMobileWidth } from "../../../common/util";
    import { getLatestOrdersByCountAsync } from "../../home/services/home-data-services";
    import Icon from "../components/Icon.svelte";
    import PictureTag from "./PictureTag.svelte";

    const { userId, lang } = getAppConfig();

    export let metaData;
    export function onLoad() {
        if (lang === "ar") {
            chevronGlyphName = "chevron_left";
        }
        const isLoggedInUser = userId.length > 0;

        if (!isLoggedInUser) {
            hasAnyUpcomingOrders = false;
            return false; // hide the component
        }

        const { orderCount } = metaData;
        return getLatestOrdersByCountAsync(orderCount)
            .then((res) => res.upcomingOrderList || [])
            .then(
                (upcomingOrderListData) =>
                    (upcomingOrderList = upcomingOrderListData),
            )
            .then((list) => {
                loaded = list.length > 0;
                hasAnyUpcomingOrders = loaded;
                return loaded;
            });
    }

    let loaded = false;
    let hasAnyUpcomingOrders = userId?.length > 0;
    let upcomingOrderList = [];
    let chevronGlyphName = "chevron_right";
    $: isResponsive = isMobileWidth();
</script>

{#if hasAnyUpcomingOrders}
    <section class="upcoming-order-container px48 py80">
        <section class="left">
            {#if loaded}
                <h2>{metaData?.title}</h2>
                {#if !isResponsive}
                    <a
                        class="view-all-link"
                        href={getContextedUrl(metaData?.displayOrdersLink.url)}
                    >
                        {metaData?.displayOrdersLink.linkName}
                        <Icon glyph={chevronGlyphName} size={16} />
                    </a>
                {/if}
            {/if}
        </section>
        <section class="right">
            {#if loaded}
                {#each upcomingOrderList as upcomingOrder}
                    <section class="upcoming-order-item">
                        <section class="order-product-images-container">
                            {#each upcomingOrder.productList as product}
                                <section class="product-image">
                                    <PictureTag
                                        image={product.amplienceProductBaseUrl}
                                        height="64px"
                                    />
                                </section>
                            {/each}
                            {#if upcomingOrder.remainingEntriesCount > 0}
                                <div class="remaining-entries-count">
                                    +{upcomingOrder.remainingEntriesCount}
                                </div>
                            {/if}
                        </section>
                        <h4>{@html upcomingOrder.estimatedArrivalMessage}</h4>
                        <div class="status-tag">
                            {upcomingOrder.orderStatus}
                        </div>
                    </section>
                {/each}
            {:else}
                <section class="upcoming-order-item skeleton-item"></section>
                <section class="upcoming-order-item skeleton-item"></section>
            {/if}
        </section>
        {#if isResponsive}
            <a
                class="view-all-link"
                href={getContextedUrl(metaData?.displayOrdersLink.url)}
            >
                {metaData?.displayOrdersLink.linkName}
                <Icon glyph={chevronGlyphName} size={16} />
            </a>
        {/if}
    </section>
{/if}

<style lang="scss">
    @import "../styles/colors.new.scss";

    .upcoming-order-container {
        display: flex;
        gap: 20px;
        align-items: center;
        @include responsive {
            display: inherit;
        }
        .view-all-link {
            font-size: 14px;
            font-weight: 500;
            line-height: 16px;
            color: $icon-only-icon-blue;
            display: flex;
            align-items: center;
            gap: 4px;
            @include responsive {
                margin-top: 10px;
            }
        }
        .left {
            flex: 0 0 265px;

            h2 {
                font-size: 36px;
                font-weight: 700;
                line-height: 40px;
                color: $primary-black;
                margin-block: 0 16px;
            }
        }
        .right {
            flex: 1 0 50%;
            display: flex;
            gap: 12px;
            @include responsive {
                overflow-x: scroll;
                scrollbar-width: none;
            }
            .upcoming-order-item {
                padding: 8px;
                min-width: 260px;
                border: 1px solid $secondary-gray-02;
                border-radius: 12px;

                &.skeleton-item {
                    height: 131px;
                }
                .order-product-images-container {
                    display: flex;
                    align-items: center;
                    gap: 4px;

                    .product-image {
                        aspect-ratio: 1;
                        height: 64px;
                        text-align: center;
                    }
                    .remaining-entries-count {
                        border-radius: 20px;
                        padding: 5px;
                        aspect-ratio: 1;
                        width: 24px;
                        text-align: center;
                        background-color: $neutral-light-03;
                        color: $neutral-dark-04;
                        font-size: 10px;
                        font-weight: 500;
                        line-height: 14px;
                    }
                }

                h4 {
                    color: $neutral-dark-01;
                    font-size: 14px;
                    font-weight: 400;
                    line-height: 16px;
                    margin-block: 8px 4px;
                }
                .status-tag {
                    border: 1px solid $functional-green-01;
                    border-radius: 5px;
                    padding: 4px 8px;
                    color: $functional-green-01;
                    font-size: 10px;
                    font-weight: 700;
                    line-height: 12px;
                    text-transform: uppercase;
                    display: inline-block;
                }
            }
        }
    }
</style>
