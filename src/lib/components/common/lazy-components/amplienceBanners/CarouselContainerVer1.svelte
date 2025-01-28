<script>
    import {
    	getDataFromAmplienceAsync,
    	parseCarouselDataForBrandHero,
    } from "../../../../../lib/amplience";
    import ExtraCarouselContainerSlideTemplate from "../../components/ExtraCarouselContainerSlideTemplate.svelte";
    import ExtraSwiper from "../../components/ExtraSwiper.svelte";
    
    export let metaData;

    let loaded = false;
    let carouselData;
    let isResponsive = false;
    const  bannerAutoScrollSwitch = false;
    $: isBrandCarousel =
        metaData &&
        "amplienceContentType" in metaData &&
        metaData["amplienceContentType"] === "extraCarouselVariant1";

    $: isHeroBanner = !isBrandCarousel;
    $: height = "auto";

    $: spaceBetween = "0";
    $: isSponsored =
        metaData && isValueSponsoredOrExtraSponsored(metaData.sponsoredType);
    $: brandName = metaData?.brandCode;
    $: slidesPerView = isResponsive ? 1 : isHeroBanner ? 1 : 4;
    $: swiperOptions = getSwiperOptions(
        isHeroBanner,
        slidesPerView,
        spaceBetween,
    );

    function getSwiperOptions(
        isHeroBanner,
        slidesPerView,
        spaceBetween,
    ) {
        return {
            loop: true,
            pagination: true,
            navigation: !isResponsive,
            slidesPerView,
            spaceBetween,
            // centeredSlides: isResponsive,
            autoplay: bannerAutoScrollSwitch,
            on: {
                realIndexChange: onSlideChange,
                click: onSlideClick,
            },
        };
    }

    export function onLoad() {
        const amplienceId = metaData["amplienceId"];
        return getDataFromAmplienceAsync(amplienceId)
            .then((res) => parseCarouselDataForBrandHero(res))
            .then((parsedCarouselData) => {
                carouselData = parsedCarouselData;
                gtmBannerViewEvent(
                    carouselData.slides[0].bannerId,
                    carouselData.slides[0].bannerName,
                    brandName,
                    isSponsored,
                );
            })
            .then(() => {
                loaded = true;
                const returnObject = { className: "" };
                if (isHeroBanner) {
                    returnObject.className += "super-wide-card";
                }

                return returnObject;
            })
            .catch(() => (loaded = false));
    }
</script>

{#if loaded}
    <section class="carousal-ver1-container">
        <ExtraSwiper
            slidesData={carouselData?.slides}
            slideTemplate={ExtraCarouselContainerSlideTemplate}
            {swiperOptions}
        />
    </section>
{:else}
    <div class="skeleton-item"></div>
{/if}

<style lang="scss">
    @import "../../../common/styles/colors.new.scss";
    .carousal-ver1-container {
        position: relative;
        max-width: 1440px;
        margin: auto;
        --swiper-navigation-sides-offset: calc(
            (max(100%, 1440px) - 1440px) / 2 + 10px
        );

        /*
        :global {
            .extra-swiper-container .swiper-button-next {
                right: 6rem;
            }
            .extra-swiper-container.swiper-rtl .swiper-button-next {
                right: 6rem;
            }
            .extra-swiper-container.swiper-rtl .swiper-button-prev {
                left: 4rem;
            }
            .swiper-slide {
                width: 100%;
                overflow: hidden;
                transition: scale 250ms ease;
                margin-right: 0;

                &:not(.swiper-slide-active) {
                    scale: 1;
                    border-radius: 0;

                    @include responsive {
                        scale: 1;
                        border-radius: 20px 20px 0px 0px;
                    }
                }
                @include desktop-max-width {
                    border-radius: 20px 20px 0px 0px;
                    margin-right: 0px;
                }

                .carousel-slide {
                    display: block;
                    text-align: center;

                    @include desktop-min-width {
                        text-align: unset;
                    }
                }
            }
            .swiper-button-prev {
                left: 4rem;
                background: none;
                &::after {
                    // transform: none;
                }
            }
            .swiper-button-next {
                right: 4rem;
                // transform: none;
                background: none;
                &::after {
                    // transform: none;
                    top: 0%;
                }
            }
            .swiper-rtl .swiper-button-next {
                left: inherit;
            }
        }*/
    }
    .skeleton-item {
        height: 300px;
    }

    swiper-slide {
        &.hover-effect {
            transition:
                filter 250ms ease,
                transform 250ms ease;

            &:hover {
                filter: brightness(1);
                transform: scale(1);
            }
        }

        .carousel-slide {
            display: block;
            text-align: center;

            @include desktop-min-width {
                text-align: unset;
            }
        }
    }
    swiper-container::part(pagination) {
        display: none;
        @include desktop-min-width {
            width: 25%;
            display: block;
            bottom: 30px;
            left: 0;
        }
    }
    swiper-container::part(bullet),
    swiper-container::part(bullet-active) {
        height: 8px;
        width: 8px;
        border: 1px solid $neutral-dark-04;
        background-color: transparent;

        @include desktop-min-width {
            border: 2px solid $neutral-dark-04;
            height: 16px;
            width: 16px;
        }
    }
    swiper-container::part(bullet-active) {
        background-color: $color-yellow;
        border-color: $color-yellow;
    }

    swiper-container::part(container) {
        --swiper-navigation-sides-offset: calc(
            (max(100%, 1440px) - 1440px) / 2 + 10px
        );
    }
    :global(.carousal-ver1-container .swiper-pagination) {
        width: 25% !important;
        display: block !important;
        left: 15px !important;
        bottom: 30px !important;
        text-align: left;
        @include desktop-max-width {
            bottom: 15px !important;
            text-align: center;
            width: 100% !important;
        }
    }
    :global(.carousal-ver1-container .swiper-pagination-bullet) {
        width: 16px !important;
        height: 16px !important;
        @include desktop-max-width {
            width: 8px !important;
            height: 8px !important;
        }
    }
</style>
