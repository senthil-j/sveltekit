<script lang="ts">
  import type { SwiperOptions } from "swiper/types";
  import { getAppConfig } from "../../../common/config/app-config";
  import { isMobileWidth } from "../../../common/util";
  import { getCMSComponentsFromHybrisAsync } from "../../common/services/hybris";
  import ExtraAccessorySlideTemplate from "../components/ExtraAccessorySlideTemplate.svelte";
  import ExtraSwiper from "../components/ExtraSwiper.svelte";

  export let metaData: any;

  const { encodedContextPath } = getAppConfig();

  let loaded = false;
  $: isResponsive = isMobileWidth();

  export function onLoad() {
    let linkNames = "";
    if ("cmsLinks" in metaData) linkNames = metaData.cmsLinks;
    else if ("cmsLinkList" in metaData) linkNames = metaData.cmsLinkList;
    else if ("children" in metaData) linkNames = metaData.children;
    const cmsLinks = linkNames.split(" ");
    getCMSComponentsFromHybrisAsync(cmsLinks).then((res) => {
      loaded = true;
      categoryList = res.component;
    });
    getCMSComponentsFromHybrisAsync(cmsLinks).then((res) => {
      loaded = true;
      categoryList = res.component;
    });
  }
  let categoryList = [];
  $: swiperOptions = getSwiperOptions();

  function getSwiperOptions(): SwiperOptions {
    return {
      slidesPerView: "auto",
      spaceBetween: 16,
      navigation: !isResponsive,
    };
  }
</script>

<section class="product-range-container">
  {#if loaded}
    <div class="accessories-title-container">
      {#if metaData && metaData.title}
        <h2 class="product-range-title">{metaData?.title}</h2>
      {/if}
      <a href={encodedContextPath + metaData?.viewAllUrl} class="view-all-link"
        >{metaData?.subTitle}</a
      >
    </div>
    <div class="accessories-component-swiper">
      <ExtraSwiper
        slidesData={categoryList}
        slideTemplate={ExtraAccessorySlideTemplate}
        {swiperOptions}
      />
    </div>
  {/if}
</section>

<style lang="scss">
  @import "../../common/styles/colors.new.scss";
  .accessories-title-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    @include desktop-min-width {
      padding-right: 48px;
    }
  }
  .view-all-link {
    border: solid 1px $primary-blue;
    border-radius: 30px;
    color: $primary-blue;
    font-size: 16px;
    font-weight: 700;
    line-height: 18px;
    padding: 15px 36px;
    width: calc(100% - 16px);
    justify-content: center;
    display: flex;
    position: absolute;
    bottom: 47px;
    @include desktop-min-width {
      position: relative;
      width: auto;
      padding: 10px 24px;
      font-size: 14px;
      line-height: 16px;
      bottom: inherit;
    }
    border: solid 1px $primary-blue;
    border-radius: 30px;
    color: $primary-blue;
    font-size: 16px;
    font-weight: 700;
    line-height: 18px;
    padding: 15px 36px;
    width: calc(100% - 16px);
    justify-content: center;
    display: flex;
    position: absolute;
    bottom: 47px;
    @include desktop-min-width {
      position: relative;
      width: auto;
      padding: 10px 24px;
      font-size: 14px;
      line-height: 16px;
      bottom: inherit;
    }
  }
  .product-category-container {
    cursor: pointer;
    display: flex;
    width: 159px;
    padding: 12px 24px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    aspect-ratio: 1;
    height: 130px;
    @include desktop-min-width {
      width: 312px;
      height: 312px;
      padding: 32px 48px;
    }
    img {
      height: 70px;
      aspect-ratio: auto;
      object-fit: contain;
      @include desktop-min-width {
        height: 168px;
      }
    }
    h3 {
      margin: 10px 0 0;
      font-size: 15px;
      font-weight: 500;
      line-height: 20px;
      color: $neutral-dark-01;
      text-align: center;
      @include desktop-min-width {
        font-size: 24px;
        line-height: 26px;
        margin: 20px 0 0;
      }
    }
  }

  .product-range-container {
    width: 100%;
    padding: 80px 0 80px 48px;
    position: relative;
    @include desktop-max-width {
      padding: 41px 0 125px 16px;
    }
    .category-container {
      background: $neutral-light-04;
      border-radius: 12px;
    }
    .product-range-title {
      font-size: 18px;
      font-style: normal;
      font-weight: 700;
      line-height: 22px;
      margin: 0 0 20px;
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

    swiper-container {
      display: flex;
      height: 100%;
    }
    swiper-container::part(wrapper) {
      height: auto;
      height: auto;
    }
    swiper-container::part(container) {
      display: flex;
      display: flex;
    }
    :global {
      .accessories-component-swiper {
        .swiper-button-next {
          transform: rotate(90deg);
        }
        .swiper-button-prev {
          transform: rotate(-90deg);
        }
      }
    }
  }
</style>
