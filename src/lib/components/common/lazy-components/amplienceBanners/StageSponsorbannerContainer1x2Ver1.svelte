<script>
    import { fade } from "svelte/transition";
    import {
    	getDataFromAmplienceAsync,
    	parseSponsorBanner1x2Data,
    } from "../../../../../lib/amplience";
    import {
    	isMobile,
    	isValueSponsoredOrExtraSponsored
    } from "../../../../../lib/util";
    import ImageTag from "../ImageTag.svelte";

    export let metaData;

    export function onLoad() {
        const amplienceId = metaData["amplienceId"];;
        return getDataFromAmplienceAsync(amplienceId)
            .then((res) => parseSponsorBanner1x2Data(res))
            .then((parsedBanners) => {
                if (parsedBanners.length === 0)
                    throw new Error("Unable to parse sponsorBanner1x2");
                loaded = true;
                bannersArray = parsedBanners;
                return true;
            })
            .catch(() => (failedToLoad = true));
    }

    let failedToLoad = false;
    let loaded = false;
    let bannersArray = [];
    let isResponsive = isMobile();

    $: isSponsored =
        metaData && isValueSponsoredOrExtraSponsored(metaData?.sponsoredType);
    $: brandName = metaData?.brandCode;
</script>

{#if !failedToLoad}
    <section class="sponsor-banner-1x2-container">
        {#if loaded}
            {#each bannersArray as { image, mobileImage, link, bannerName: alt, bannerId }}
                <a
                    class="banner-link"
                    class:sponsored-padding={isSponsored}
                    href={link}
                    in:fade
                >
                    <!-- <PictureTag
                        {image}
                        {mobileImage}
                        {alt}
                    /> -->
                    <ImageTag
                        imageUrls={[mobileImage, image]}
                        widths={[400, 656]}
                        heights={[290, 275]}
                        {alt}
                    />

                    
                </a>
            {/each}
        {:else}
            <div class="skeleton-item"></div>
            <div class="skeleton-item"></div>
        {/if}
    </section>
{/if}

<style lang="scss">
    @import "../../styles/colors.new.scss";

    .banner-link {
        position: relative;

        &.sponsored-padding {
            padding-bottom: 25px;

            @include desktop-min-width {
                padding-bottom: unset;
            }
        }
    }
    .sponsor-banner-1x2-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 48px;

        @include desktop-min-width {
            flex-direction: row;
            gap: 32px;
        }
        @include desktop-max-width {
            padding: 33px 16px;
        }

        .skeleton-item {
            min-height: 275px;
            flex-basis: 40%;
            flex-grow: 1;
            border-radius: 8px;
        }
    }
</style>
