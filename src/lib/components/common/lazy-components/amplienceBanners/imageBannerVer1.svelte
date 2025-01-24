<script lang="ts">
    import { onMount } from "svelte";
    import {
        getJoodMembershipBasedPropertyValue,
        isMobile,
        isValueSponsoredOrExtraSponsored,
    } from "../../../../common/util";
    import {
        brandGtmBannerClickEvent,
        gtmBannerViewEvent,
    } from "../../../brand/services/brand-data-services";
    import SponsoredTag from "../../components/SponsoredTag.svelte";
    import viewport from "../../components/useViewportAction";
    import {
        getDataFromAmplienceAsync,
        parseImageBannerData,
    } from "../../services/amplience";

    import PictureTag from "../PictureTag.svelte";
    import ImageTag from "../ImageTag.svelte";

    export let metaData;
    export let isDynamicRender;
    export let initialHeightForCLS = isMobile() ? "0" : "300px";

    const getBannerDetails = () => {
        const amplienceId = getJoodMembershipBasedPropertyValue(
            metaData,
            "amplienceId",
            "blueAmplienceId",
            "goldAmplienceId",
        );
        return getDataFromAmplienceAsync(amplienceId)
            .then((res) => parseImageBannerData(res as any))
            .then((imageBannerData) => {
                image = imageBannerData.image;
                mobileImage = imageBannerData.mobileImage;
                link = imageBannerData.link;
                bannerName = imageBannerData.bannerName;
                bannerId = imageBannerData.bannerId;
            })
            .then(() => {
                loaded = true;
                if (isSponsored) {
                    return { className: "divider-sponsored" };
                }
                return loaded;
            })
            .catch(() => (loaded = false));
    };

    onMount(async () => {
        if (isDynamicRender == "false") {
            getBannerDetails();
        }
    });

    export function onLoad() {
        getBannerDetails();
    }

    let amplienceId: string;
    let loaded: boolean = false;
    let image: string;
    let mobileImage: string;
    let link: string;
    let bannerName: string;
    let bannerId: string;

    $: isSponsored =
        metaData && isValueSponsoredOrExtraSponsored(metaData?.sponsoredType);
    $: brandName = metaData?.brandCode;
    function onImageLoad() {
        loaded = true;
        // window['ACC'].mixpanel.trackBannerView(
        //     amplienceId,
        //     metaData.name,
        //     metaData.brandCode || '',
        //     isSponsored
        // );
    }
</script>

<section class="image-banner-container" style:min-height={initialHeightForCLS}>
    <a
        href={link}
        on:click={() =>
            brandGtmBannerClickEvent(
                bannerId,
                bannerName,
                brandName,
                isSponsored,
            )}
        on:click
        use:viewport
        on:enterViewport={() =>
            gtmBannerViewEvent(bannerId, bannerName, brandName, isSponsored)}
    >
        <!-- <PictureTag
            on:load={onImageLoad}
            {image}
            {mobileImage}
            width="100%"
        /> -->

        <ImageTag
            imageUrls={[mobileImage, image]}
            widths={[430, 1440]}
            heights={[430, 300]}
            alt="1x1 banner"
        />
    </a>
    {#if isSponsored}
        <SponsoredTag variant="banner" />
    {/if}
</section>
{#if !loaded}
    <div class="skeleton-item"></div>
{/if}

<style lang="scss">
    .skeleton-item {
        height: 300px;
    }
    .image-banner-container {
        position: relative;
    }
</style>
