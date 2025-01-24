<script lang="ts">
    import { fade } from "svelte/transition";
    import ExtraCartItemsCarouselComponent from "./ExtraCartItemsCarouselComponent.svelte";
    import { getCartItemDetailsByCountAsync } from "../../home/services/home-data-services";
    import { getAppConfig } from "../../../common/config/app-config";
    import {
        formatNumber,
        getContextedUrl,
        isDirectionRTL,
        isMobile,
        roundToAtMax2Digits,
    } from "../../../common/util";
    import Text from "../components/Text.svelte";

    export let metaData;
    const isRTL = isDirectionRTL();

    export function onLoad() {
        // add local listener for global event "qacCartResponseChange"
        window.removeEventListener(
            window.ACC?.qac?.var.QAC_RESPONSE_DATA_LIST_CHANGE_EVENT_NAME,
            onQACCartResponseChange,
        );
        window.addEventListener(
            window.ACC?.qac?.var.QAC_RESPONSE_DATA_LIST_CHANGE_EVENT_NAME,
            onQACCartResponseChange,
        );

        return reloadProductsAddedInCart();
    }

    function onQACCartResponseChange() {
        reloadProductsAddedInCart();
    }
    function reloadProductsAddedInCart() {
        loaded = false;
        failedToLoad = false;

        return getCartItemDetailsByCountAsync(MAX_PRODUCTS_TO_DISPLAY)
            .then((res) => (cartDetails = res))
            .then((r) => {
                loaded = "cartData" in r && r.cartData !== null;
                failedToLoad = !loaded;
                return loaded;
            });
    }

    const MAX_PRODUCTS_TO_DISPLAY = 4;
    const { currency, countryCode } = getAppConfig();
    let cartDetails = null;
    let loaded = false;
    let failedToLoad = false;

    $: isResponsive = isMobile();
    $: cartData = cartDetails?.cartData;
    $: description =
        (cartData &&
            metaData?.description?.replace("{0}", cartDetails.productsCount)) ||
        "";

    $: hasPriceDiscounts =
        cartData?.totalPrice?.value !==
            cartData?.cartSummary?.subTotalWithoutDiscounts?.value &&
        cartData?.totalDiscounts?.value > 0;

    $: discountPercent =
        hasPriceDiscounts &&
        roundToAtMax2Digits(
            (cartData?.totalDiscounts?.value * 100) /
                cartData?.cartSummary?.subTotalWithoutDiscounts?.value,
        );
    $: productEntries = populateProductArray(cartData);

    function populateProductArray(cartData: any) {
        return cartData?.entries;
    }
</script>

