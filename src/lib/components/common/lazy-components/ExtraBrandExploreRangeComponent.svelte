<script lang="ts">
  import Select, { Option } from '@smui/select';
  import { fade } from 'svelte/transition';
  import type { SwiperOptions } from 'swiper/types';
  import { getAppConfig } from '../../../common/config/app-config';
  import { getStr, isMobileWidth, unxGetKeysFromFacetValues } from '../../../common/util';
  import { exploreBrandRangeSectionFacets, perPageCount } from '../../brand/services/brand-component-mapper';
  import {
    brandGtmFilterEvent,
    brandGtmSortEvent,
    categoryCodeParser,
    createFacetFilter,
    createPriceFilter,
    getPageFromUrl,
    priceFilterRange,
  } from '../../brand/services/brand-data-services';
  import {
    activeCategoryBrandPage,
    activeCategoryObj,
    alreadyFetchedCategoryData,
    brandActiveFilters,
    brandFacetFilters,
    brandPriceFilters,
    brandSelectedSort,
    selectedPriceFilter,
  } from '../../brand/store/brand_store';
  import FilterChip from '../../common/components/FilterChip.svelte';
  import Text from '../../common/components/Text.svelte';
  import {
    getProductsByRuleContextFromAlgoliaAsync,
    getProductsByUrlFromAlgoliaAsync,
    OPTION_FACET_FILTER,
    OPTION_FACETS,
    OPTION_HITS_PAGE,
    OPTION_HITS_PER_PAGE,
    OPTION_INDEX_SUFFIX,
    OPTION_OPTIONAL_FILTERS,
    OPTION_PRICE_FILTER,
    parseAlgoliaUrl,
  } from '../../common/services/algolia';
  import { getCMSComponentsFromHybrisAsync } from '../../common/services/hybris';
  import ExtraBrandRangeCategorySlideTemplate from '../components/ExtraBrandRangeCategorySlideTemplate.svelte';
  import ExtraProductTileSlideTemplate from '../components/ExtraProductTileSlideTemplate.svelte';
  import ExtraSwiper from '../components/ExtraSwiper.svelte';
  import viewport from '../components/useViewportAction';
  import ActiveFilter from './child-helpers/ActiveFilter.svelte';
  import FilterTag from './child-helpers/FilterTag.svelte';

  export let metaData: any;

  let loaded = false;
  $: isResponsive = isMobileWidth();
  $: wrapAfter = +metaData?.wrapAfter ? +metaData?.wrapAfter : perPageCount;

  const { lang, encodedContextPath = 'en-sa', unbxdEnabled } = getAppConfig();
  const {
    algoliaConfig: { sorts },
  } = getAppConfig();
  let selectedSortOption = sorts[0];
  let value;
  let isRuleNameExists = false;
  $: productTileSwiperOptions = getSwiperOptions(isResponsive ? 2 : 4, 16);
  $: categoryTileSwiperOptions = getSwiperOptions(isResponsive ? 2 : 'auto', 12);

  function getSwiperOptions(slides, space): SwiperOptions {
    return {
      slidesPerView: slides,
      spaceBetween: space,
      navigation: !isResponsive,
      on: {
        realIndexChange: onSlideChange,
      },
    };
  }

  export function onLoad() {
    let linkNames = '';
    if ('cmsLinks' in metaData) linkNames = metaData.cmsLinks;
    else if ('cmsLinkList' in metaData) linkNames = metaData.cmsLinkList;
    else if ('children' in metaData) linkNames = metaData.children;
    const cmsLinks = linkNames.split(' ');
    getCMSComponentsFromHybrisAsync(cmsLinks)
      .then(res => res.component)
      .then(links => (productCatoryList = links))
      .then(() => {
        let brandQuery;
        brandQuery =
          productCatoryList[0]?.algoliaRuleName?.length > 0
            ? productCatoryList[0]?.algoliaRuleName
            : productCatoryList[0]?.url;
        isRuleNameExists = productCatoryList[0].algoliaRuleName?.length > 0 ? true : false;
        fetchBrandCategoryDataFromAlgolia(brandQuery);
        $activeCategoryBrandPage = productCatoryList[0]?.linkName;
        loaded = true;
      });
  }
  function onViewSlider(productData) {
    if (productData.length > 0) {
      window['ACC'].extragtm.click.trackViewList('', '', productData);
    }
  }
  let productCatoryList = [];
  let productData = [];
  let subFamilyFacetList = [];
  let priceFacetList = [];
  let categoryCacheData = {};
  let currentCatId: string = '';
  let productHitsLoaded: boolean = false;

  function fetchBrandCategoryDataFromAlgolia(
    catQuery = '',
    facetFilter = [],
    numericFilter = [],
    priceFilterRefreshRequired = true,
    subFilterRefreshRequired = true,
    alogoliaCallRequired = false,
    sortVal = ''
  ) {
    productHitsLoaded = false;
    currentCatId = catQuery;

    categoryCacheData = $alreadyFetchedCategoryData.find(o => o.algoliaUrl === catQuery);

    if (categoryCacheData !== undefined && !alogoliaCallRequired) {
      productData = categoryCacheData['productData'];
      priceFacetList = categoryCacheData['priceFacetList'];
      subFamilyFacetList = categoryCacheData['subFamilyFacetList'];
      productHitsLoaded = true;
    } else {
      const getAlgoliaProducts = async (isRuleNameExists, options) => {
        const commonOptions = {
          facets: OPTION_FACETS(options.exploreBrandRangeSectionFacets),
          facetFilter: OPTION_FACET_FILTER(options.facetFilter),
          priceFilter: OPTION_PRICE_FILTER(options.numericFilter),
          optionalFilters: OPTION_OPTIONAL_FILTERS(parseAlgoliaUrl(options.catQuery)),
          hitsPerPage: OPTION_HITS_PER_PAGE(options.wrapAfter),
          page: OPTION_HITS_PAGE(getPageFromUrl(options.catQuery)),
          indexSuffix: OPTION_INDEX_SUFFIX(options.sortVal),
        };

        try {
          const fetchMethod = isRuleNameExists
            ? getProductsByRuleContextFromAlgoliaAsync
            : getProductsByUrlFromAlgoliaAsync;

          return await fetchMethod(
            options.catQuery,
            commonOptions.facets,
            commonOptions.facetFilter,
            commonOptions.priceFilter,
            commonOptions.optionalFilters,
            commonOptions.hitsPerPage,
            commonOptions.page,
            commonOptions.indexSuffix
          );
        } catch (error) {
          console.error('Error fetching Algolia products:', error);
          throw error;
        }
      };
      const options = {
        catQuery,
        exploreBrandRangeSectionFacets,
        facetFilter,
        numericFilter,
        wrapAfter,
        sortVal,
      };
      getAlgoliaProducts(isRuleNameExists, options)
        .then((res: any) => {
          console.log(res, '---res---');
          if ('facets' in res && priceFilterRefreshRequired) {
            priceFacetList = unbxdEnabled
              ? priceFilterRange(
                  unxGetKeysFromFacetValues(
                    res.facets?.range?.list?.find(x => x.facetName === 'price')?.values?.counts
                  ),
                  4
                )
              : Object.keys(res?.facets).length
                ? priceFilterRange(Object.keys(res?.facets?.price), 4)
                : [];
          }
          if ('facets' in res && subFilterRefreshRequired) {
            subFamilyFacetList = unbxdEnabled
              ? unxGetKeysFromFacetValues(
                  res.facets?.text?.list?.find(x => x.facetName === 'subFamilyEn_uFilter')?.values
                )
              : Object.keys(res?.facets).length
                ? lang === 'en'
                  ? Object.keys(res?.facets?.subFamilyEn)
                  : Object.keys(res?.facets?.subFamilyAr)
                : [];
          }
          if ('hits' in res) {
            productData = res?.hits.length ? res.hits : [];
            $activeCategoryObj = Object.assign(
              {},
              {
                algoliaUrl: catQuery,
                productData: productData,
                catId: categoryCodeParser(currentCatId),
                subFamilyFacetList: subFamilyFacetList,
                priceFacetList: priceFacetList,
              }
            );
            productHitsLoaded = true;
          } else {
          }
          $alreadyFetchedCategoryData.push($activeCategoryObj);
        })
        .catch(er => (productHitsLoaded = false))
        .finally(() => (productHitsLoaded = true));
    }
  }

  function onCategoryChange(data) {
    let Query = data?.carouselRuleName?.length > 0 ? data.carouselRuleName : data.algoliaQuery;
    $activeCategoryBrandPage = data.categoryName;
    $brandSelectedSort = '';
    value = '';
    $selectedPriceFilter = [];
    $brandFacetFilters = [];
    $brandActiveFilters = [];
    fetchBrandCategoryDataFromAlgolia(Query, [], [], true, true, true, $brandSelectedSort);
  }

  function subFilterClicked(data) {
    fetchBrandCategoryDataFromAlgolia(
      currentCatId,
      [createFacetFilter(lang === 'en' ? 'subFamilyEn' : 'subFamilyAr', data.chipName)],
      $brandPriceFilters.length > 0 ? $brandPriceFilters : [],
      false,
      false,
      true,
      $brandSelectedSort
    );
    brandGtmFilterEvent(lang === 'en' ? 'subFamilyEn' : 'subFamilyAr', '');
  }

  function priceFilterClick(data) {
    fetchBrandCategoryDataFromAlgolia(
      currentCatId,
      $brandFacetFilters.length > 0 ? [$brandFacetFilters] : [],
      createPriceFilter(data.rangeStart, data.rangeEnd),
      false,
      false,
      true,
      $brandSelectedSort
    );
    brandGtmFilterEvent('price', '');
  }

  function sortClicked(data) {
    $brandSelectedSort = data === 'Relevance' ? '' : data;
    fetchBrandCategoryDataFromAlgolia(
      currentCatId,
      $brandFacetFilters.length > 0 ? [$brandFacetFilters] : [],
      $brandPriceFilters.length > 0 ? $brandPriceFilters : [],
      false,
      false,
      true,
      $brandSelectedSort
    );
    brandGtmSortEvent(data);
  }

  function activeFilterRemoveClick(data) {
    let priceRange;
    if (data.subCategory === 'price') {
      priceRange = data.filterToBeRemoved.split('<strong>')[1].split('-');
      createPriceFilter(priceRange[0], priceRange[1].split('</strong>')[0]);
      $selectedPriceFilter = $selectedPriceFilter.filter(
        x => x !== `${+priceRange[0]} - ${+priceRange[1].split('</strong>')[0]}`
      );
    } else {
      createFacetFilter(lang === 'en' ? 'subFamilyEn' : 'subFamilyAr', data.filterToBeRemoved);
    }
    fetchBrandCategoryDataFromAlgolia(
      currentCatId,
      $brandFacetFilters.length > 0 ? [$brandFacetFilters] : [],
      $brandPriceFilters.length > 0 ? $brandPriceFilters : [],
      false,
      false,
      true
    );
  }

  function allFilterRemoveClick() {
    $brandSelectedSort = '';
    value = '';
    $selectedPriceFilter = [];
    $brandFacetFilters = [];
    fetchBrandCategoryDataFromAlgolia(currentCatId, [], [], true, true, true, $brandSelectedSort);
  }

  function selectClosing(e) {
    if (isMobileWidth()) {
      let ele: any = document.getElementsByClassName('filter-container')[0];
      ele.style.overflowX = 'scroll';
    }
  }

  function selectOpen(e) {
    if (isMobileWidth()) {
      let ele: any = document.getElementsByClassName('filter-container')[0];
      ele.style.overflowX = 'clip';
    }
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
</script>

<section class="product-range-container" use:viewport on:enterViewport={() => loaded && onViewSlider(productData)}>
  {#if loaded}
    {#if metaData && metaData.title}
      <h2 class="product-range-title">{metaData?.title}</h2>
    {/if}
    <ExtraSwiper
      slidesData={productCatoryList}
      slideTemplate={ExtraBrandRangeCategorySlideTemplate}
      swiperOptions={categoryTileSwiperOptions}
      on:click={e => onCategoryChange(e.detail)}
    />
    <h5>
      <Text key="extra.showing.product.text" args={[(productData?.length).toString(), $activeCategoryBrandPage]} />
    </h5>
    <div class="filter-container">
      {#if priceFacetList.length || subFamilyFacetList.length}
        <div class="brand-sort-filter">
          <Select
            class="shaped-outlined"
            variant="outlined"
            bind:value
            label={getStr('search.page.sortTitle')}
            on:SMUIMenuSurface:closing={selectClosing}
            on:SMUIMenuSurface:opened={selectOpen}
          >
            {#each sorts as sort}
              <Option
                value={sort?.sortSuffix ? sort?.sortSuffix : sort?.name}
                on:click={() => sortClicked(sort?.sortSuffix ? sort?.sortSuffix : sort?.name)}>{sort?.name}</Option
              >
            {/each}
          </Select>
        </div>
      {/if}
      {#if priceFacetList.length}
        <FilterTag
          options={priceFacetList}
          label={getStr('extra.price.text')}
          on:priceFilterClicked={e => priceFilterClick(e.detail)}
        />
      {/if}
      {#each subFamilyFacetList.slice(0, 5) as subFamilyFacet, i}
        <FilterChip chipName={subFamilyFacet} on:filterChipClicked={e => subFilterClicked(e.detail)} />
      {/each}
    </div>
    <ActiveFilter
      on:activeFilterRemoved={e => activeFilterRemoveClick(e.detail)}
      on:allFilterRemoved={() => allFilterRemoveClick()}
    />
    {#if !productHitsLoaded}
      <div class="skeleton-loader-container">
        <div class="skeleton-item" in:fade></div>
        <div class="skeleton-item" in:fade></div>
        <div class="skeleton-item" in:fade></div>
        <div class="skeleton-item" in:fade></div>
        <div class="skeleton-item" in:fade></div>
      </div>
    {:else if productData.length > 0}
      <ExtraSwiper
        slidesData={productData}
        slideTemplate={ExtraProductTileSlideTemplate}
        swiperOptions={productTileSwiperOptions}
      />
    {:else}
      <div class="no-product-container">
        <Text key="extrabrand.no.product" />
      </div>
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
      .category-container {
        border: 1px solid $secondary-gray-02;
        border-radius: 12px;

        &:hover {
          border: 1px solid $tertiary-blue-02;
        }
      }
      .active {
        border: 1px solid $tertiary-blue-02;
        border-radius: 12px;
      }
      .swiper-slide {
        height: auto;
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
    h5 {
      color: $neutral-dark-01;
      font-size: 18px;
      font-style: normal;
      font-weight: 400;
      line-height: 20px;
      margin: 40px 0 20px 0;
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
    swiper-container {
      display: flex;
      height: 100%;
    }
    swiper-container::part(wrapper) {
      height: auto;
    }
    swiper-container::part(container) {
      display: flex;
    }
  }
</style>
