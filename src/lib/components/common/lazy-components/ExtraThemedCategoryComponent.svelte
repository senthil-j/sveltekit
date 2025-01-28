<script>
  import { getCMSComponentsFromHybrisAsync, getUrlWithQueryParams } from '../../../../lib/ajax-services';
  import { isMobile } from '../../../../lib/util';
  import ExtraSwiper from '../components/ExtraSwiper.svelte';
  import ExtraThemedCategorySlideTemplate from '../components/ExtraThemedCategorySlideTemplate.svelte';

  export let metaData;
  export async function onLoad() {
    let linkNames = '';
    linkNames = metaData.cmsLinkList;

    const cmsLinks = linkNames?.split(' ');

    const urlParams = getCMSComponentsFromHybrisAsync(cmsLinks);
    const apiUrl = await getUrlWithQueryParams(urlParams.url, urlParams.params);
    
    await fetch(apiUrl)
    .then((res) => res.json())
      .then(res => {console.log(res, 'themed res'); return res.component})
      .then(
        links =>
          (themedLinks = links.map(v => ({
            ...v,
            themeIcon: metaData.iconUrl,
          })))
      )
      .then(() => {
        loaded = true;
      });
  }

  let loaded = false;
  let themedLinks = [];

  $: isResponsive = isMobile();
  $: spaceBetween = isResponsive ? 12 : 32;
  $: slidesPerView = 'auto';

  $: swiperOptions = getSwiperOptions(slidesPerView, spaceBetween);

  function getSwiperOptions(slidesPerView, spaceBetween) {
    return {
      slidesPerView,
      spaceBetween,
    };
  }
</script>

<section class="themed-category-container py80" class:px48={!loaded}>
  {#if loaded}
    {#if metaData?.title}
      <h2 class="px48">{metaData?.title}</h2>
    {/if}
    {#if metaData?.description}
      <p class="px48">{metaData?.description}</p>
    {/if}

    <ExtraSwiper
      initialHeightForCLS="250px"
      slidesData={themedLinks}
      slideTemplate={ExtraThemedCategorySlideTemplate}
      {swiperOptions}
    />
  {:else}
    <h2 class="skeleton-item w-25 px48" class:w-50={isResponsive}>&nbsp;</h2>
    <p class="skeleton-item w-10" class:w-25={isResponsive}>&nbsp;</p>
    <section class="tiles skeleton-container">
      <section class="tiles skeleton-item"></section>
      <section class="tiles skeleton-item"></section>
      <section class="tiles skeleton-item"></section>
      <section class="tiles skeleton-item"></section>
    </section>
  {/if}
</section>

<style lang="scss">
  @import '../styles/colors.new.scss';

  $theme-icon-size: 32px;

  .themed-category-container {
    /*
    :global {
      .swiper-wrapper .swiper-slide {
        width: fit-content !important;
      }
      & > h2,
      & > p {
        margin: 0;
        text-align: center;

        @include desktop-min-width {
          text-align: unset;
        }
      }
      & > h2 {
        font-size: 20px;
        font-weight: 700;
        line-height: 22px;
        color: $primary-black;

        @include desktop-min-width {
          font-size: 36px;
          line-height: 40px;
        }
      }
      & > p {
        font-size: 14px;
        font-weight: 400;
        line-height: 16px;
        color: $neutral-dark-02;

        @include desktop-min-width {
          font-size: 18px;
          line-height: 20px;
        }
      }
      .swiper-slide {
        margin-top: $theme-icon-size;

        &:first-child {
          margin-left: 16px;

          @include desktop-min-width {
            margin-left: 48px;
          }
        }
        &:last-child {
          margin-right: 16px;

          @include desktop-min-width {
            margin-right: 48px;
          }
        }
      }
    }
      */

    .skeleton-container {
      padding-top: 32px;
      display: flex;
      gap: 12px;

      @include desktop-min-width {
        gap: 32px;
      }
      .skeleton-item {
        width: 132px;
        height: 160px;
        border-radius: 8px;

        @include desktop-min-width {
          width: 192px;
          height: 220px;
        }
      }
    }
    h2.skeleton-item {
      margin-inline: auto;

      @include desktop-min-width {
        margin-inline: 0;
      }
    }
    p.skeleton-item {
      margin-inline: auto;
      margin-top: 4px;

      @include desktop-min-width {
        margin-inline: 0;
        margin-top: 8px;
      }
    }
  }
</style>
