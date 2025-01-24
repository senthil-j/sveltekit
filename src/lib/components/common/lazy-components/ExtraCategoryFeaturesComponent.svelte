<script lang="ts">
  import Select, { Option } from "@smui/select";
  import { fade } from "svelte/transition";
  import type { SwiperOptions } from "swiper/types";

  import { getAppConfig } from "../../../common/config/app-config";
  import {
    combineSPByOverriding,
    isMobileWidth,
    parseQToUnbxdSearchParams,
    parseUrlToUnbxdSP,
  } from "../../../common/util";
  import { perPageCount } from "../../brand/services/brand-component-mapper";
  import { categoryCodeParser } from "../../brand/services/brand-data-services";
  import {
    activeCategoryObj,
    alreadyFetchedCategoryData,
  } from "../../brand/store/brand_store";
  import Text from "../../common/components/Text.svelte";
  import {
    getProductsByUrlFromAlgoliaAsync,
    OPTION_HITS_PER_PAGE,
    parseAlgoliaUrl,
  } from "../../common/services/algolia";
  import { getCMSComponentsFromHybrisAsync } from "../../common/services/hybris";
  import ExtraProductTileSlideTemplate from "../components/ExtraProductTileSlideTemplate.svelte";
  import ExtraSwiper from "../components/ExtraSwiper.svelte";
  import { getSearchAPIResults } from "../services/unbxd";

  export let metaData: any;

  let loaded = false;
  $: isResponsive = isMobileWidth();

  const {
    encodedContextPath = "en-sa",
    siteBaseUrl,
    unbxdEnabled,
  } = getAppConfig();
  $: productTileSwiperOptions = getSwiperOptions();

  function getSwiperOptions(): SwiperOptions {
    return {
      slidesPerView: "auto",
      spaceBetween: isResponsive ? 8 : 16,
      navigation: isResponsive ? false : true,
      on: {
        realIndexChange: onSlideChange,
      },
    };
  }

  export function onLoad() {
    let linkNames = "";
    if ("categoryFeaturesDropdownList" in metaData)
      linkNames = metaData?.categoryFeaturesDropdownList;
    const cmsLinks = linkNames.split(" ");
    getCMSComponentsFromHybrisAsync(cmsLinks)
      .then((res) => res?.component)
      .then((res) => {
        if (res.length) {
          categoryId = parseAlgoliaUrl(res[0]?.url)?.categoryId;
          filtersList = res;
          currentCategory = filtersList[0].title;
          categoryUrl = res[0].url;
          const {
            categoryFeaturesDropdownFilters,
            categoryFeaturesDropdownElements,
          } = res[0];
          getFeatureDetails(
            categoryFeaturesDropdownFilters,
            categoryFeaturesDropdownElements,
          );
          return res;
        }
        return [];
      })
      .then((res) => {
        if (res?.length && res?.[0]?.url) {
          if (unbxdEnabled) {
            loadProductsFromURL(res?.[0]?.url);
          } else {
            fetchBrandCategoryDataFromAlgolia(res[0].url);
          }
          loaded = true;
        }
      });
  }
  function loadProductsFromURL(url: string) {
    const categorySP = parseUrlToUnbxdSP(url);
    productHitsLoaded = false;
    getSearchAPIResults(categorySP)
      .then((r) => {
        const hits = r.response?.products || [];
        productData = hits;
        processResponseHits(url, hits);
      })
      .finally(() => (productHitsLoaded = true));
  }
  export function onViewport() {
    if (productData.length > 0) {
      window["ACC"].extragtm.click.trackViewList("", "", productData);
    }
  }
  let categoryId = "";
  let currentCategory = "";
  let quickFiltersList = [];
  let featuresTextList = [];
  let filtersList = [];
  let productData = [];
  let currentCatId: string = "";
  let productHitsLoaded: boolean = false;
  let selectedClass = "";
  let categoryUrl = "";
  let categoryCacheData = {};

  function getFeatureDetails(
    categoryFeaturesDropdownFilters = "",
    categoryFeaturesDropdownElements = "",
  ) {
    if (categoryFeaturesDropdownElements) {
      getCMSComponentsFromHybrisAsync(
        categoryFeaturesDropdownElements.split(" "),
      ).then((res1) => {
        featuresTextList = res1.component;
      });
    } else {
      featuresTextList = [];
    }
    if (categoryFeaturesDropdownFilters) {
      getCMSComponentsFromHybrisAsync(
        categoryFeaturesDropdownFilters.split(" "),
      ).then((res) => {
        quickFiltersList = res.component;
      });
    } else {
      quickFiltersList = [];
    }
  }

  function fetchBrandCategoryDataFromAlgolia(
    catQuery,
    alogoliaCallRequired = false,
  ) {
    productHitsLoaded = false;
    currentCatId = catQuery;
    categoryCacheData = $alreadyFetchedCategoryData.find(
      (o) => o.algoliaUrl === catQuery,
    );

    if (categoryCacheData !== undefined && !alogoliaCallRequired) {
      productData = categoryCacheData["productData"];
      productHitsLoaded = true;
    } else {
      getProductsByUrlFromAlgoliaAsync(
        catQuery,
        OPTION_HITS_PER_PAGE(perPageCount),
      )
        .then((res: any) => {
          processResponseHits(catQuery, res.hits || []);
        })
        .then(() => Object.assign({}, { className: "no-divider" }))
        .catch((er) => (productHitsLoaded = false))
        .finally(() => (productHitsLoaded = true));
    }
  }

  function processResponseHits(catQuery, hits: any[]) {
    $activeCategoryObj = Object.assign(
      {},
      {
        algoliaUrl: catQuery,
        productData: hits,
        catId: categoryCodeParser(currentCatId),
      },
    );
    productHitsLoaded = true;

    $alreadyFetchedCategoryData.push($activeCategoryObj);
  }
  function filterChipClicked(chipName, filterUrl) {
    if (unbxdEnabled) {
      // unbxd related processing
      selectedClass = selectedClass === chipName ? "" : chipName;
      const parentUrlSP = parseUrlToUnbxdSP(categoryUrl);
      const trimmedFilterUrl = filterUrl.startsWith("q=")
        ? filterUrl.substr(2)
        : filterUrl;
      let combinedSP,
        childUrlSP = new URLSearchParams();

      if (selectedClass === chipName) {
        childUrlSP = parseQToUnbxdSearchParams(trimmedFilterUrl, "");
      }
      combinedSP = combineSPByOverriding(parentUrlSP, childUrlSP);
      combinedSP.set("rows", perPageCount.toString());

      productHitsLoaded = false;
      getSearchAPIResults(combinedSP)
        .then((r) => {
          const hits = r.response?.products || [];
          productData = hits;
          processResponseHits(filterUrl, hits);
        })
        .finally(() => (productHitsLoaded = true));
    } else {
      let categoryParams;
      let catUrl = ``;
      if (filterUrl) {
        if (selectedClass === chipName) {
          selectedClass = "";
        } else {
          selectedClass = chipName;
        }
        if (categoryUrl.indexOf("q=") >= 0) {
          categoryParams = parseAlgoliaUrl(categoryUrl);
          catUrl = `/c/${categoryParams.categoryId}/`;
        } else {
          catUrl = `${categoryUrl}/`;
        }
        if (filterUrl.indexOf("/c/") === -1) {
          filterUrl = `${catUrl}facet/?${filterUrl}`;
        } else if (filterUrl.indexOf("/facet/q=") >= 0) {
          filterUrl = `${catUrl}facet/?${filterUrl.substr(filterUrl.indexOf("q="))}`;
        }
        const categoryParamsTemp = parseAlgoliaUrl(categoryUrl);
        const filterParams = parseAlgoliaUrl(filterUrl);
        let filterRelevance = [];
        let relevanceValue = "";
        if (
          typeof categoryParamsTemp.params == "undefined" ||
          categoryParamsTemp.params == "" ||
          typeof categoryParamsTemp.params.q == "undefined" ||
          categoryParamsTemp.params.q == ""
        ) {
          relevanceValue = ":relevance";
        }
        if (filterParams?.params?.q?.indexOf(":relevance") >= 0) {
          filterRelevance = filterParams?.params?.q?.split(":relevance");
        } else if (filterUrl.indexOf("q=") >= 0) {
          filterRelevance[1] = `:${filterParams?.params?.q}`;
        } else if (filterUrl.indexOf("/facet/") >= 0) {
          const splitFacet =
            filterUrl.split("/facet/?") >= 0
              ? filterUrl.split("/facet/?")
              : filterUrl.split("/facet/");
          filterRelevance[1] = `:${splitFacet[1]}`;
        }
        const finalParams = categoryParamsTemp?.params?.q
          ? `${categoryParamsTemp?.params?.q}${filterRelevance[1]}`
          : filterRelevance[1];
        delete categoryParams?.params?.q;
        let finanUrl = `${catUrl}facet/?q=${relevanceValue}${finalParams}&${new URLSearchParams(categoryParams?.params)}`;
        if (!selectedClass) {
          finanUrl = categoryParamsTemp?.params?.q
            ? `${catUrl}facet/?q=${categoryParamsTemp?.params?.q}`
            : `${catUrl}facet/?q=${relevanceValue}`;
        }
        fetchBrandCategoryDataFromAlgolia(finanUrl);
      }
    }
  }

  function filterDropDownClicked(
    queryUrl,
    categoryFeaturesDropdownFilters,
    categoryFeaturesDropdownElements,
  ) {
    categoryId = parseAlgoliaUrl(queryUrl)?.categoryId;
    categoryUrl = queryUrl;
    getFeatureDetails(
      categoryFeaturesDropdownFilters,
      categoryFeaturesDropdownElements,
    );

    if (unbxdEnabled) {
      loadProductsFromURL(queryUrl);
    } else {
      fetchBrandCategoryDataFromAlgolia(queryUrl);
    }
  }

  function selectClosing() {
    if (isMobileWidth()) {
      let ele: any = document.getElementsByClassName(
        "js-feature-filter-container",
      )[0];
      ele.style.overflowX = "scroll";
    }
  }

  function selectOpen() {
    if (isMobileWidth()) {
      let ele: any = document.getElementsByClassName(
        "js-feature-filter-container",
      )[0];
      ele.style.overflowX = "clip";
    }
  }

  const onSlideChange = (e) => {
    const [swiper] = e?.detail;
    if (swiper) {
      if (
        swiper?.navigation?.prevEl?.classList?.contains(
          "swiper-button-disabled",
        )
      ) {
        swiper.navigation.prevEl.style.display = "none";
      } else {
        swiper.navigation.prevEl.style.display = "block";
      }
      if (
        swiper?.navigation?.nextEl?.classList?.contains(
          "swiper-button-disabled",
        )
      ) {
        swiper.navigation.nextEl.style.display = "none";
      } else {
        swiper.navigation.nextEl.style.display = "block";
      }
    }
  };