{#if !failedToLoad}
    {#if countryCode === "OM"}
        {#if discountPercent >= (cartData && cartData?.percentageDiscountDisplayCutoff)}
            <section class="extra-cart-items-container px48 py80">
                {#if loaded}
                    <section class="left-info" in:fade>
                        <h2>{metaData?.title}</h2>
                        <p>{description}</p>
                        {#if isResponsive}
                            <section class="right-products" in:fade>
                                <ExtraCartItemsCarouselComponent
                                    cartEntries={productEntries}
                                    totalProductsToDisplay={MAX_PRODUCTS_TO_DISPLAY}
                                    countClickUrl={metaData?.link2?.url}
                                />
                            </section>
                        {/if}
                        <section class="price-section">
                            <p class="price current-price" class:rtl={isRTL}>
                                {currency}
                                <strong
                                    >{formatNumber(
                                        cartData?.totalPrice?.value,
                                    )}</strong
                                >
                            </p>
                            {#if hasPriceDiscounts}
                                <section class="old-and-discount">
                                    <p class="old-price">
                                        {cartData?.cartSummary
                                            ?.subTotalWithoutDiscounts?.value}
                                    </p>
                                    {#if !isResponsive}
                                        <section class="discount-percent">
                                            {discountPercent}% <Text
                                                key="product.pourcentageDiscount.off"
                                            />
                                        </section>
                                    {/if}
                                </section>
                            {/if}
                        </section>
                        <section class="actions">
                            <a
                                href={getContextedUrl(metaData?.link1?.url)}
                                id="checkout"
                                class="c_button c_button--primary"
                            >
                                {metaData?.link1?.linkName}
                            </a>
                            <a
                                href={getContextedUrl(metaData?.link2?.url)}
                                id="GOTOCart"
                                class="c_button c_button--primary--outlined"
                            >
                                {metaData?.link2?.linkName}
                            </a>
                        </section>
                    </section>
                    {#if !isResponsive}
                        <section class="right-products" in:fade>
                            <ExtraCartItemsCarouselComponent
                                cartEntries={productEntries}
                                totalProductsToDisplay={MAX_PRODUCTS_TO_DISPLAY}
                                countClickUrl={metaData?.link2?.url}
                            />
                        </section>
                    {/if}
                {:else}
                    <section class="left-info skeleton-container">
                        <h2
                            class="skeleton-item w-100"
                            class:w-75={isResponsive}
                        >
                            &nbsp;
                        </h2>
                        <p class="skeleton-item w-75" class:w-50={isResponsive}>
                            &nbsp;
                        </p>
                        {#if isResponsive}
                            <section class="right-products" in:fade>
                                <div
                                    class="cart-product-tile skeleton-item"
                                ></div>
                            </section>
                        {/if}
                        <section
                            class="price-section"
                            class:w-100={isResponsive}
                        >
                            <p class="price current-price skeleton-item w-25">
                                &nbsp;
                            </p>
                            <section class="old-and-discount">
                                <p class="old-price skeleton-item w-25">
                                    &nbsp;
                                </p>
                            </section>
                        </section>
                        <section class="actions" class:w-100={isResponsive}>
                            <div
                                class="c_button c_button--primary skeleton-item"
                            >
                                &nbsp;
                            </div>
                            <div
                                class="c_button c_button--primary--outlined skeleton-item"
                            >
                                &nbsp;
                            </div>
                        </section>
                    </section>
                    {#if !isResponsive}
                        <section class="right-products skeleton-container">
                            <div class="cart-product-tile skeleton-item"></div>
                            <div class="cart-product-tile skeleton-item"></div>
                            <div class="cart-product-tile skeleton-item"></div>
                            <div class="cart-product-tile skeleton-item"></div>
                        </section>
                    {/if}
                {/if}
            </section>
        {/if}
    {:else}
        <section class="extra-cart-items-container px48 py80">
            {#if loaded}
                <section class="left-info" in:fade>
                    <h2>{metaData?.title}</h2>
                    <p>{description}</p>
                    {#if isResponsive}
                        <section class="right-products" in:fade>
                            <ExtraCartItemsCarouselComponent
                                cartEntries={productEntries}
                                totalProductsToDisplay={MAX_PRODUCTS_TO_DISPLAY}
                                countClickUrl={metaData?.link2?.url}
                            />
                        </section>
                    {/if}
                    <section class="price-section">
                        <p class="price current-price" class:rtl={isRTL}>
                            {currency}
                            <strong
                                >{formatNumber(
                                    cartData?.totalPrice?.value,
                                )}</strong
                            >
                        </p>
                        {#if hasPriceDiscounts}
                            <section class="old-and-discount">
                                <p class="old-price">
                                    {cartData?.cartSummary
                                        ?.subTotalWithoutDiscounts?.value}
                                </p>
                                <section class="discount-percent">
                                    {discountPercent}% <Text
                                        key="product.pourcentageDiscount.off"
                                    />
                                </section>
                            </section>
                        {/if}
                    </section>
                    <section class="actions">
                        <a
                            href={getContextedUrl(metaData?.link1?.url)}
                            id="checkout"
                            class="c_button c_button--primary"
                        >
                            {metaData?.link1?.linkName}
                        </a>
                        <a
                            href={getContextedUrl(metaData?.link2?.url)}
                            id="GOTOCart"
                            class="c_button c_button--primary--outlined"
                        >
                            {metaData?.link2?.linkName}
                        </a>
                    </section>
                </section>
                {#if !isResponsive}
                    <section class="right-products" in:fade>
                        <ExtraCartItemsCarouselComponent
                            cartEntries={productEntries}
                            totalProductsToDisplay={MAX_PRODUCTS_TO_DISPLAY}
                            countClickUrl={metaData?.link2?.url}
                        />
                    </section>
                {/if}
            {:else}
                <section class="left-info skeleton-container">
                    <h2 class="skeleton-item w-100" class:w-75={isResponsive}>
                        &nbsp;
                    </h2>
                    <p class="skeleton-item w-75" class:w-50={isResponsive}>
                        &nbsp;
                    </p>
                    {#if isResponsive}
                        <section class="right-products" in:fade>
                            <div class="cart-product-tile skeleton-item"></div>
                        </section>
                    {/if}
                    <section class="price-section" class:w-100={isResponsive}>
                        <p class="price current-price skeleton-item w-25">
                            &nbsp;
                        </p>
                        <section class="old-and-discount">
                            <p class="old-price skeleton-item w-25">&nbsp;</p>
                        </section>
                    </section>
                    <section class="actions" class:w-100={isResponsive}>
                        <div class="c_button c_button--primary skeleton-item">
                            &nbsp;
                        </div>
                        <div
                            class="c_button c_button--primary--outlined skeleton-item"
                        >
                            &nbsp;
                        </div>
                    </section>
                </section>
                {#if !isResponsive}
                    <section class="right-products skeleton-container">
                        <div class="cart-product-tile skeleton-item"></div>
                        <div class="cart-product-tile skeleton-item"></div>
                        <div class="cart-product-tile skeleton-item"></div>
                        <div class="cart-product-tile skeleton-item"></div>
                    </section>
                {/if}
            {/if}
        </section>
    {/if}
{/if}

<style lang="scss">
    @import "../styles/colors.new.scss";

    .extra-cart-items-container {
        display: flex;
        gap: 48px;
        justify-content: center;

        @include desktop-min-width {
            justify-content: flex-start;
        }

        .left-info {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            flex-grow: 1;
            max-width: 100%;

            @include desktop-min-width {
                width: 280px;
                align-items: flex-start;
                flex-grow: 0;
            }
            h2 {
                font-size: 20px;
                font-weight: 700;
                line-height: 22px;
                color: $primary-black;
                margin-block: 0 4px;
                text-align: center;

                @include desktop-min-width {
                    font-size: 36px;
                    line-height: 40px;
                    margin-block: 0 8px;
                    text-align: start;
                }
            }
            p {
                font-size: 14px;
                font-weight: 400;
                line-height: 16px;
                margin-block: 0 16px;
                color: $neutral-dark-01;
                text-align: center;

                @include desktop-min-width {
                    font-size: 18px;
                    line-height: 20px;
                    margin-block: 0 30px;
                    text-align: start;
                }
            }
            .price-section {
                display: flex;
                flex-direction: row;
                gap: 4px;
                justify-content: center;
                margin-top: 16px;

                @include desktop-min-width {
                    flex-direction: column;
                    justify-content: flex-start;
                    margin-top: 0;
                }

                .current-price {
                    margin: 0;
                    &.rtl {
                        display: flex;
                        flex-direction: row-reverse;
                    }
                }
                .old-and-discount {
                    display: flex;
                    gap: 4px;
                    align-items: center;
                }
                .old-price {
                    font-size: 11px;
                    font-weight: 400;
                    line-height: 12px;
                    margin-block: 0;
                    color: $neutral-dark-03;
                    text-decoration: line-through;

                    @include desktop-min-width {
                        font-size: 12px;
                        line-height: 14px;
                    }
                }
            }
            .actions {
                display: flex;
                flex-direction: column;
                gap: 16px;
                margin-top: 16px;

                .c_button {
                    padding: 15px 36px;

                    &.c_button--primary--outlined {
                        border-width: 0;

                        @include desktop-min-width {
                            border-width: 1px;
                        }
                    }
                }
            }
        }
        .discount-percent {
            font-size: 10px;
            font-weight: 700;
            line-height: 12px;
            padding: 2px 5px;
            color: $primary-white;
            background-color: $functional-orange;
            border-radius: 3px;
        }
    }

    .skeleton-container {
        &.left-info {
            align-items: center;

            @include desktop-min-width {
                align-items: stretch;
            }
        }
        &.right-products {
            @include desktop-min-width {
                display: flex;
                gap: 16px;
            }
        }
        .cart-product-tile {
            width: 164px;
            height: 184px;
            border-radius: 8px;

            @include desktop-min-width {
                width: 230px;
                height: 250px;
            }
        }
    }
</style>
