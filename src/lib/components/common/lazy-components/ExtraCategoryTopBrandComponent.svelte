<script lang="ts">
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { fade } from 'svelte/transition';
  import type { SwiperOptions } from 'swiper/types';
  import { getAppConfig } from '../../../common/config/app-config';
  import { isMobileWidth } from '../../../common/util';
  import ExtraCategoryBrandSlideTemplate from '../components/ExtraCategoryBrandSlideTemplate.svelte';
  import ExtraProductTileSlideTemplate from '../components/ExtraProductTileSlideTemplate.svelte';
  import ExtraSwiper from '../components/ExtraSwiper.svelte';
  import Text from '../components/Text.svelte';
  import {
    OPTION_HITS_PER_PAGE,
    getProductsByRuleContextFromAlgoliaAsync,
    getProductsByUrlFromAlgoliaAsync,
  } from '../services/algolia';
  import { getCMSComponentsFromHybrisAsync } from '../services/hybris';

  let brandSelectedUrl = writable([]);
  let activeCategoryBrandPage = writable([]);
  let brandActiveFilters: any = writable([]);
  let brandFacetFilters: any = writable([]);
  let brandSelectedSort: any = writable([]);
  let selectedPriceFilter: any = writable([]);
  setContext('stores', {
    brandSelectedUrl,
    activeCategoryBrandPage,
    brandActiveFilters,
    brandFacetFilters,
    brandSelectedSort,
    selectedPriceFilter,
  });

  export let metaData: any;

  let loaded = false;
  let hitsCount: string = '';
  let isRuleNameExists = false;

  $: isResponsive = isMobileWidth();
  $: productTileSwiperOptions = getSwiperOptions(isResponsive ? 2 : 'auto', 16);
  $: categoryTileSwiperOptions = getSwiperOptions(isResponsive ? 2 : 7, 12);

  function getSwiperOptions(slides, space): SwiperOptions {
    return {
      slidesPerView: slides,
      touchReleaseOnEdges: true,
      spaceBetween: space,
      navigation: !isResponsive,
      on: {
        realIndexChange: onSlideChange,
      },
    };
  }
  const { lang, encodedContextPath = 'en-sa' } = getAppConfig();

  export function onLoad() {
    let linkNames = '';
    if ('logoComponents' in metaData) linkNames = metaData.logoComponents;

    const cmsLinks = linkNames.split(' ');
    getCMSComponentsFromHybrisAsync(cmsLinks)
      .then(res => res.component)
      .then(links => (productCatoryList = links))
      .then(() => {
        let brandQuery;
        brandQuery =
          productCatoryList[0].carouselRuleName?.length > 0
            ? productCatoryList[0].carouselRuleName
            : productCatoryList[0].algoliaUrl;
        isRuleNameExists = productCatoryList[0].carouselRuleName?.length > 0 ? true : false;

        fetchBrandCategoryDataFromAlgolia(brandQuery, productCatoryList[0]?.maxResultCount);
        $activeCategoryBrandPage = productCatoryList[0]?.logoName;
        $brandSelectedUrl = productCatoryList[0]?.viewAllLinkUrl;
        loaded = true;
      });
  }
  export function onViewport() {
    if (productData.length > 0) {
      window['ACC'].extragtm.click.trackViewList('', '', productData);
    }
  }
  let productCatoryList = [];
  let productData = [];
  let currentCatId: string = '';
  let productHitsLoaded: boolean = false;

  let categoryDataCache = {};
  let activeCategoryData = null;

  function fetchBrandCategoryDataFromAlgolia(catQuery = '', hitsCount) {
    productHitsLoaded = false;
    currentCatId = catQuery;

    activeCategoryData = null;
    if (catQuery in categoryDataCache) {
      setTimeout(() => {
        activeCategoryData = categoryDataCache[catQuery];
        productData = activeCategoryData?.hits.length ? activeCategoryData.hits : [];
      });
      productHitsLoaded = true;
    } else {
      (isRuleNameExists
        ? getProductsByRuleContextFromAlgoliaAsync(catQuery, OPTION_HITS_PER_PAGE(hitsCount))
        : getProductsByUrlFromAlgoliaAsync(catQuery, OPTION_HITS_PER_PAGE(hitsCount))
      )
        .then((res: any) => {
          if ('hits' in res) {
            productData = res?.hits.length ? res.hits : [];
            productHitsLoaded = true;
            categoryDataCache[catQuery] = res;
            activeCategoryData = categoryDataCache[catQuery];
          } else {
          }
        })
        .then(() => Object.assign({}, { className: 'no-divider' }))
        .catch(er => (productHitsLoaded = false))
        .finally(() => (productHitsLoaded = true));
    }
  }

  function onCategoryChange(data) {
    let Query = data?.carouselRuleName?.length > 0 ? data.carouselRuleName : data.algoliaQuery;
    isRuleNameExists = data?.carouselRuleName?.length > 0 ? true : false;

    productSlideChange();
    $activeCategoryBrandPage = data.categoryName;
    $brandSelectedSort = '';
    $brandSelectedUrl = data.brandUrl;
    $selectedPriceFilter = [];
    $brandFacetFilters = [];
    $brandActiveFilters = [];
    fetchBrandCategoryDataFromAlgolia(Query, data.hitsCount);
  }

  const onSlideChange = e => {
    const [swiper] = e?.detail;
    if (swiper) {
      if (swiper?.navigation?.prevEl?.classList?.contains('swiper-button-disabled')) {
        swiper.navigation.prevEl.style.display = 'none';
      } else {
        swiper.navigation.prevEl.style.display = 'block';
      }
      if (swiper?.navigation?.nextEl?.classList?.contains('swiper-button-disabled')) {
        swiper.navigation.nextEl.style.display = 'none';
      } else {
        swiper.navigation.nextEl.style.display = 'block';
      }
    }
  };

  const productSlideChange = () => {
    const swiperEls = document.querySelectorAll('swiper-container');
    for (const swiperEl of swiperEls) {
      if (swiperEl.classList.contains('top-brand-swiper-container')) {
        swiperEl.swiper.slideTo(0);
        break;
      }
    }
  };
