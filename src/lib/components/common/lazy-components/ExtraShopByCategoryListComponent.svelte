<script lang="ts">
    import type { SwiperOptions } from "swiper/types";
    import { isMobile } from "../../../common/util";
    import ExtraSwiper from "../components/ExtraSwiper.svelte";
    import { getCMSComponentsFromHybrisAsync } from "../services/hybris";
    import ExtraShopByCategoryComponent from "./ExtraShopByCategoryComponent.svelte";

    export let metaData: any;

    export function onLoad() {
        const categoryIds =
            metaData.extraShopByCategoryComponentList.split(" ");
        getCMSComponentsFromHybrisAsync(categoryIds)
            .then((res) => res.component)
            .then((categories) => {
                categoryList = categories;
                loaded = true;
            });
    }

    let loaded = false;
    let categoryList;
    $: isResponsive = isMobile();
    $: categoryTileSwiperOptions = getSwiperOptions();

    function getSwiperOptions(): SwiperOptions {
        return {
            slidesPerView: "auto",
            spaceBetween: isResponsive ? "12" : "16",
            navigation: !isResponsive,
        };
    }
</script>

<section class="shop-by-category-container">
    {#if loaded}
        <ExtraSwiper
            slidesData={categoryList}
            slideTemplate={ExtraShopByCategoryComponent}
            swiperOptions={categoryTileSwiperOptions}
        />
    {:else}
        <section class="skeleton-container">
            <section class="skeleton-item"></section>
            <section class="skeleton-item"></section>
            <section class="skeleton-item"></section>
        </section>
    {/if}
</section>

<style lang="scss">
    @import "../styles/colors.new.scss";
    .shop-by-category-container {
        flex-basis: 100%;
        max-width: 100%;
        margin-top: 24px;

        @include desktop-min-width {
            margin-top: 0;
            height: 180px;
        }
        swiper-container {
            height: 100%;
        }
        swiper-slide {
            display: flex;
        }
        :global {
            .extra-swiper-container .swiper-button-next {
                transform: none !important;
            }
            .extra-swiper-container .swiper-button-prev {
                transform: none !important;
            }
        }
    }
    .skeleton-container {
        display: flex;
        gap: 16px;
    }
    .skeleton-item {
        height: 140px;
        width: 148px;
        border-radius: 8px;
        flex-shrink: 0;

        @include desktop-min-width {
            height: unset;
            width: 178px;
            aspect-ratio: 1;
        }
    }
</style>
