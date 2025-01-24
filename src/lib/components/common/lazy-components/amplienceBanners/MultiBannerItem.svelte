<script lang="ts">
    import { isValueSponsoredOrExtraSponsored } from "../../../../common/util";
    import {
        brandGtmBannerClickEvent,
        gtmBannerViewEvent,
    } from "../../../brand/services/brand-data-services";
    import viewport from "../../components/useViewportAction";
    import PictureTag from "../PictureTag.svelte";

    export let bannerData;
    export let isBigImage = false;
    let color =
        bannerData && bannerData.backgroundColor
            ? bannerData.backgroundColor
            : "#DBE3E8";

    $: pictureHeight = isBigImage ? "90px;400px" : "90px;135px";
</script>

<a
    href={bannerData?.link}
    class="multi-banner-item scale-on-hover"
    style="background-color: {color};"
    on:click={() =>
        brandGtmBannerClickEvent(
            bannerData?.bannerId,
            bannerData?.bannerName,
            "",
            "",
        )}
    on:click
    use:viewport
    on:enterViewport={() =>
        gtmBannerViewEvent(
            bannerData?.bannerId,
            bannerData?.bannerName,
            "",
            "",
        )}
>
    <div class="text-wrapper">
        <h3>{bannerData?.headingText}</h3>
        <p>{bannerData?.subHeadingText}</p>
        {#if bannerData && bannerData.price}
            <span class="starting-price"
                >{bannerData?.bodyText} <b>{bannerData?.price}</b></span
            >
        {/if}
    </div>
    <section class="image-wrapper">
        <PictureTag
            image={bannerData?.image}
            alt={bannerData?.headingText}
            getAllResolutions={false}
            height={pictureHeight}
        />
    </section>
</a>

<style lang="scss">
    @import "../../styles/colors.new.scss";

    .multi-banner-item {
        padding: 12px;
        border-radius: 8px;
        height: 200px;
        position: relative;

        @include desktop-min-width {
            padding: 20px;
            border-radius: 20px;
            height: 268px;
        }
        h3 {
            font-size: 16px;
            font-weight: 700;
            line-height: 18px;
            margin: 0;
            color: $neutral-dark-01;

            @include desktop-min-width {
                font-size: 18px;
                line-height: 20px;
            }
        }
        p {
            font-size: 12px;
            font-weight: 400;
            line-height: 14px;
            margin: 0;
            color: $neutral-dark-01;
            padding-top: 4px;

            @include desktop-min-width {
                font-size: 16px;
                line-height: 18px;
            }
        }
        .starting-price {
            font-size: 16px;
            font-weight: 400;
            line-height: 18px;
            color: $neutral-dark-01;
            padding-top: 8px;
        }
        .image-wrapper {
            position: absolute;
            bottom: 10px;
            right: 10px;
            left: 10px;
            text-align: center;

            @include desktop-min-width {
                left: 20px;
                right: 20px;
                bottom: 20px;
                text-align: right;
            }
        }
    }
</style>
