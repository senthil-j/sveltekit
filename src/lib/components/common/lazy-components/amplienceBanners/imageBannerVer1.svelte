<script>
    import { onMount } from "svelte";
    import {
    	getDataFromAmplienceAsync,
    	parseImageBannerData,
    } from "../../../../../lib/amplience.js";

    import ImageTag from "../ImageTag.svelte";

    export let metaData=null;
    export let initialHeightForCLS = "300px";
    const getBannerDetails = () => {
        console.log(metaData, 'metaDatametaDatametaData');
        const amplienceId = metaData["amplienceId"];
        console.log(amplienceId, 'amplienceId');
        return getDataFromAmplienceAsync(amplienceId)
            .then((res) => {console.log(res, 'resssssssssss');return parseImageBannerData(res)})
            .then((imageBannerData) => {
                image = imageBannerData.image;
                mobileImage = imageBannerData.mobileImage;
                link = imageBannerData.link;
                bannerName = imageBannerData.bannerName;
                bannerId = imageBannerData.bannerId;
            })
            .then(() => {
                return true;
            })
            .catch(() => (loaded = false));
    };

    onMount(async () => {
        //if (isDynamicRender == "false") {
            getBannerDetails();
       // }
    });

    // export function onLoad() {
    //     getBannerDetails();
    // }

    let loaded = false;
    let image;
    let mobileImage;
    let link;
    let bannerName;
    let bannerId;

    // function onImageLoad() {
    //     loaded = true;
    // }
    //$: console.log(image, 'sd image' );
</script>

<section class="image-banner-container" style:min-height={initialHeightForCLS}>
    <a href={link}>
        <ImageTag
            imageUrls={[mobileImage, image]}
            widths={[430, 1440]}
            heights={[430, 300]}
            alt="1x1 banner"
        />
    </a>
    
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
