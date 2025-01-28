<script>
     import CarouselContainerVer1 from "./amplienceBanners/CarouselContainerVer1.svelte";
     import ExtraBannerContainer1by5Variant1 from "./amplienceBanners/ExtraBannerContainer1by5Variant1.svelte";
// import ExtraBestSectionTileCarousel from "./amplienceBanners/ExtraBestSectionTileCarousel.svelte";
    // import ExtraBrandTileCarousel from "./amplienceBanners/ExtraBrandTileCarousel.svelte";
     import StageSponsorbannerContainer1x2Ver1 from "./amplienceBanners/StageSponsorbannerContainer1x2Ver1.svelte";
     import ImageBannerVer1 from "./amplienceBanners/imageBannerVer1.svelte";
     import SlotVariant1Ver1 from "./amplienceBanners/slotVariant1Ver1.svelte";
    // import StageBannerContainer1x3Ver1 from "./amplienceBanners/stageBannerContainer1x3Ver1.svelte";

    let onAmplienceComponentLoad =  ()=>{
        return true;
    };
    $: amplienceTemplateName = metaData?.amplienceTemplateName;
    $: amplienceComponent =
        amplienceTemplateName in bannerTemplateMap
            ? bannerTemplateMap[amplienceTemplateName]
            : null;

    export let metaData;
    export function onLoad() {
        if (amplienceTemplateName && amplienceComponent) {
            const result = onAmplienceComponentLoad();
            if (typeof result === "undefined") {
                return Promise.resolve(true);
            }
            return Promise.resolve(result);
        }
        console.error(
            "No component found for amplience template:",
            amplienceTemplateName,
        );
        return Promise.resolve(false);
    }

    const bannerTemplateMap = {
        slotVariant1Ver1: ImageBannerVer1,
        stageSlotVariant1: SlotVariant1Ver1,
        imageBannerVer1: ImageBannerVer1,
        bannerContainer1x1Ver1: ImageBannerVer1,
        // stageBannerContainer1x3Ver1: StageBannerContainer1x3Ver1,
         carouselContainerVer1: CarouselContainerVer1, // for brand page first banner
        // extraBrandTileCarousel: ExtraBrandTileCarousel,
        extraBannerContainer1by5Variant1: ExtraBannerContainer1by5Variant1,
        // extraBestSectionTileCarousel: ExtraBestSectionTileCarousel,
         stageSponsorbannerContainer1x2Ver1: StageSponsorbannerContainer1x2Ver1,
    };
</script>

{#if amplienceComponent}
    <svelte:component
        this={amplienceComponent}
        {metaData}
        bind:onLoad={onAmplienceComponentLoad}
    />
{/if}
