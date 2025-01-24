<script lang="ts">
    import {
        getDataFromAmplienceAsync,
        parseImageBannerData,
    } from "../../common/services/amplience";
    import { getCMSComponentsFromHybrisAsync } from "../../common/services/hybris";
    import PictureTag from "../../common/lazy-components/PictureTag.svelte";
    import CategoryButtons from "./child-helpers/CategoryButtons.svelte";
    import {
        brandGtmBannerClickEvent,
        brandGtmBannerViewEvent,
        brandGtmFilterEvent,
        gtmBannerViewEvent,
    } from "../../brand/services/brand-data-services";
    import {
        isMobile,
        isValueSponsoredOrExtraSponsored,
    } from "../../../common/util";
    import viewport from "../components/useViewportAction";

    export let metaData;
    $: isResponsive = isMobile();
    $: isSponsored =
        metaData && isValueSponsoredOrExtraSponsored(metaData?.sponsoredType);
    $: brandName = metaData?.brandCode;

    export function onLoad() {
        const { amplienceBanners } = metaData;
        if (amplienceBanners?.length > 0) {
            const bannerSplits = amplienceBanners.split(" ");
            return getCMSComponentsFromHybrisAsync(bannerSplits)
                .then((res) => res.component)
                .then((c) => (categoryList = c))
                .then(() => true);
        } else {
            failedToLoad = true;
            return false;
        }
    }

    let failedToLoad = false;
    let categoryList = [];
    let categoryDataCache = {};
    let activeCategoryData = null;

    function setActiveCategory(categoryItem) {
        if (categoryItem.uid in categoryDataCache) {
            // data is present in cache, load directly
            activeCategoryData = categoryDataCache[categoryItem.uid];
            console.log(
                "Active Category data changed to :::",
                activeCategoryData,
            );
        } else {
            activeCategoryData = null;
            const { amplienceId } = categoryItem;
            // data is not present, load from amplience
            getDataFromAmplienceAsync(amplienceId)
                .then((res) => parseImageBannerData(res as any))
                .then((amplienceData) => {
                    const amplienceMergedItem = Object.assign(
                        {},
                        categoryItem,
                        { amplienceData },
                    );
                    categoryDataCache[categoryItem.uid] = amplienceMergedItem;
                    activeCategoryData = categoryDataCache[categoryItem.uid];
                    console.log(
                        "Active Category data changed to :::",
                        activeCategoryData,
                    );
                });
        }
        brandGtmFilterEvent(categoryItem?.title, "");
        // brandGtmBannerViewEvent(activeCategoryData?.amplienceData?.bannerId, activeCategoryData?.amplienceData?.bannerName, isResponsive ? activeCategoryData?.amplienceData?.mobileImage : activeCategoryData?.amplienceData?.image);
    }
</script>

{#if !failedToLoad}
    <section class="brand-product-banner-container py80">
        {#if metaData && metaData.title}
            <h2 class="px48">{metaData?.title}</h2>
        {/if}
        {#if categoryList?.length > 0}
            <section class="category-list px48">
                <CategoryButtons
                    {categoryList}
                    initialSelectedIndex={0}
                    propertyNameToDisplay="title"
                    on:categorySelected={({ detail: categoryItem }) =>
                        setActiveCategory(categoryItem)}
                />
            </section>
            <section class="banner-area">
                {#if activeCategoryData?.amplienceData}
                    {@const { link, image, mobileImage, bannerName, bannerId } =
                        activeCategoryData.amplienceData}
                    <a
                        class="banner-anchor"
                        href={link}
                        on:click={() =>
                            brandGtmBannerClickEvent(
                                bannerId,
                                bannerName,
                                brandName,
                                isSponsored,
                            )}
                        use:viewport
                        on:enterViewport={() =>
                            gtmBannerViewEvent(
                                bannerId,
                                bannerName,
                                brandName,
                                isSponsored,
                            )}
                    >
                        <PictureTag {image} {mobileImage} width="100%" />
                    </a>
                {:else}
                    <section class="banner-anchor skeleton-item"></section>
                {/if}
            </section>
        {/if}
    </section>
{/if}

<style lang="scss">
    @import "../../common/styles/colors.new.scss";

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

    .banner-area {
        .banner-anchor.skeleton-item {
            min-height: 500px;
        }
    }
</style>