</script>

<section class="product-range-container">
  {#if loaded}
    <div class="feature-comp-title">
      {#if metaData && metaData?.title}
        <h2 class="product-range-title">{metaData.title}</h2>
      {/if}
      {#if metaData && metaData?.description}
        <div class="feature-desc">{metaData.description}</div>
      {/if}
      {#if metaData && metaData?.viewAllText && categoryId}
        <a
          target="_blank"
          href={siteBaseUrl + "/c/" + categoryId}
          class="view-all-link">{metaData.viewAllText}</a
        >
      {/if}
    </div>
    <div class="filter-container js-feature-filter-container">
      {#if filtersList?.length}
        <div class="brand-sort-filter">
          <Select
            class="shaped-outlined"
            variant="outlined"
            bind:value={currentCategory}
            on:SMUIMenuSurface:closing={selectClosing}
            on:SMUIMenuSurface:opened={selectOpen}
          >
            {#each filtersList as filterItem}
              {#if filterItem?.title}
                <Option
                  value={filterItem?.title}
                  on:click={() =>
                    filterDropDownClicked(
                      filterItem?.url,
                      filterItem.categoryFeaturesDropdownFilters,
                      filterItem.categoryFeaturesDropdownElements,
                    )}>{filterItem?.title}</Option
                >
              {/if}
            {/each}
          </Select>
        </div>
      {/if}
      {#if quickFiltersList.length}
        {#each quickFiltersList.slice(0, 5) as quickFilter, i}
          {#if quickFilter?.filterName}
            <button
              class="filter-chip-button"
              class:selected={selectedClass === quickFilter.filterName}
              on:click={() =>
                filterChipClicked(
                  quickFilter.filterName,
                  quickFilter.algoliaUrl,
                )}
            >
              {@html quickFilter.filterName}
            </button>
          {/if}
        {/each}
      {/if}
    </div>
    <div class="product-desc-container">
      {#if featuresTextList?.length}
        <div class="c_featurecomp-lists">
          {#each featuresTextList as features}
            <div class="c_featurecomp-list">
              <div class="c_featurecomp-wrapper">
                {#if features?.iconUrl}
                  <div class="c_featurecomp-icon">
                    <img src={features.iconUrl} alt="icon" />
                  </div>
                {/if}
                {#if features?.title}
                  <div class="c_featurecomp-title">{features.title}</div>
                {/if}
                {#if features?.description}
                  <div class="c_featurecomp-desc">
                    {@html features.description}
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
      {#if !productHitsLoaded}
        <div
          class="skeleton-loader-container"
          class:skeltonFullWidth={featuresTextList?.length}
        >
          <div class="skeleton-item" in:fade></div>
          <div class="skeleton-item" in:fade></div>
          <div class="skeleton-item" in:fade></div>
          <div class="skeleton-item" in:fade></div>
          <div class="skeleton-item" in:fade></div>
        </div>
      {:else if productData.length > 0}
        <div
          class="feature-product-container"
          class:featureProductContainerWidth={featuresTextList?.length}
        >
          <ExtraSwiper
            slidesData={productData}
            slideTemplate={ExtraProductTileSlideTemplate}
            swiperOptions={productTileSwiperOptions}
          />
        </div>
      {:else}
        <div class="no-product-container">
          <Text key="extrabrand.no.product" />
        </div>
      {/if}
    </div>
  {/if}
</section>

<style lang="scss">
  @import "../../common/styles/colors.new.scss";
  .feature-product-container {
    width: 100%;
    &.featureProductContainerWidth {
      @include desktop-min-width {
        max-width: 79%;
      }
    }
    :global {
      .swiper {
        display: flex;
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
    }
  }
  .feature-comp-title {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  .view-all-link {
    border: solid 1px $primary-blue;
    border-radius: 30px;
    bottom: 0;
    color: $primary-blue;
    display: flex;
    font-size: 16px;
    font-weight: 700;
    justify-content: center;
    line-height: 18px;
    padding: 15px 36px;
    position: absolute;
    width: calc(100% - 36px);
    @include desktop-min-width {
      bottom: inherit;
      font-size: 14px;
      line-height: 16px;
      padding: 10px 24px;
      position: relative;
      width: auto;
    }
  }
  .feature-desc {
    color: $neutral-dark-02;
    display: flex;
    font-size: 14px;
    font-weight: 400;
    line-height: 16px;
    margin-top: 8px;
    width: 100%;
    @include desktop-min-width {
      display: none;
    }
  }
  .filter-chip-button {
    border: 0;
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $secondary-gray-02;
    color: $neutral-dark-01;
    border-radius: 100px;
    padding: 12px;
    gap: 12px;
    min-height: 42px;
    width: fit-content;
    cursor: pointer;
    white-space: nowrap;
    @include desktop-min-width {
      font-weight: 500;
    }
  }
  .product-desc-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow: hidden;
    @include desktop-min-width {
      flex-direction: row;
      gap: 30px;
    }
  }
  .selected {
    background: $neutral-dark-01;
    color: $primary-white;
  }
  .c_featurecomp-lists {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    @include desktop-min-width {
      gap: 28px;
      flex-basis: 251px;
      flex-grow: 0;
      flex-shrink: 0;
    }
    .c_featurecomp-wrapper {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-left: 40px;
      position: relative;
    }
    .c_featurecomp-title {
      color: $neutral-dark-01;
      font-size: 16px;
      font-weight: 700;
      line-height: 18px;
      @include desktop-min-width {
        font-size: 18px;
        line-height: 20px;
      }
    }
    .c_featurecomp-desc {
      color: $neutral-dark-02;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px;
      a {
        color: $icon-only-icon-blue;
        font-size: 14px;
        font-weight: 700;
      }
    }
    .c_featurecomp-icon {
      left: 0;
      position: absolute;
      top: 0;
      width: 24px;
    }
    .c_featurecomp-icon img {
      width: 24px;
    }
  }

  .product-range-container {
    padding: 23px 9px 55px 23px;
    position: relative;
    width: 100%;
    @include desktop-min-width {
      padding: 80px 48px;
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
    .product-range-title {
      font-size: 18px;
      font-style: normal;
      font-weight: 700;
      line-height: 20px;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      @include desktop-min-width {
        font-size: 36px;
        line-height: 40px;
      }
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
      padding-bottom: 16px;
      margin-top: 10px;
      gap: 4px;
      :global {
        .mdc-select--outlined:not(.mdc-select--disabled)
          .mdc-notched-outline__leading,
        .mdc-select--outlined:not(.mdc-select--disabled)
          .mdc-notched-outline__notch,
        .mdc-select--outlined:not(.mdc-select--disabled)
          .mdc-notched-outline__trailing {
          border: 0;
        }
      }
      @include desktop-min-width {
        gap: 8px;
        margin-top: 20px;
        padding-bottom: 40px;
      }

      &::-webkit-scrollbar {
        display: none;
      }
      @include desktop-max-width {
        overflow-x: scroll;
      }
      .brand-sort-filter {
        padding-right: 2px;
        @include desktop-min-width {
          border-right: 1px solid $secondary-gray-02;
          padding-right: 8px;
        }
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
      max-width: 150px;
      width: auto;
      z-index: 2;
    }
    * :global(.shaped-outlined .mdc-text-field__input) {
      padding-left: 32px;
      padding-right: 0;
    }
    *
      :global(
        .shaped-outlined .mdc-notched-outline .mdc-notched-outline__leading
      ) {
      border-radius: 28px 0 0 28px;
      width: 20px;
      border-right: none;
      border-left: 1px solid rgba(0, 0, 0, 0.38);
    }
    * :global(.mdc-select__selected-text) {
      font-size: 14px;
      font-weight: 500;
      @include desktop-max-width {
        font-weight: 400;
      }
    }
    *
      :global(
        .shaped-outlined .mdc-notched-outline .mdc-notched-outline__trailing
      ) {
      border-radius: 0 28px 28px 0;
      border-right: 1px solid rgba(0, 0, 0, 0.38);
      border-left: none;
    }
    *
      :global(
        .shaped-outlined .mdc-notched-outline .mdc-notched-outline__notch
      ) {
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
    *
      :global(
        .shaped-outlined
          .mdc-notched-outline
          .mdc-notched-outline__notch
          .mdc-floating-label
      ) {
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
      display: flex;
    }
    .skeleton-loader-container {
      display: flex;
      gap: 16px;
      width: 100%;
      &.skeltonFullWidth {
        @include desktop-min-width {
          max-width: 79%;
        }
      }
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
      display: list-item;
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
