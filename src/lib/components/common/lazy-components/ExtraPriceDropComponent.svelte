<script lang="ts">
  import Select, { Option } from '@smui/select';
  import { fade } from 'svelte/transition';
  import { getAppConfig } from '../../../common/config/app-config';
  import {
    dividePriceRangeIntoNParts,
    getLangSpecificFieldname,
    getStr,
    isMobileWidth,
    unxGetKeysFromFacetValues,
  } from '../../../common/util';
  import { exploreCategoryRangeSectionFacets, perPageCount } from '../../brand/services/brand-component-mapper';
  import {
    createCategoryFacetFilter,
    createCatergoryDiscountFilter,
    createPriceFilterCategory,
    getPageFromUrl,
    getRanges,
    priceFilterRange,
  } from '../../brand/services/brand-data-services';

  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import type { SwiperOptions } from 'swiper/types';
  import Text from '../../common/components/Text.svelte';
  import {
    OPTION_FACETS,
    OPTION_FACET_FILTER,
    OPTION_HITS_PAGE,
    OPTION_HITS_PER_PAGE,
    OPTION_INDEX_SUFFIX,
    OPTION_NUMERIC_FILTER,
    OPTION_RESPONSE_FIELDS,
    getProductsByRuleContextFromAlgoliaAsync,
    getProductsByUrlFromAlgoliaAsync,
  } from '../../common/services/algolia';
  import ExtraProductTileSlideTemplate from '../components/ExtraProductTileSlideTemplate.svelte';
  import ExtraSwiper from '../components/ExtraSwiper.svelte';
  import CategoryActiveFIlter from './child-helpers/CategoryActiveFIlter.svelte';
  import CategoryFilterTag from './child-helpers/CategoryFilterTag.svelte';

  const catFamilyFilter = writable([]);
  const catsubFamilyFilter = writable([]);
  const catBrandFilter = writable([]);
  const selectedBrandFilter = writable([]);
  const categoryActiveFilters = writable([]);
  const catselectedPriceFilter = writable([]);
  const categoryFacetFilters = writable([]);
  const categoryDiscountFilter = writable([]);
  const catDiscountActiveFilters = writable([]);
  const catSubFamilyFacetFilters = writable([]);
  const catFamilyFacetFilters: any = writable([]);
  const catBrandFacetFilters = writable([]);
  const categoryPriceFilters = writable([]);
  const brandSelectedSort = writable('');

  // onMount(() => {
  setContext('stores', {
    catBrandFilter,
    catDiscountActiveFilters,
    catFamilyFilter,
    categoryActiveFilters,
    categoryFacetFilters,
    catselectedPriceFilter,
    catsubFamilyFilter,
    catSubFamilyFacetFilters,
    catFamilyFacetFilters,
    catBrandFacetFilters,
    categoryDiscountFilter,
    categoryPriceFilters,
    brandSelectedSort,
  });
  // })

  export let metaData: any;

  let loaded = false;
  $: isResponsive = isMobileWidth();
  $: wrapAfter = +metaData?.maxProductCount ? +metaData?.maxProductCount : perPageCount;

  const { lang, encodedContextPath = 'en-sa' } = getAppConfig();
  const {
    unbxdEnabled,
    algoliaConfig: { sorts },
  } = getAppConfig();
  let value;
  let ruleNameAlgolia = false;
  $: productTileSwiperOptions = getSwiperOptions();

  function getSwiperOptions(): SwiperOptions {
    return {
      slidesPerView: isResponsive ? 2 : 'auto',
      spaceBetween: 16,
      touchReleaseOnEdges: true,
      navigation: isResponsive ? false : true,
      on: {
        realIndexChange: onSlideChange,
      },
    };
  }

  export function onLoad() {
    let algoliaKey = '';
    if ('algoliaRuleName' in metaData && metaData.algoliaRuleName !== null && metaData.algoliaRuleName !== '') {
      algoliaKey = metaData?.algoliaRuleName;
      ruleNameAlgolia = true;
    } else if ('algoliaUrl' in metaData) algoliaKey = metaData?.algoliaUrl;

    fetchBrandCategoryDataFromAlgolia(algoliaKey);
    loaded = true;
  }
  export function onViewport() {
    if (productData.length > 0) {
      window['ACC'].extragtm.click.trackViewList('', '', productData);
    }
  }
  let productData = [];
  let subFamilyFacetList = [];
  let priceFacetList = [];
  let brandFacetList = [];
  let familyFacetList = [];
  let discountFacetList = [];
  let currentCatId: string = '';
  let productHitsLoaded: boolean = false;

  function fetchBrandCategoryDataFromAlgolia(
    catQuery = '',
    facetFilter = [],
    priceFilter: any = [],
    discountFilterRefreshRequired = true,
    familyfilterRefreshRequired = true,
    brandFilterRefreshRequired = true,
    priceFilterRefreshRequired = true,
    subFilterRefreshRequired = true,
    alogoliaCallRequired = false,
    sortVal = '',
    numericFilter: any = []
  ) {
    productHitsLoaded = false;
    currentCatId = catQuery;

    if (ruleNameAlgolia) {
      getProductsByRuleContextFromAlgoliaAsync(
        catQuery as string,
        OPTION_FACETS(exploreCategoryRangeSectionFacets),
        OPTION_FACET_FILTER(facetFilter),
        OPTION_HITS_PER_PAGE(wrapAfter),
        OPTION_INDEX_SUFFIX(sortVal),
        OPTION_RESPONSE_FIELDS(['facets', 'facets_stats']),
        OPTION_NUMERIC_FILTER([...numericFilter, ...priceFilter])
      )
        .then((res: any) => {
          if ('facets' in res) {
            if (priceFilterRefreshRequired) {
              priceFacetList = unbxdEnabled
                ? dividePriceRangeIntoNParts(res?.facets_stats?.price?.min, res?.facets_stats?.price?.max, 4)
                : Object.keys(res?.facets).length
                  ? priceFilterRange(Object.keys(res?.facets?.price), 4)
                  : [];
            }
            if (subFilterRefreshRequired) {
              subFamilyFacetList = unbxdEnabled
                ? unxGetKeysFromFacetValues(
                    res.facets?.text?.list?.find(
                      x => x.facetName === getLangSpecificFieldname('subFamily', lang, '_uFilter')
                    )?.values
                  )
                : Object.keys(res?.facets).length
                  ? lang === 'en'
                    ? Object.keys(res?.facets?.subFamilyEn)
                    : Object.keys(res?.facets?.subFamilyAr)
                  : [];
            }
            if (familyfilterRefreshRequired) {
              familyFacetList = unbxdEnabled
                ? unxGetKeysFromFacetValues(
                    res.facets?.text?.list?.find(
                      x => x.facetName === getLangSpecificFieldname('family', lang, '_uFilter')
                    )?.values
                  )
                : Object.keys(res?.facets).length
                  ? lang === 'en'
                    ? Object.keys(res?.facets?.familyEn)
                    : Object.keys(res?.facets?.familyAr)
                  : [];
            }

            if (brandFilterRefreshRequired) {
              brandFacetList = unbxdEnabled
                ? unxGetKeysFromFacetValues(
                    res.facets?.text?.list?.find(
                      x => x.facetName === getLangSpecificFieldname('brand', lang, '_uFilter')
                    )?.values
                  )
                : Object.keys(res?.facets).length
                  ? lang === 'en'
                    ? Object.keys(res?.facets?.brandEn)
                    : Object.keys(res?.facets?.brandAr)
                  : [];
            }

            if (discountFilterRefreshRequired) {
              discountFacetList = unbxdEnabled
                ? getRanges(
                    unxGetKeysFromFacetValues(
                      res.facets?.range?.list?.find(x => x.facetName === 'priceValueDiscountPercentage')?.values?.counts
                    ),
                    4
                  )
                : Object.keys(res?.facets).length
                  ? getRanges(Object.keys(res?.facets?.priceValueDiscountPercentage), 4)
                  : [];
            }
          }
          if ('hits' in res) {
            productData = res?.hits.length ? res.hits : [];
            productHitsLoaded = true;
          } else {
          }
        })
        .catch(er => (productHitsLoaded = false))
        .finally(() => (productHitsLoaded = true));
    } else {
      getProductsByUrlFromAlgoliaAsync(
        catQuery,
        OPTION_FACETS(exploreCategoryRangeSectionFacets),
        OPTION_FACET_FILTER(facetFilter),
        OPTION_HITS_PER_PAGE(wrapAfter),
        OPTION_HITS_PAGE(getPageFromUrl(catQuery)),
        OPTION_INDEX_SUFFIX(sortVal),
        OPTION_RESPONSE_FIELDS(['facets', 'facets_stats']),
        OPTION_NUMERIC_FILTER([...numericFilter, ...priceFilter])
      )
        .then((res: any) => {
          if ('hits' in res) {
            productData = res?.hits.length ? res.hits : [];
            productHitsLoaded = true;
          }
          if ('facets' in res) {
            if (priceFilterRefreshRequired) {
              priceFacetList = unbxdEnabled
                ? dividePriceRangeIntoNParts(res?.facets_stats?.price?.min, res?.facets_stats?.price?.max, 4)
                : Object.keys(res?.facets).length
                  ? priceFilterRange(Object.keys(res?.facets?.price), 4)
                  : [];
            }
            if (subFilterRefreshRequired) {
              subFamilyFacetList = unbxdEnabled
                ? unxGetKeysFromFacetValues(
                    res.facets?.text?.list?.find(
                      x => x.facetName === getLangSpecificFieldname('subFamily', lang, '_uFilter')
                    )?.values
                  )
                : Object.keys(res?.facets).length
                  ? lang === 'en'
                    ? Object.keys(res?.facets?.subFamilyEn)
                    : Object.keys(res?.facets?.subFamilyAr)
                  : [];
            }
            if (familyfilterRefreshRequired) {
              familyFacetList = unbxdEnabled
                ? unxGetKeysFromFacetValues(
                    res.facets?.text?.list?.find(
                      x => x.facetName === getLangSpecificFieldname('family', lang, '_uFilter')
                    )?.values
                  )
                : Object.keys(res?.facets).length
                  ? lang === 'en'
                    ? Object.keys(res?.facets?.familyEn)
                    : Object.keys(res?.facets?.familyAr)
                  : [];
            }

            if (brandFilterRefreshRequired) {
              brandFacetList = unbxdEnabled
                ? unxGetKeysFromFacetValues(
                    res.facets?.text?.list?.find(
                      x => x.facetName === getLangSpecificFieldname('brand', lang, '_uFilter')
                    )?.values
                  )
                : Object.keys(res?.facets).length
                  ? lang === 'en'
                    ? Object.keys(res?.facets?.brandEn)
                    : Object.keys(res?.facets?.brandAr)
                  : [];
            }

            if (discountFilterRefreshRequired) {
              discountFacetList = unbxdEnabled
                ? getRanges(
                    unxGetKeysFromFacetValues(
                      res.facets?.range?.list?.find(x => x.facetName === 'priceValueDiscountPercentage')?.values?.counts
                    ),
                    4
                  )
                : Object.keys(res?.facets).length
                  ? getRanges(Object.keys(res?.facets?.priceValueDiscountPercentage), 4)
                  : [];
            }
          }
        })
        .catch(er => (productHitsLoaded = false))
        .finally(() => (productHitsLoaded = true));
    }
  }

  const familyFilterClick = data => {
    if (!$catFamilyFacetFilters.some(item => item.includes(data))) {
      $catFamilyFacetFilters = [];
      ($catSubFamilyFacetFilters = []), ($categoryActiveFilters = []);
      $categoryPriceFilters = [];
      $catBrandFacetFilters = [];
      $catDiscountActiveFilters = [];
      $categoryDiscountFilter = [];
      $catsubFamilyFilter = [];
      $catselectedPriceFilter = [];
      $catBrandFilter = [];

      fetchBrandCategoryDataFromAlgolia(
        currentCatId,
        [
          createCategoryFacetFilter(
            lang === 'en' ? 'familyEn' : 'familyAr',
            data,
            catFamilyFacetFilters,
            catSubFamilyFacetFilters,
            catBrandFacetFilters
          ),
        ],
        [],
        true,
        false,
        true,
        true,
        true,
        true,
        $brandSelectedSort,
        []
      );
    }
  };

  function subfamilyFilterClick(data) {
    $categoryActiveFilters = [];
    $categoryPriceFilters = [];
    $catBrandFacetFilters = [];
    $catDiscountActiveFilters = [];
    $categoryDiscountFilter = [];
    $catselectedPriceFilter = [];
    $catBrandFilter = [];

    fetchBrandCategoryDataFromAlgolia(
      currentCatId,
      [
        $catFamilyFacetFilters.length > 0 ? $catFamilyFacetFilters : [],
        createCategoryFacetFilter(
          lang === 'en' ? 'subFamilyEn' : 'subFamilyAr',
          data.selectedsubFamily,
          catFamilyFacetFilters,
          catSubFamilyFacetFilters,
          catBrandFacetFilters
        ),
      ],
      [],
      true,
      false,
      true,
      true,
      false,
      true,
      $brandSelectedSort,
      []
    );
  }

  function priceFilterClick(data) {
    $catBrandFacetFilters = [];
    $catDiscountActiveFilters = [];
    $categoryDiscountFilter = [];
    $catBrandFilter = [];

    fetchBrandCategoryDataFromAlgolia(
      currentCatId,
      [
        $catFamilyFacetFilters.length > 0 ? $catFamilyFacetFilters : [],
        $catSubFamilyFacetFilters.length > 0 ? $catSubFamilyFacetFilters : [],
      ],
      createPriceFilterCategory(data.rangeStart, data.rangeEnd, categoryPriceFilters),
      true,
      false,
      true,
      false,
      false,
      true,
      $brandSelectedSort,
      []
    );
  }

  const discountFilterClick = data => {
    $catBrandFacetFilters = [];
    $catBrandFilter = [];

    fetchBrandCategoryDataFromAlgolia(
      currentCatId,
      [
        $catFamilyFacetFilters.length > 0 ? $catFamilyFacetFilters : [],
        $catSubFamilyFacetFilters.length > 0 ? $catSubFamilyFacetFilters : [],
      ],
      $categoryPriceFilters.length > 0 ? $categoryPriceFilters : [],
      false,
      false,
      true,
      false,
      false,
      true,
      $brandSelectedSort,
      createCatergoryDiscountFilter(data.rangeStart, data.rangeEnd, categoryDiscountFilter)
    );
  };

  const brandFilterClick = data => {
    fetchBrandCategoryDataFromAlgolia(
      currentCatId,
      [
        $catFamilyFacetFilters.length > 0 ? $catFamilyFacetFilters : [],
        $catSubFamilyFacetFilters.length > 0 ? $catSubFamilyFacetFilters : [],
        createCategoryFacetFilter(
          lang === 'en' ? 'brandEn' : 'brandAr',
          data.selectedBrand,
          catFamilyFacetFilters,
          catSubFamilyFacetFilters,
          catBrandFacetFilters
        ),
      ],
      $categoryPriceFilters.length > 0 ? $categoryPriceFilters : [],
      false,
      false,
      false,
      false,
      false,
      true,
      $brandSelectedSort,
      $categoryDiscountFilter.length > 0 ? $categoryDiscountFilter : []
    );
  };

  function activeFilterRemoveClick(data) {
    let priceRange;
    let percentageRange;
    if (data.subCategory === 'price') {
      priceRange = data.filterToBeRemoved.split('<strong>')[1].split('-');
      createPriceFilterCategory(priceRange[0], priceRange[1].split('</strong>')[0], categoryPriceFilters);
      $catselectedPriceFilter = $catselectedPriceFilter.filter(
        x => x !== `${+priceRange[0]} - ${+priceRange[1].split('</strong>')[0]}`
      );
    }
    if (data.subCategory === 'brandEn' || 'brandAr') {
      $catBrandFilter = $catBrandFilter.filter(x => x !== data.filterToBeRemoved.split(':')[1]);
      $catBrandFacetFilters = $catBrandFacetFilters.filter(x => x !== data.filterToBeRemoved.split(':')[1]);
    }
    if (data.subCategory === 'familyEn' || 'familyAr') {
      $catFamilyFilter = $catFamilyFilter.filter(x => x !== data.filterToBeRemoved.split(':')[1]);
      $catFamilyFacetFilters = $catFamilyFacetFilters.filter(x => x !== data.filterToBeRemoved.split(':')[1]);
    }

    if (data.subCategory === 'subFamilyEn' || 'subFamilyAr') {
      $catsubFamilyFilter = $catsubFamilyFilter.filter(x => x !== data.filterToBeRemoved.split(':')[1]);
      $catSubFamilyFacetFilters = $catSubFamilyFacetFilters.filter(x => x !== data.filterToBeRemoved.split(':')[1]);
    }
    if (data.subCategory === 'discount') {
      percentageRange = data['filterToBeRemoved'].split('-').map(item => item.replace('%', ''));
      createCatergoryDiscountFilter(percentageRange[0], percentageRange[1], categoryDiscountFilter);
      $catDiscountActiveFilters = $catDiscountActiveFilters.filter(
        x => x !== `${+percentageRange[0]} - ${+percentageRange[1]}`
      );
    }

    fetchBrandCategoryDataFromAlgolia(
      currentCatId,
      [
        $catFamilyFacetFilters.length > 0 ? $catFamilyFacetFilters : [],
        $catSubFamilyFacetFilters.length > 0 ? $catSubFamilyFacetFilters : [],
        $catBrandFacetFilters.length > 0 ? $catBrandFacetFilters : [],
      ],
      $categoryPriceFilters.length > 0 ? $categoryPriceFilters : [],
      false,
      false,
      false,
      false,
      false,
      true,
      $brandSelectedSort,
      $categoryDiscountFilter.length > 0 ? $categoryDiscountFilter : []
    );
  }

  function allFilterRemoveClick() {
    $catFamilyFacetFilters = [];
    $catSubFamilyFacetFilters = [];
    $categoryPriceFilters = [];
    $categoryDiscountFilter = [];
    $catBrandFacetFilters = [];

    $brandSelectedSort = '';
    value = '';

    fetchBrandCategoryDataFromAlgolia(currentCatId, [], [], true, true, true, true, true, true, $brandSelectedSort, []);
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

  function selectClosing(e) {
    if (isMobileWidth()) {
      let ele: any = e.target.closest('.filter-container');
      ele.style.overflowX = 'scroll';
    }
  }

  function selectOpen(e) {
    if (isMobileWidth()) {
      let ele: any = e.target.closest('.filter-container');
      ele.style.overflowX = 'clip';
    }
  }

  $: discountList = discountFacetList.filter(obj => obj.n !== 0);
</script>

<section class="product-range-container">
  {#if loaded}
    {#if metaData && metaData.title}
      <div class="title-viewlink-wrapper">
        <h2 class="product-range-title">{metaData?.title}</h2>
        {#if !isResponsive && metaData?.viewAllLink?.linkName}
          <a class="view-all-link" href={encodedContextPath + metaData?.viewAllLink?.url}
            >{metaData?.viewAllLink?.linkName}</a
          >
        {/if}
      </div>
    {/if}

    <div class="filter-container">
      {#if familyFacetList.length || subFamilyFacetList.length}
        <div class="brand-sort-filter">
          {#if familyFacetList.length}
            <div>
              <Select
                class="shaped-outlined"
                variant="outlined"
                bind:value
                label={getStr('extra.filter.family.title')}
                on:SMUIMenuSurface:closing={selectClosing}
                on:SMUIMenuSurface:opened={selectOpen}
              >
                {#each familyFacetList as option}
                  <Option value={option} on:click={() => familyFilterClick(option)}>{option}</Option>
                {/each}
              </Select>
            </div>
          {/if}
          {#if subFamilyFacetList.length}
            <div>
              <CategoryFilterTag
                facetTypeClass="sub-family-facet"
                options={subFamilyFacetList}
                label={getStr('extra.filter.subfamily.title')}
                on:subfamilyFilterClicked={e => subfamilyFilterClick(e.detail)}
              />
            </div>
          {/if}
        </div>
      {/if}

      {#if priceFacetList.length}
        <CategoryFilterTag
          facetTypeClass="price-facet"
          options={priceFacetList}
          label={getStr('extra.price.text')}
          on:priceFilterClicked={e => priceFilterClick(e.detail)}
        />
      {/if}
      {#if discountList.length}
        <CategoryFilterTag
          facetTypeClass="discount-facet"
          options={discountFacetList}
          label={getStr('extra.filter.discount.title')}
          on:discountFilterClicked={e => discountFilterClick(e.detail)}
        />
      {/if}
      {#if brandFacetList.length}
        <CategoryFilterTag
          facetTypeClass="brand-facet"
          options={brandFacetList}
          label={getStr('extra.filter.brand.title')}
          on:brandFilterClicked={e => brandFilterClick(e.detail)}
        />
      {/if}
    </div>

    <CategoryActiveFIlter
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
    {:else}
      {#if productData.length > 0}
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
      {#if isResponsive && metaData?.viewAllLink?.linkName}
        <div class="res-link">
          <a class="view-all-link" href={encodedContextPath + metaData?.viewAllLink?.url}
            >{metaData?.viewAllLink?.linkName}</a
          >
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
    .title-viewlink-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .view-all-link {
      font-size: 14px;
      font-weight: 700;
      color: $primary-blue;
      border: 1px solid $primary-blue;
      border-radius: 100px;
      padding: 10px 24px;
    }
    .res-link {
      margin-top: 20px;
      display: flex;
      .view-all-link {
        width: 100%;
        padding: 15px 36px;
        text-align: center;
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
        display: flex;
        gap: 20px;
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
      .swiper-button-next {
        transform: rotate(90deg);
      }
      .swiper-button-prev {
        transform: rotate(-90deg);
      }
      .swiper-slide {
        height: auto;
      }
    }
    * :global(.shaped-outlined),
    * :global(.shaped-outlined .mdc-select__anchor) {
      border-radius: 28px;
      height: 42px;
      width: 132px;
      background: $secondary-gray-02;
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
      min-height: 150px;
      display: block;
      z-index: 2;
      @include desktop-max-width {
        z-index: 9;
      }
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
