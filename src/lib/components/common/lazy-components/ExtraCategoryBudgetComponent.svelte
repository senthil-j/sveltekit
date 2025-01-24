<script lang="ts">
    import { _ } from "svelte-i18n";
    import { getAppConfig } from "../../../common/config/app-config";
    import Radio from "@smui/radio";
    import FormField from "@smui/form-field";
    import {
        OPTION_FACETS,
        OPTION_OPTIONAL_FILTERS,
        OPTION_RESPONSE_FIELDS,
        getProductsByUrlFromAlgoliaAsync,
        parseAlgoliaUrl,
    } from "../services/algolia";
    import ExtraCategoryBudgetRangeSlider from "./child-helpers/ExtraCategoryBudgetRangeSlider.svelte";
    import { getCMSComponentsFromHybrisAsync } from "../services/hybris";
    import {
        getDividedMaxPrice,
        getRoundedFloorPrice,
    } from "../../category/services/category-data-services";

    export let metaData: any;
    const {
        algoliaConfig: { sorts },
    } = getAppConfig();

    let activeCategoryName: any;
    let categoryList = [];
    let selectedCategoryName: any;
    let dataLoaded: boolean = false;
    let onUpdateSliderRange;
    let showCategoryList: boolean = false;
    let currentCategoryURLLink;
    let activeCategoryObj: any;
    let alreadyFetchedCategoryData = [];
    let categoryCacheData = {};
    let priceDiff: number;
    let facetsStatsMaxPrice: number;
    let facetsStatsMinPrice: number;
    let facetsStatsMinPriceRaw: number;

    export function onLoad() {
        let categoryBudgetDropdownList = "";
        if ("categoryBudgetDropdownList" in metaData)
            categoryBudgetDropdownList = metaData.categoryBudgetDropdownList;
        const categoryBudgetDropdownLists =
            categoryBudgetDropdownList.split(" ");
        getCMSComponentsFromHybrisAsync(categoryBudgetDropdownLists)
            .then((res) => res.component)
            .then((links) => (categoryList = links))
            .then(() => {
                fetchCategoryDataFromAlgolia(categoryList[0]?.urlLink);
                selectedCategoryName = categoryList[0]?.title;
                dataLoaded = true;
            });
    }

    function fetchCategoryDataFromAlgolia(
        catQuery = "",
        priceFilterRefreshRequired = true,
    ) {
        dataLoaded = false;
        currentCategoryURLLink = catQuery;
        categoryCacheData = alreadyFetchedCategoryData.find(
            (o) => o.algoliaUrl === catQuery,
        );
        if (categoryCacheData !== undefined) {
            facetsStatsMaxPrice = categoryCacheData["facetsStatsMaxPrice"];
            facetsStatsMinPrice = categoryCacheData["facetsStatsMinPrice"];
            getPriceData(facetsStatsMinPrice, facetsStatsMaxPrice);
            dataLoaded = true;
        } else {
            getProductsByUrlFromAlgoliaAsync(
                catQuery,
                OPTION_FACETS("price"),
                OPTION_OPTIONAL_FILTERS(parseAlgoliaUrl(catQuery)),
                OPTION_RESPONSE_FIELDS(["facets", "facets_stats"]),
            )
                .then((res: any) => {
                    const dummyBase = document.location.origin;
                    const urlObject = new URL(catQuery, dummyBase);
                    let isMinMaxSetInUrl = false;
                    if (urlObject.searchParams.has("q")) {
                        const qParam = urlObject.searchParams.get("q");
                        const reEx = /price:([0-9]+)-([0-9]+)/.exec(qParam);
                        if (reEx) {
                            facetsStatsMaxPrice = Number(reEx[2]);
                            facetsStatsMinPriceRaw = Number(reEx[1]);
                            facetsStatsMinPrice = getRoundedFloorPrice(
                                facetsStatsMinPriceRaw,
                            );
                            isMinMaxSetInUrl = true;
                        }
                    }
                    if (!isMinMaxSetInUrl) {
                        if (
                            "facets_stats" in res &&
                            priceFilterRefreshRequired
                        ) {
                            facetsStatsMaxPrice = Object.entries(
                                res?.facets_stats,
                            ).length
                                ? res?.facets_stats.price.max
                                : 0;
                            facetsStatsMinPriceRaw = Object.entries(
                                res?.facets_stats,
                            ).length
                                ? res?.facets_stats.price.min
                                : 0;
                            facetsStatsMinPrice = getRoundedFloorPrice(
                                facetsStatsMinPriceRaw,
                            );
                        }
                    }

                    activeCategoryObj = Object.assign(
                        {},
                        {
                            algoliaUrl: catQuery,
                            facetsStatsMaxPrice: facetsStatsMaxPrice,
                            facetsStatsMinPrice: facetsStatsMinPrice,
                        },
                    );
                    // alreadyFetchedCategoryData.push(activeCategoryObj);
                    getPriceData(facetsStatsMinPrice, facetsStatsMaxPrice);
                })
                .then(() => Object.assign({}, { className: "no-divider" }))
                .catch((er) => (dataLoaded = false))
                .finally(() => (dataLoaded = true));
        }
    }

    function subCategoryFilterClicked(subCategoryUrl) {
        showCategoryList = false;
        fetchCategoryDataFromAlgolia(subCategoryUrl, true);
    }
    function getPriceData(minPrice, maxPrice) {
        priceDiff = getDividedMaxPrice(minPrice, maxPrice);
        onUpdateSliderRange.updateSliderRange(priceDiff, minPrice);
    }
    function collapseDropdown() {
        showCategoryList = !showCategoryList;
    }
</script>

