<script>
  import { fade } from 'svelte/transition';
  import { getCMSComponentsFromHybrisAsync, getUrlWithQueryParams } from '../.././../../lib/ajax-services';
  import ExtraSwiper from '../components/ExtraSwiper.svelte';
  import CmsLinkComponent from './CMSLinkComponent.svelte';

  export let metaData;

  let loaded = false;
  let cmsLinksData;
  export function onLoad() {
    return loadComponent();
  }
  async function loadComponent() {
    const cmsLinks = metaData?.cmsLinks;
    if (!cmsLinks) {
      return false;
    }
    const urlParams = getCMSComponentsFromHybrisAsync(cmsLinks.split(' '));
    const apiUrl = await getUrlWithQueryParams(urlParams.url, urlParams.params);
    
    return fetch(apiUrl)
    .then((linkResponse) => linkResponse.json())
      .then((res) => res.component)
      .then(
        compArray =>
          (cmsLinksData = compArray.map(v => ({
            ...v,
            ...metaData,
          })))
      )
      .then(ld => (loaded = ld.length > 0));
  }
  $: styleClasses = metaData?.styleClasses;
  $: isHeaderTiles = styleClasses?.indexOf('headerTiles') > -1;
  $: isPolicyLinks = styleClasses?.indexOf('policyLinks') > -1;
  $: swiperOptions = getSwiperOptions();

  function getSwiperOptions(){
    return {
      navigation: true,
      slidesPerView: 'auto',
      spaceBetween: 12,
      freeMode: true,
      on: {
        init: onProgress,
      },
    };
  }

  const swiperArrowDisplay = (element, condition) => {
    element.style.display = condition ? 'none' : 'inline-flex';
  };

  const onProgress = swiper => {
    
    const { prevEl, nextEl } = swiper?.navigation || {};

    [prevEl, nextEl].forEach(el => {
      if (el) swiperArrowDisplay(el, el.classList.contains('swiper-button-disabled'));
    });
  };
</script>

{#if isHeaderTiles}
  <section class="external-links-container header-tiles px48">
    {#if loaded}
      <ExtraSwiper
        slidesData={cmsLinksData}
        slideTemplate={CmsLinkComponent}
        {swiperOptions}
        swiperClass="external-links-swiper"
      />
    {:else}
      <div class="skeleton-container">
        <div class="skeleton-item">&nbsp;</div>
        <div class="skeleton-item">&nbsp;</div>
        <div class="skeleton-item">&nbsp;</div>
        <div class="skeleton-item">&nbsp;</div>
        <div class="skeleton-item">&nbsp;</div>
      </div>
    {/if}
  </section>
{:else if isPolicyLinks}
  <section class="external-links-container policy-links scrollbar-hidden">
    {#if loaded}
      {#each cmsLinksData as cmsLink}
        <CmsLinkComponent data={cmsLink} {styleClasses} />
      {/each}
    {:else}
      <div class="skeleton-container" in:fade>
        <div class="skeleton-item">&nbsp;</div>
        <div class="skeleton-item">&nbsp;</div>
        <div class="skeleton-item">&nbsp;</div>
        <div class="skeleton-item">&nbsp;</div>
        <div class="skeleton-item">&nbsp;</div>
      </div>
    {/if}
  </section>
{/if}

<style lang="scss">
  @import '../styles/colors.new.scss';

  .header-tiles {
    padding-block: 16px;
    @include desktop-min-width {
      padding-block: 36px;
      height: 110px;
    }

    .skeleton-container {
      display: flex;
      gap: 12px;
      .skeleton-item {
        flex-shrink: 0;
        line-height: 24px;
        width: 150px;
        padding: 8px 12px;
        border-radius: 10px;

        @include desktop-min-width {
          line-height: 18px;
          width: 200px;
          padding: 10px 16px;
          border-radius: 100px;
        }
      }
    }
  }
  .policy-links {
    background-color: $neutral-light-03;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-block: 24px 16px;
    padding-inline: 16px;
    gap: 12px;
    overflow: auto hidden;
    flex-wrap: wrap;

    @include desktop-min-width {
      padding-block: 80px;
      padding-inline: 0;
      gap: 60px;
      overflow: unset;
      flex-wrap: nowrap;
    }

    .skeleton-container {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;

      @include desktop-min-width {
        gap: 60px;
        flex-wrap: nowrap;
      }

      .skeleton-item {
        flex-shrink: 0;
        width: 152px;
        height: 148px;
        border-radius: 20px;

        @include desktop-min-width {
          width: 210px;
          height: 195px;
        }
      }
    }
  }
  .external-links-container {
    
    /*
    //sveltekit sass
    :global {
      .swiper-slide {
        width: fit-content;
        display: inline-block;
        position: relative;
      }
      .swiper-button-prev,
      .swiper-button-next {
        top: 12px;
      }
      .extra-swiper-container .swiper-button-next {
        transform: none !important;
        top: 50%;
      }
    }
      */

  }
</style>
