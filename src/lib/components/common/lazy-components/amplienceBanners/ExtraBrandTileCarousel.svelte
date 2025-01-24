<script lang="ts">
    import type { SwiperOptions } from "swiper/types";
    import {
        getJoodMembershipBasedPropertyValue,
        isMobileWidth,
        isValueSponsoredOrExtraSponsored,
    } from "../../../../common/util";
    import {
        brandGtmBannerClickEvent,
        gtmBannerViewEvent,
    } from "../../../brand/services/brand-data-services";
    import {
        getDataFromAmplienceAsync,
        parseCarouselDataForBrandTile,
    } from "../../../common/services/amplience";
    import ExtraBrandTileSlideTemplate from "../../components/ExtraBrandTileSlideTemplate.svelte";
    import ExtraSwiper from "../../components/ExtraSwiper.svelte";
    import { getCMSComponentsFromHybrisAsync } from "../../services/hybris";

    export let metaData;

    let loaded: boolean = false;
    export let color = "#04061B";
    let brandTileData;
    let isResponsive = isMobileWidth();
    let title, subtitle;

    $: spaceBetween = isResponsive ? "12" : "24";
    $: isSponsored =
        metaData && isValueSponsoredOrExtraSponsored(metaData?.sponsoredType);
    $: brandName = metaData?.brandCode;
    $: swiperOptions = getSwiperOptions();

    function getSwiperOptions(): SwiperOptions {
        return {
            freeMode: true,
            slidesPerView: "auto",
            spaceBetween: spaceBetween,
            scrollbar: {
                el: ".swiper-scrollbar",
                dragClass: "swiper-scrollbar-drag",
                hide: false,
                draggable: true,
            },
            on: {
                realIndexChange: onSlideChange,
                click: onSlideClick,
            },
        };
    }

    function onSlideChange() {
        const slide =
            this.slides[this.activeIndex].querySelector(".carousel-slide");
        console.log(slide.dataset, "slide.dataset");
        if (slide && slide.dataset) {
            const { bannerId, bannerName } = slide.dataset;
            gtmBannerViewEvent(bannerId, bannerName, brandName, isSponsored);
        }
    }

    const onSlideClick = (swiper) => {
        const slide = swiper.clickedSlide.querySelector(".carousel-slide");
        if (slide && slide.dataset) {
            const { bannerId, bannerName } = slide.dataset;
            brandGtmBannerClickEvent(
                bannerId,
                bannerName,
                brandName,
                isSponsored,
            );
        }
    };
    export function onLoad() {
        // This component is being used on 2 places:
        // 1. as an Amplience template
        // 2. as a Hybris component with typecode ExtraCategoryBlogsComponent
        // Make sure you know what you're changing before committing.

        if (metaData?.typeCode === "ExtraAmplienceBannerComponent") {
            // usage as Amplience template
            const amplienceId = getJoodMembershipBasedPropertyValue(
                metaData,
                "amplienceId",
                "blueAmplienceId",
                "goldAmplienceId",
            );
            return getDataFromAmplienceAsync(amplienceId)
                .then((res: any) => parseCarouselDataForBrandTile(res))
                .then((parsedCarouselData) => {
                    brandTileData = parsedCarouselData;
                    color = brandTileData?.backgroundColor;
                })
                .then(() => (loaded = true))
                .then(() =>
                    Object.assign({}, { style: `background-color: ${color}` }),
                )
                .catch(() => (loaded = false));
        } else {
            // usage as Hybris component
            const {
                cmsLinks,
                title: metaTitle,
                subTitle: metaSubtitle,
                backgroundColor,
            } = metaData;
            title = metaTitle;
            subtitle = metaSubtitle;
            color = backgroundColor;

            return getCMSComponentsFromHybrisAsync(cmsLinks.split(" "))
                .then((res) => res.component)
                .then((cmsLinkList) =>
                    parseCMSLinksToBrandTileData(cmsLinkList),
                )
                .then((parsedCarouselData) => {
                    brandTileData = parsedCarouselData;
                })
                .then(() => (loaded = true))
                .then(() =>
                    Object.assign({}, { style: `background: ${color}` }),
                )
                .catch((r) => (loaded = false));
        }
    }

    function parseCMSLinksToBrandTileData(cmsLinkList) {
        // Adapting structure according to amplience usecase
        return Object.assign({
            slides: cmsLinkList.map((cmslink) =>
                Object.assign({
                    link: cmslink.algoliaUrl || cmslink.url,
                    bannerId: cmslink.uid,
                    bannerName: cmslink.linkName,
                    image: cmslink.iconUrl,
                    mobileImage: cmslink.iconUrl,
                    headingText: cmslink.linkName,
                    subHeadingText: cmslink.subTitle,
                }),
            ),
        });
    }
</script>

{#if loaded}
    <section class="brandTiles-container" style="background: {color};">
        {#if title || subtitle}
            <section class="brandTiles-header-section px48">
                {#if title}
                    <h2>{title}</h2>
                {/if}
                {#if subtitle}
                    <h3>{subtitle}</h3>
                {/if}
            </section>
        {/if}
        <section class="brandTiles-container-slider">
            <section>
                {#if loaded}
                    <ExtraSwiper
                        slidesData={brandTileData.slides}
                        slideTemplate={ExtraBrandTileSlideTemplate}
                        {swiperOptions}
                    />
                {/if}
            </section>
        </section>
    </section>
{/if}

<style lang="scss">
    @import "../../../common/styles/colors.new.scss";

    .brandTiles-container {
        background-color: $primary-yellow-01;
        padding: 80px 0;
        width: 100%;
        @include desktop-max-width {
            padding: 20px 0;
        }

        .brandTiles-header-section {
            color: $primary-white;
            margin-bottom: 20px;

            @include desktop-min-width {
                margin-bottom: 50px;
            }
            & > * {
                margin: 0;
                text-align: center;

                @include desktop-min-width {
                    text-align: left;
                }
            }
            h2 {
                font-size: 20px;
                font-weight: 700;
                line-height: 22px;

                @include desktop-min-width {
                    font-size: 36px;
                    line-height: 40px;
                }
            }
            h3 {
                font-size: 14px;
                font-weight: 400;
                line-height: 16px;
                margin-top: 4px;

                @include desktop-min-width {
                    font-size: 18px;
                    line-height: 20px;
                    margin-top: 8px;
                }
            }
        }
        .theme-icon {
            :global(img) {
                border-radius: 12px;
            }
        }
        :global {
            .swiper-scrollbar {
                background-color: rgba(252, 231, 0, 0.09);
                height: 8px;
                position: relative;
                left: 0;
                margin: 20px 48px 0;
                max-width: 95%;
                @include desktop-max-width {
                    margin: 0 16px;
                    max-width: 92%;
                }
            }
            .swiper-scrollbar-drag {
                max-width: 80%;
                background-color: rgb(252, 231, 0);
            }
            .swiper-slide {
                width: 220px;
                // height: 310px;
                &:first-child {
                    margin-left: 48px;
                }
                &:last-of-type {
                    margin-right: 48px;
                }
                @include desktop-max-width {
                    margin-bottom: 15px;
                    max-width: 132px;
                    &:first-child {
                        margin-left: 16px;
                    }
                    &:last-of-type {
                        margin-right: 16px;
                    }
                }
            }
        }
    }
</style>
