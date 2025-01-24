<script lang="ts">
    import { isMobile } from "../../../common/util";
    import { getCMSComponentsFromHybrisAsync } from "../services/hybris";
    import CmsBrandLinkComponent from "./CMSBrandLinkComponent.svelte";

    export let metaData;
    export function onLoad() {
        const brandExternalLinks = metaData?.brandExternalLinks.split(" ");
        getCMSComponentsFromHybrisAsync(brandExternalLinks)
            .then((res) => res.component)
            .then((cmsBrandLinks) => (brandLinks = cmsBrandLinks))
            .then(() => fetchAllCMSBrandLinks(brandLinks))
            .then(
                (brandSublinksData) => (brandSubLinks = [...brandSublinksData]),
            )
            .then(() => (loaded = true));
    }

    let loaded = false;
    let brandLinks = [];
    let brandSubLinks = [];
    let isResponsive = isMobile();

    function fetchAllCMSBrandLinks(brandLinksToFetch: any[]) {
        let allCMSLinks = [];
        const indexMap = {};
        brandLinksToFetch.forEach((b, i) => {
            const cmsLinksArray = b.cmsLinks.split(" ");
            allCMSLinks = [...allCMSLinks, ...cmsLinksArray];
            cmsLinksArray.forEach((c) => {
                indexMap[c] = i;
            });
        });

        return getCMSComponentsFromHybrisAsync(allCMSLinks)
            .then((cmsLinks) => cmsLinks.component)
            .then((linksData) => createArrayFromIndexMap(linksData, indexMap));
    }

    function createArrayFromIndexMap(linksData, indexMap) {
        const outputLength = new Set(Object.values(indexMap)).size;
        const outputArray = Array(outputLength)
            .fill(null)
            .map((x) => new Array(0));

        linksData.forEach((l) => {
            if (l.uid in indexMap) {
                const index = indexMap[l.uid];
                outputArray[index].push(l);
            }
        });

        return outputArray;
    }
</script>

<section class="top-brands-container py80 px48">
    {#if loaded}
        <h2>{metaData?.title}</h2>
        <section class="top-brands-list">
            {#each brandLinks as brandLink, index}
                <CmsBrandLinkComponent
                    metaData={brandLink}
                    cmsLinks={brandSubLinks[index]}
                />
            {/each}
        </section>
    {:else}
        <h2 class="skeleton-item w-25" class:w-50={isResponsive}>&nbsp;</h2>
        <section class="top-brands-list">
            <section class="skeleton-item"></section>
            <section class="skeleton-item"></section>
            <section class="skeleton-item"></section>
            <section class="skeleton-item"></section>
        </section>
    {/if}
</section>

<style lang="scss">
    @import "../styles/colors.new.scss";

    h2 {
        font-size: 20px;
        font-weight: 700;
        line-height: 22px;
        color: $primary-black;
        margin-block: 0 16px;

        @include desktop-min-width {
            font-size: 36px;
            line-height: 40px;
        }
    }
    .top-brands-list {
        display: grid;
        grid-template-columns: repeat(1, minmax(0, 1fr));
        grid-auto-rows: 1fr;
        gap: 16px;

        @include desktop-min-width {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 40px 20px;
        }
    }
    .top-brands-list .skeleton-item {
        border-radius: 20px;
        height: 274px;

        @include desktop-min-width {
            height: 424px;
        }
    }
</style>
