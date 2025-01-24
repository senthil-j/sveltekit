<script lang="ts">
  import type { SwiperOptions } from 'swiper/types';
  import {
    getJoodMembershipBasedPropertyValue,
    getTitleCasedString,
    isMobileWidth,
    isValueSponsoredOrExtraSponsored,
  } from '../../../../common/util';
  import { brandGtmBannerClickEvent, gtmBannerViewEvent } from '../../../brand/services/brand-data-services';
  import { getDataFromAmplienceAsync, parseCarouselDataForBrandTile } from '../../../common/services/amplience';
  import ExtraBestSectionSlideTemplate from '../../components/ExtraBestSectionSlideTemplate.svelte';
  import ExtraSwiper from '../../components/ExtraSwiper.svelte';

  export let metaData;
  let loaded = true;
  let centered = true;
  $: isResponsive = isMobileWidth();
  $: spaceBetween = isResponsive ? 16 : 26;
  let color = '#FCE700';
  let headingText;
  let subTitle;
  let carouselData = [];
  let brandPageTitle = getTitleCasedString(window['ACC'].rrvariables.categoryId, true);

  const minimumSlidesRequired = 10;
  $: slidesPerView = 'auto';

  $: isBrandCarousel =
    metaData && 'amplienceContentType' in metaData && metaData['amplienceContentType'] === 'extraCarouselVariant1';
  $: isSponsored = metaData && isValueSponsoredOrExtraSponsored(metaData?.sponsoredType);
  $: brandName = metaData?.brandCode;

  export function onLoad() {
    const amplienceId = getJoodMembershipBasedPropertyValue(
      metaData,
      'amplienceId',
      'blueAmplienceId',
      'goldAmplienceId'
    );
    return getDataFromAmplienceAsync(amplienceId)
      .then((res: any) => parseCarouselDataForBrandTile(res))
      .then(parsedCarouselData => {
        const slides = parsedCarouselData.slides;
        let repeatedSlides = [];
        if (slides.length < minimumSlidesRequired) {
          const n = Math.ceil(minimumSlidesRequired / slides.length);
          for (let i = 0; i < n; i++) {
            repeatedSlides = repeatedSlides.concat(slides);
          }
        } else {
          repeatedSlides = slides;
        }
        carouselData = repeatedSlides;
        color = parsedCarouselData?.backgroundColor;
        headingText = parsedCarouselData?.headingText;
        subTitle = parsedCarouselData?.subtitle;
      })
      .then(() => (loaded = true))
      .then(() => Object.assign({}, { style: `background-color: ${color}` }))
      .catch(() => (loaded = false));
  }

  $: swiperOptions = getSwiperOptions(slidesPerView, spaceBetween);

  function getSwiperOptions(slidesPerView, spaceBetween): SwiperOptions {
    return {
      loop: true,
      navigation: !isResponsive,
      slidesPerView,
      spaceBetween,
      centeredSlides: true,
      on: {
        realIndexChange: onSlideChange,
        click: onSlideClick,
      },
    };
  }

  function onSlideChange() {
    const slide = this.slides[this.activeIndex].querySelector('.carousel-slide');
    if (slide && slide.dataset) {
      const { bannerId, bannerName } = slide.dataset;
      gtmBannerViewEvent(bannerId, bannerName, brandName, isSponsored);
    }
  }

  const onSlideClick = swiper => {
    const slide = swiper.clickedSlide.querySelector('.carousel-slide');
    if (slide && slide.dataset) {
      const { bannerId, bannerName } = slide.dataset;
      brandGtmBannerClickEvent(bannerId, bannerName, brandName, isSponsored);
    }
  };
</script>

{#if loaded}
  <section class="get-best-deal-container" style="background-color: {color};">
    {#if headingText}
      <span class="get-best-deal-container-title">{headingText}</span>
    {/if}

    {#if isResponsive && subTitle}
      <br /><span class="get-best-deal-container-subTitle">{subTitle}</span>
    {/if}
    <section class="get-best-deal-container-slider">
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <section>
        {#if carouselData?.length > 0}
          <ExtraSwiper slidesData={carouselData} slideTemplate={ExtraBestSectionSlideTemplate} {swiperOptions} />
        {/if}
      </section>
    </section>
  </section>
{/if}

<style lang="scss">
  @import '../../../common/styles/colors.new.scss';

  .get-best-deal-container {
    background-color: $primary-yellow-01;
    padding: 80px 0;
    width: 100%;
    @include desktop-max-width {
      padding: 40px 0;
    }
    &-title {
      color: $neutral-dark-01;
      font-size: 36px;
      font-weight: 500;
      line-height: 40px;
      padding-left: 48px;
      @include desktop-max-width {
        font-size: 20px;
        line-height: 22px;
        padding-left: 16px;
      }
    }
    &-subTitle {
      font-size: 14px;
      font-weight: 400;
      line-height: 16px;
      padding-left: 16px;
      -webkit-box-decoration-break: clone;
      box-decoration-break: clone;
    }
    &-slider {
      width: 100%;
    }
    :global {
      .swiper-slide-active {
        transform: scale(1.31);
        margin: 0 74px 0 48px !important;
        @include desktop-max-width {
          margin: 0 44px 0 28px !important;
        }
      }
      swiper-container::part(container) {
        padding: 130px 0 66px 0;
        @include desktop-max-width {
          padding: 57px 0 32px 0;
        }
      }
      swiper-container::part(scrollbar) {
        background: rgba(0, 101, 164, 0.09);
        height: 8px;
        margin-top: 9rem;
        position: relative;
      }

      swiper-container::part(wrapper) {
        @include desktop-min-width {
          margin-left: -364px;
        }
      }
      .swiper-slide {
        @include desktop-min-width {
          width: 326px;
        }
        transition: transform 250ms ease;
      }
      .swiper-wrapper {
        padding: 130px 0 66px 0;
        @include desktop-max-width {
          padding: 57px 0 32px 0;
        }
      }
      .swiper-button-next {
        transform: rotate(90deg);
      }
      .swiper-button-prev {
        transform: rotate(-90deg);
      }
    }
  }
</style>
