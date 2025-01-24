<script lang="ts">
    import { getContextedUrl, isMobile } from "../../../common/util";
    import { brandGtmFilterEvent } from "../../brand/services/brand-data-services";
    import { getCMSComponentsFromHybrisAsync } from "../../common/services/hybris";

    export let metaData;
    export function onLoad() {
        const { cmsLinks } = metaData;
        return (
            cmsLinks &&
            getCMSComponentsFromHybrisAsync(cmsLinks.split(" "))
                .then((res) => res.component)
                .then((c) => (categoryList = c))
        );
    }

    let categoryList = [];
    let isResponsive = isMobile();
    $: wrapAfter = isResponsive ? 3 : +metaData?.wrapAfter;
    $: categoryListSplits = splitArrayIntoChunks(categoryList, wrapAfter);

    function splitArrayIntoChunks(inputArray, chunkSize) {
        let arrayCopy = [...inputArray];
        const outputSplits = [];
        while (arrayCopy.length > 0) {
            outputSplits.push(arrayCopy.splice(0, chunkSize));
        }
        return outputSplits;
    }

    function composeSearchUrlFromName(linkName: string) {
        const searchUrl = getContextedUrl(`/search?text=${linkName}`);
        return encodeURI(searchUrl);
    }

    function handleBrandMiniSearchClick(categoryLinkName) {
        localStorage.setItem("lastSearchText", categoryLinkName.trim());
        brandGtmFilterEvent(categoryLinkName, "");
    }
</script>

{#if categoryList.length > 0}
    <section class="brand-mini-search-container px48 py80">
        <h2>{metaData?.title}</h2>
        <section class="category-list">
            {#each categoryListSplits as categoryList}
                <section class="category-list-line">
                    {#each categoryList as category}
                        <a
                            href={composeSearchUrlFromName(category.linkName)}
                            class="btn-category"
                            on:click={() => {
                                handleBrandMiniSearchClick(category.linkName);
                            }}
                        >
                            {category.linkName}
                        </a>
                    {/each}
                </section>
            {/each}
        </section>
    </section>
{/if}

<style lang="scss">
    @import "../../common/styles/colors.new.scss";

    .brand-mini-search-container {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 20px;

        @include desktop-min-width {
            align-items: center;
            flex-direction: row;
            justify-content: space-between;
        }
    }
    h2 {
        font-size: 20px;
        font-weight: 700;
        line-height: 22px;
        margin-block: 0;
        color: $neutral-dark-01;
        text-align: center;

        @include desktop-min-width {
            font-size: 36px;
            line-height: 40px;
            text-align: start;
        }
    }
    .category-list {
        display: flex;
        gap: 8px;
        flex-direction: column;

        .category-list-line {
            display: flex;
            gap: 8px;
            justify-content: center;

            @include desktop-min-width {
                justify-content: flex-end;
            }
        }
    }
    .btn-category {
        display: inline-block;
        font-size: 14px;
        font-weight: 500;
        line-height: 16px;
        padding: 12px;
        background-color: $secondary-gray-02;
        color: $neutral-dark-01;
        border: 0;
        border-radius: 100px;
        transition: all 250ms ease;
    }
</style>