</script>

<section class="product-range-container">
  {#if loaded}
    {#if metaData && metaData.title}
      <h2 class="product-range-title">{metaData?.title}</h2>
    {/if}
    <ExtraSwiper
      slidesData={productCatoryList}
      slideTemplate={ExtraCategoryBrandSlideTemplate}
      swiperOptions={categoryTileSwiperOptions}
      on:click={e => onCategoryChange(e.detail)}
    />
    <div class="viewall-products-wrapper">
      {#if metaData.searchResultText}
        <h5>
          {metaData?.searchResultText?.replace('{0}', '')}
          {(productData?.length).toString()}
          <strong>{$activeCategoryBrandPage}</strong>
          <!-- <Text key="extra.showing.product.text" args={[(productData?.length).toString(), $activeCategoryBrandPage]}/> -->
        </h5>
      {/if}
      {#if !isResponsive && metaData?.viewAllText}
        <a class="viewall-link" href={encodedContextPath + $brandSelectedUrl}>{metaData?.viewAllText}</a>
      {/if}
    </div>
    {#if !productHitsLoaded}
      <div class="skeleton-loader-container">
        <div class="skeleton-item" in:fade></div>
        <div class="skeleton-item" in:fade></div>
        <div class="skeleton-item" in:fade></div>
        <div class="skeleton-item" in:fade></div>
        <div class="skeleton-item" in:fade></div>
      </div>
    {:else}
      {#if productData?.length > 0}
        <ExtraSwiper
          slidesData={productData}
          slideTemplate={ExtraProductTileSlideTemplate}
          swiperOptions={productTileSwiperOptions}
          swiperClass="top-brand-swiper-container"
        />
      {:else}
        <div class="no-product-container">
          <Text key="extrabrand.no.product" />
        </div>
      {/if}
      {#if isResponsive && metaData?.viewAllText}
        <div class="res-link">
          <a class="viewall-link" href={encodedContextPath + $brandSelectedUrl}>{metaData?.viewAllText}</a>
        </div>
      {/if}
    {/if}
  {/if}
</section>

<style lang="scss">
  @import '../../common/styles/colors.new.scss';

  .product-range-container {
    width: 100%;
    padding: 80px 48px;
    @include desktop-max-width {
      padding: 40px 16px;
    }
    :global {
      .top-brand-swiper-container {
        display: flex;
        height: 100%;
        .swiper-wrapper {
          height: auto;
        }
        .swiper-button-next {
          transform: rotate(90deg);
        }
        .swiper-button-prev {
          transform: rotate(-90deg);
        }
      }
      swiper-container::part(wrapper) {
        height: auto;
      }
      swiper-container::part(container) {
        display: flex;
      }
      .category-container {
        border: 1px solid $secondary-gray-02;
        border-radius: 12px;

        &:hover {
          border: 1px solid $tertiary-blue-02;
        }
        .product-category-container {
          flex-direction: row;
        }
      }
      .active {
        border: 1px solid $tertiary-blue-02;
      }
    }
    .product-range-title {
      font-size: 36px;
      font-style: normal;
      font-weight: 700;
      line-height: 40px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
    .viewall-products-wrapper {
      margin: 40px 0 20px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .viewall-link {
      font-size: 14px;
      font-weight: 700;
      color: $primary-blue;
      border: 1px solid $primary-blue;
      border-radius: 100px;
      padding: 10px 24px;
      margin-left: auto;
    }
    .res-link {
      margin-top: 20px;
      display: flex;
      .viewall-link {
        width: 100%;
        padding: 15px 36px;
        text-align: center;
      }
    }
    h5 {
      color: $neutral-dark-01;
      font-size: 18px;
      font-style: normal;
      font-weight: 400;
      line-height: 20px;
    }
    .link {
      display: flex;
    }
    .filter-container {
      display: flex;
      padding-bottom: 20px;
      gap: 16px;

      &::-webkit-scrollbar {
        display: none;
      }
      @include desktop-max-width {
        overflow-x: scroll;
      }
      .brand-sort-filter {
        padding-right: 20px;
        border-right: 1px solid $secondary-gray-02;
      }
    }
    .chip-slider {
      margin: 0 16px;
    }
    :global {
      .tile-content-wrapper {
        display: flex;
        flex-direction: column;
        height: 100% !important;
        .product-tile-container {
          flex: 1;
        }
      }
    }
    * :global(.shaped-outlined),
    * :global(.shaped-outlined .mdc-select__anchor) {
      border-radius: 28px;
      height: 42px;
      background: $secondary-gray-02;
      width: 120px;
      z-index: 2;
    }
    * :global(.shaped-outlined .mdc-text-field__input) {
      padding-left: 32px;
      padding-right: 0;
    }
    * :global(.shaped-outlined .mdc-notched-outline .mdc-notched-outline__leading) {
      border-radius: 28px 0 0 28px;
      width: 20px;
      border-right: none;
      border-left: 1px solid rgba(0, 0, 0, 0.38);
    }
    * :global(.shaped-outlined .mdc-notched-outline .mdc-notched-outline__trailing) {
      border-radius: 0 28px 28px 0;
      border-right: 1px solid rgba(0, 0, 0, 0.38);
      border-left: none;
    }
    * :global(.shaped-outlined .mdc-notched-outline .mdc-notched-outline__notch) {
      max-width: calc(100% - 28px * 2);
    }
    *
      :global(
        .shaped-outlined.mdc-select--with-leading-icon
          .mdc-notched-outline:not(.mdc-notched-outline--notched)
          .mdc-floating-label
      ) {
      left: 16px;
    }
    * :global(.shaped-outlined .mdc-notched-outline .mdc-notched-outline__notch .mdc-floating-label) {
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      line-height: 18px;
      color: $neutral-dark-01;
    }
    * :global(.mdc-select--outlined .mdc-menu-surface) {
      border-radius: 10px;
      border: 1px solid $secondary-gray-02;
      background: $primary-white;
      width: 224px;
      box-shadow: 0px 4px 12px 0px rgba(219, 227, 232, 0.6);
      top: 56px !important;
    }
    * :global(.mdc-deprecated-list) {
      display: inline-flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
      width: 100%;
      margin-top: 20px;
    }
    * :global(.mdc-select .mdc-select__menu .mdc-deprecated-list-item) {
      width: 100%;
      //   height: 20px;
    }
    * :global(.tile-image-container img) {
      min-height: 268px;
      @include desktop-max-width {
        min-height: 130px;
      }
    }
    swiper-slide {
      width: fit-content !important;
      display: flex;
      height: 100%;
    }
    .skeleton-loader-container {
      display: flex;
      gap: 16px;
      .skeleton-item {
        height: 513px;
        width: 300px;
        border-radius: 12px;
        @include desktop-max-width {
          height: 322px;
          width: 170px;
        }
      }
    }
    .no-product-container {
      font-size: 30px;
      font-weight: bold;
      @include desktop-max-width {
        font-size: 16px;
      }
    }
    * :global(.mdc-select--focused .mdc-menu-surface--open) {
      display: inline-table;
      z-index: 2;
    }
  }
</style>
