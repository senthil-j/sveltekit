<script>
  import { getDataFromAmplienceAsync, parseCarouselData } from '../../../../../lib/amplience';
  import { getAppConfig, isValueSponsoredOrExtraSponsored } from '../../../../../lib/app-config';
  import ExtraHeroBannerSlideTemplate from '../../components/ExtraHeroBannerSlideTemplate.svelte';
  import ExtraSwiper from '../../components/ExtraSwiper.svelte';
  export let metaData;

  let carouselData;
  let loaded = false;
  let isResponsive = false;

  const { bannerAutoScrollSwitch } = getAppConfig();

  export function onLoad() {
    return getImageData();
  }
  $: isBrandCarouselForHomepage =
    metaData && 'amplienceContentType' in metaData && metaData['amplienceContentType'] === 'extraCarouselVariant1';

  $: belowLargeScreen = window.innerWidth < 1440 && !isResponsive;
  $: isHeroBanner = !isBrandCarouselForHomepage;
  $: slidesPerView = belowLargeScreen ? 1 : isResponsive ? 1 : isHeroBanner ? 'auto' : 4;
  $: spaceBetween = belowLargeScreen ? -45 : isResponsive ? 10 : isHeroBanner ? -65 : 36;

  $: isSponsored = metaData && isValueSponsoredOrExtraSponsored(metaData?.sponsoredType);
  $: brandName = metaData?.brandCode;
  $: minHeightForImg = belowLargeScreen ? '350px' : '480px';

  $: swiperOptions = getSwiperOptions(isHeroBanner, slidesPerView, spaceBetween, belowLargeScreen);

  function getSwiperOptions(isHeroBanner, slidesPerView, spaceBetween, belowLargeScreen) {
    return {
      loop: true,
      pagination: isHeroBanner,
      navigation: !isResponsive,
      slidesPerView,
      spaceBetween,
      centeredSlides: isHeroBanner || isResponsive,
      autoplay: bannerAutoScrollSwitch,
    };
  }
  async function getImageData() {
    const amplienceId = metaData["amplienceId"];

    return getDataFromAmplienceAsync(amplienceId)
      .then(res => parseCarouselData(res))
      .then(parsedCarouselData => {
        carouselData = parsedCarouselData;
        return carouselData;
      })
      .then(() => {
        loaded = true;
        const returnObject = { className: '' };
        if (isSponsored) {
          returnObject.className += ' divider-sponsored';
        }
        if (isHeroBanner) {
          returnObject.className += ' super-wide-card';
        }

        return returnObject;
      })
      .catch(() => (loaded = false));
  }
</script>

{#if loaded}
  <section class="slot-variant-1-container">
    <ExtraSwiper
      initialHeightForCLS={minHeightForImg}
      slidesData={carouselData?.slides}
      slideTemplate={ExtraHeroBannerSlideTemplate}
      {swiperOptions}
    />
  </section>
{:else}
  {#if isHeroBanner}
    <section class="skeleton-container hero-skeleton">
      <section class="skeleton-item"></section>
      <section class="skeleton-item"></section>
    </section>
  {/if}
  {#if isBrandCarouselForHomepage}
    <section class="skeleton-container brand-skeleton">
      <section class="skeleton-item"></section>
      <section class="skeleton-item"></section>
      <section class="skeleton-item"></section>
      <section class="skeleton-item"></section>
    </section>
  {/if}
{/if}

<style lang="scss">
  @import '../../styles/colors.new.scss';

  .slot-variant-1-container {
    position: relative;
    --swiper-navigation-sides-offset: calc((max(100%, 1440px) - 1440px) / 2 + 10px);
    height: 480px;

    @include responsive {
      height: unset;
    }
    /*
    //
      //sveltekit sass
    :global {
      .extra-swiper-container .swiper-button-next {
        transform: none !important;
        top: 53%;
      }
      .extra-swiper-container .swiper-button-prev {
        transform: none !important;
        top: 53%;
      }
      .swiper-slide {
        width: 100%;
        max-width: 1440px;
        border-radius: 20px;
        overflow: hidden;
        transition: scale 250ms ease;

        &:not(.swiper-slide-active) {
          scale: 0.9;
          border-radius: 0;

          @include responsive {
            scale: 1;
            border-radius: 20px 20px 0px 0px;
          }
        }
        @include desktop-max-width {
          border-radius: 20px 20px 0px 0px;
        }

        .carousel-slide {
          display: block;
          text-align: center;

          @include desktop-min-width {
            text-align: unset;
            min-height: inherit;
          }
        }
      }
      .swiper-button-prev {
        left: var(--swiper-navigation-sides-offset, 10px);
      }
      .swiper-button-next {
        right: var(--swiper-navigation-sides-offset, 10px);
      }
      .swiper-rtl .swiper-button-next {
        left: inherit;
      }
    }
    */
  }

  swiper-slide {
    width: 100%;
    max-width: 1440px;
    transition: transform 250ms ease;
    border-radius: 20px;
    overflow: hidden;

    &:not(.swiper-slide-active) {
      transform: scale(0.9);
      border-radius: 0;
    }

    &.hover-effect {
      transition:
        filter 250ms ease,
        transform 250ms ease;

      &:hover {
        filter: brightness(0.95);
        transform: scale(0.95);
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
  swiper-container::part(bullet),
  swiper-container::part(bullet-active) {
    height: 8px;
    width: 8px;
    border: 1px solid $neutral-dark-04;
    background-color: transparent;
  }
  swiper-container::part(bullet-active) {
    background-color: $color-yellow;
    border-color: $color-yellow;
  }
  swiper-container::part(container) {
    --swiper-navigation-sides-offset: calc((max(100%, 1440px) - 1440px) / 2 + 10px);
  }

  .hero-skeleton {
    display: flex;
    gap: 16px;

    .skeleton-item {
      height: 480px;

      &:nth-of-type(1) {
        aspect-ratio: 3;
      }
      &:nth-of-type(2) {
        flex-grow: 60;
      }
    }
  }
  .brand-skeleton {
    display: flex;
    gap: 36px;

    .skeleton-item {
      height: 204px;
      flex-grow: 1;
      flex-basis: 100%;

      @include desktop-min-width {
        height: 160px;
        flex-basis: auto;
      }
    }
  }
</style>
