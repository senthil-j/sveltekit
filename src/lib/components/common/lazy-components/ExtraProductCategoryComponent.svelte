<script lang="ts">
  import type { SwiperOptions } from "swiper/types";
  import { getAppConfig } from "../../../common/config/app-config";
  import { isMobileWidth } from "../../../common/util";
  import { getCMSComponentsFromHybrisAsync } from "../../common/services/hybris";
  import ExtraProductCategoryTileTemplate from "../components/ExtraProductCategoryTileTemplate.svelte";
  import ExtraSwiper from "../components/ExtraSwiper.svelte";

  export let metaData: any;

  let loaded = false;
  $: isResponsive = isMobileWidth();
  const { encodedContextPath } = getAppConfig();
  $: prodCategorySwiperOptions = getSwiperOptions();

  function getSwiperOptions(): SwiperOptions {
    return {
      slidesPerView: "auto",
      spaceBetween: 12,
      navigation: isResponsive ? false : true,
    };
  }

  export function onLoad() {
    let linkNames = "";
    if ("cmsLinks" in metaData) linkNames = metaData.cmsLinks;
    else if ("cmsLinkList" in metaData) linkNames = metaData.cmsLinkList;
    else if ("children" in metaData) linkNames = metaData.children;
    const cmsLinks = linkNames.split(" ");

    return getCMSComponentsFromHybrisAsync(cmsLinks)
      .then((res) => {
        loaded = true;
        categoryList = res.component;
      })
      .then(() => {
        return true;
      });
  }
  let categoryList = [];
</script>

<section
  class="product-range-container"
  style={metaData.backgroundColor
    ? "background:" + metaData.backgroundColor
    : "#E1EDF4"}
>
  {#if loaded}
    <div class="category-page-wrapper">
      {#if metaData && metaData.title}
        <h2 class="product-range-title">{metaData?.title}</h2>
      {/if}
      <ExtraSwiper
        slidesData={categoryList}
        slideTemplate={ExtraProductCategoryTileTemplate}
        swiperOptions={prodCategorySwiperOptions}
      />
    </div>
  {/if}
</section>

<style lang="scss">
  @import "../../common/styles/colors.new.scss";
  .white-strip-divider {
    height: 20px;
    width: 100vw;
    color: $primary-white;
  }
  .product-category-container {
    cursor: pointer;
    display: flex;
    width: 147px;
    padding: 12px 24px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    aspect-ratio: 1;
    height: 116px;
    @include desktop-min-width {
      width: 180px;
      height: 119px;
    }
    img {
      height: 64px;
      aspect-ratio: auto;
      object-fit: contain;
    }
    h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      line-height: 18px;
      color: $neutral-dark-01;
      text-align: center;
      @include desktop-min-width {
        font-size: 16px;
        line-height: 20px;
      }
    }
  }
  .product-range-container {
    width: 100%;
    padding: 80px 0 89px 48px;
    @include desktop-max-width {
      padding: 40px 0 43px 16px;
    }
    .category-page-wrapper {
      margin: auto;
      width: 100%;
      @include desktop-min-width {
        max-width: 1440px;
      }
    }
    .category-container {
      background: $primary-white;
      border-radius: 12px;
      border: solid $secondary-gray-02 1px;
      &:hover {
        border: 1px solid $tertiary-blue-02;
      }
    }
    .product-range-title {
      font-size: 18px;
      font-style: normal;
      font-weight: 700;
      line-height: 20px;
      margin: 0 0 12px;
      padding: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      @include desktop-min-width {
        font-size: 36px;
        margin: 0 0 30px;
        line-height: 40px;
      }
    }
    :global {
      .swiper-wrapper {
        display: flex;
        height: 100%;
      }
      swiper-container::part(wrapper) {
        height: auto;
      }
      swiper-container::part(container) {
        display: flex;
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
