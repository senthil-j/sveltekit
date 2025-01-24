<script lang="ts">
  import type { SwiperOptions } from "swiper/types";
  import { getAppConfig } from "../../../common/config/app-config";
  import { isMobileWidth } from "../../../common/util";
  import { getCMSComponentsFromHybrisAsync } from "../../common/services/hybris";
  import ExtraCategoryServiceSlideTemplate from "../components/ExtraCategoryServiceSlideTemplate.svelte";
  import ExtraSwiper from "../components/ExtraSwiper.svelte";

  export let metaData: any;
  $: swiperOptions = getSwiperOptions();
  const { encodedContextPath } = getAppConfig();

  function getSwiperOptions(): SwiperOptions {
    return {
      slidesPerView: "auto",
      spaceBetween: isResponsive ? 8 : 32,
      navigation: !isResponsive,
    };
  }
  let loaded = false;
  $: isResponsive = isMobileWidth();
  export function onLoad() {
    let linkNames = "";
    if ("serviceTiles" in metaData) linkNames = metaData.serviceTiles;
    const cmsLinks = linkNames.split(" ");
    getCMSComponentsFromHybrisAsync(cmsLinks).then((res) => {
      loaded = true;
      categoryList = res.component;
    });
  }
  let categoryList = [];

  const getLinkUrl = (linkUrl) => {
    if (linkUrl) {
      if (linkUrl.indexOf("http") >= 0) return linkUrl;
      return encodedContextPath + linkUrl;
    }
    return "/";
  };
</script>

<section class="c_product-category category-service">
  {#if loaded}
    <div class="c_category-service">
      <div class="c_category-service-title-container">
        <h2 class="c_product-category--title">{metaData?.title || ""}</h2>
        {#if metaData && metaData.learnMoreLink && metaData?.learnMoreLink?.linkName?.length > 0}
          <a
            href={getLinkUrl(metaData?.learnMoreLink?.url)}
            class="c_category-service-learnmore-link"
            >{metaData?.learnMoreLink?.linkName}</a
          >
        {/if}
      </div>

      {#if metaData && metaData?.description}
        <div class="c_category-service--desc">{metaData.description}</div>
      {/if}
      <div class="c_category-service--details">
        <ExtraSwiper
          slidesData={categoryList}
          slideTemplate={ExtraCategoryServiceSlideTemplate}
          {swiperOptions}
        />
      </div>
    </div>
  {/if}
</section>

<style lang="scss">
  @import "../../common/styles/colors.new.scss";

  .c_category-service--details {
    :global {
      .swiper-slide {
        display: flex;
        height: auto;
      }
      .swiper-container {
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