<div class="budget-setter-container">
    <div class="left-content">
        {#if metaData && metaData.title}
            <h2 class="header-left"><span>{metaData?.title}</span></h2>
        {/if}
        <div class="filter-container">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
                on:click={() => collapseDropdown()}
                class="category-sort-filter"
            >
                <div class="shaped-outlined">
                    <span class="shaped-outlined-text"
                        >{selectedCategoryName}</span
                    >
                    <span
                        class={`c_icon_new  c_icon_new--chevron${showCategoryList ? "_up " : "_down"}`}
                    ></span>
                </div>
            </div>
            {#if showCategoryList}
                <div class="sub-category-container">
                    {#if categoryList?.length}
                        <div class="sub-category-list">
                            {#each categoryList as subFamCatory}
                                <FormField>
                                    <Radio
                                        bind:group={selectedCategoryName}
                                        value={subFamCatory.title}
                                        disabled={false}
                                        on:change={() =>
                                            subCategoryFilterClicked(
                                                subFamCatory.urlLink,
                                            )}
                                    />
                                    <span slot="label">
                                        {subFamCatory.title}{false
                                            ? " (disabled)"
                                            : ""}
                                    </span>
                                </FormField>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
    {#if facetsStatsMaxPrice > 0}
        <ExtraCategoryBudgetRangeSlider
            bind:this={onUpdateSliderRange}
            {facetsStatsMaxPrice}
            {facetsStatsMinPrice}
            {priceDiff}
            {dataLoaded}
            {currentCategoryURLLink}
        />
    {/if}
</div>

<style lang="scss">
    @import "../../common/styles/colors.new.scss";

    .budget-setter-container {
        display: flex;
        gap: 84px;
        padding: 48px;
        @include desktop-max-width {
            display: flex;
            flex-direction: column;
            padding: 33px 16px;
            gap: 12px;
        }
        .left-content {
            display: flex;
            flex-direction: column;
            width: 372px;
            @include desktop-max-width {
                flex-direction: row;
                position: relative;
                justify-content: space-between;
                width: 100%;
            }
            .header-left {
                color: $neutral-dark-01;
                font-size: 36px;
                font-style: normal;
                font-weight: 700;
                line-height: 40px;
                margin: 0px;
                @include desktop-max-width {
                    font-size: 18px;
                    line-height: 20px;
                    margin: 4px 0;
                    width: 50%;
                }
            }
            .filter-container {
                position: relative;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                padding-bottom: 15px;
                gap: 16px;
                margin-top: 20px;
                @include desktop-max-width {
                    margin-top: 0px;
                    padding-bottom: 0px;
                }
                .brand-sort-filter {
                    padding-right: 20px;
                    border-right: 1px solid $secondary-gray-02;
                }
                .chip-slider {
                    margin: 0 16px;
                }
                .category-sort-filter {
                    @include desktop-max-width {
                        display: flex;
                        flex-direction: column-reverse;
                        align-items: flex-end;
                    }
                    .shaped-outlined {
                        border-radius: 28px;
                        height: 42px;
                        background: $secondary-gray-02;
                        display: flex;
                        flex-direction: row;
                        justify-content: space-evenly;
                        align-items: center;
                        width: max-content;
                        padding: 12px;
                        gap: 12px;
                        .shaped-outlined-text {
                            font-size: 14px;
                            font-style: normal;
                            font-weight: 400;
                            line-height: 16px;
                            color: $neutral-dark-01;
                        }
                        .c_icon_new {
                            font-size: 16px;
                        }
                    }
                }
            }

            .sub-category-container {
                position: absolute;
                top: 50px;
                width: auto;
                border-radius: 10px;
                border: 1px solid $secondary-gray-02;
                background: $primary-white;
                box-shadow: 0px 4px 12px 0px rgba(219, 227, 232, 0.6);
                padding: 20px;
                z-index: 9;
                @include desktop-max-width {
                    // position: absolute;
                    // right: 5px;
                    // top: 43px ;
                }
                .sub-category-list {
                    display: inline-flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 16px;

                    :global {
                        label {
                            color: $neutral-dark-02;
                            font-size: 14px;
                            font-style: normal;
                            font-weight: 400;
                            line-height: 16px;
                        }
                        .mdc-radio {
                            padding: 0px 5px;
                        }
                        .mdc-radio .mdc-radio__native-control {
                            top: calc((40px - 40px) / 2);
                            right: auto;
                            left: auto;
                            width: 20px;
                            height: 20px;
                        }
                        .mdc-radio__outer-circle {
                            position: absolute;
                            top: 0;
                            left: 0;
                            box-sizing: border-box;
                            width: 16px;
                            height: 16px;
                            border-width: 2px;
                            border-style: solid;
                            border-radius: 2px;
                            border-color: $neutral-dark-04;
                            transition: border-color 120ms 0ms
                                cubic-bezier(0.4, 0, 0.6, 1);
                        }
                        .mdc-radio__inner-circle {
                            border-color: transparent;
                        }
                        .mdc-radio__inner-circle::after {
                            content: "✔";
                            position: absolute;
                            font-size: 20px;
                            line-height: 0.8;
                            color: $primary-blue;
                            transition: all 0.2s;
                            left: -12px;
                            top: -11px;
                        }
                        .mdc-radio__inner-circle::before {
                            content: "";
                            position: absolute;
                            top: -20px;
                            left: -20px;
                            box-sizing: border-box;
                            width: 32px;
                            height: 32px;
                            border-width: 4px;
                            border-style: solid;
                            border-radius: 4px;
                            border-color: #0065a4;
                            transition: border-color 120ms 0ms
                                cubic-bezier(0.4, 0, 0.6, 1);
                        }
                    }
                }
            }
        }
    }
    /*rtl:end:ignore*/
</style>
