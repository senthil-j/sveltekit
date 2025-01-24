<script lang="ts">
    import {
        getDataFromAmplienceAsync,
        parseMultiBrandImageBannersData,
    } from "../../../common/services/amplience";
    import MultiBannerItem from "../../../common/lazy-components/amplienceBanners/MultiBannerItem.svelte";
    import {
        getJoodMembershipBasedPropertyValue,
        isMobile,
    } from "../../../../common/util";
    import { getAppConfig } from "../../../../common/config/app-config";

    export let metaData;
    let direction = "left";
    let headingText;
    let isResponsive = isMobile();
    const { lang } = getAppConfig();

    export function onLoad() {
        const amplienceId = getJoodMembershipBasedPropertyValue(
            metaData,
            "amplienceId",
            "blueAmplienceId",
            "goldAmplienceId",
        );
        return getDataFromAmplienceAsync(amplienceId)
            .then((res: any) => parseMultiBrandImageBannersData(res))
            .then((data) => {
                bannersData = data.slides;
                if (!isResponsive) {
                    direction = data?.bannerPosition?.alignment;
                } else if (lang === "ar") {
                    direction = "right";
                } else {
                    direction = "left";
                }
                headingText = data?.headingText;
            })
            .then(() => (loaded = true))
            .catch(() => (failedToLoad = true));
    }

    let bannersData: any[] = [];
    let loaded: boolean = false;
    let failedToLoad: boolean = false;
</script>

{#if !failedToLoad}
    {#if loaded}
        <section class="brand-multi-banners-container">
            {#if headingText}
                <h1 class="brand-multi-banners-title">{headingText}</h1>
            {/if}
            <section
                class="brand-multi-banners-grid"
                style="direction: {direction === 'left' ? 'ltr' : 'rtl'};"
            >
                <div
                    class="brand-bigger-tile"
                    style="direction: {lang === 'ar' ? 'rtl' : 'ltr'};"
                >
                    {#each bannersData as bannerData, i}
                        {#if i === 0}
                            <MultiBannerItem
                                {bannerData}
                                isBigImage={true}
                                on:click
                            />
                        {/if}
                    {/each}
                </div>
                <div class="brand-smaller-tile">
                    {#each bannersData as bannerData, i}
                        {#if i > 0}
                            <MultiBannerItem {bannerData} on:click />
                        {/if}
                    {/each}
                </div>
            </section>
        </section>
    {:else}
        <section class="skeleton-container multi-banners-grid">
            <section class="skeleton-item"></section>
            <section class="skeleton-item"></section>
            <section class="skeleton-item"></section>
            <section class="skeleton-item"></section>
        </section>
    {/if}
{/if}

<style lang="scss">
    @import "../../../common/styles/colors.new.scss";
    .brand-multi-banners-container {
        padding: 80px 48px;
        @include desktop-max-width {
            padding: 40px 0 40px 16px;
            overflow: scroll;
        }
        .brand-multi-banners-title {
            font-size: 36px;
            font-weight: 700;
            line-height: 40px;
            color: $neutral-dark-01;
            margin-bottom: 47px;

            @include desktop-max-width {
                font-size: 20px;
                font-weight: 700;
                line-height: 22px;
                margin-bottom: 20px;
            }
        }
        .brand-multi-banners-grid {
            display: grid;
            grid-auto-rows: 1fr;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            text-align: left;
            @include desktop-max-width {
                display: flex;
                overflow: scroll;
            }
            &::-webkit-scrollbar {
                display: none;
            }

            @include desktop-min-width {
                gap: 24px;
            }
            .brand-bigger-tile {
                :global(.multi-banner-item) {
                    height: 100%;

                    @include desktop-max-width {
                        width: 252px;
                        height: 326px;
                        max-height: 100%;
                    }
                }
                :global(.text-wrapper) {
                    position: relative;
                    z-index: 1;
                    max-width: 51%;
                    @include desktop-max-width {
                        max-width: 100%;
                    }
                }

                :global(.text-wrapper > p) {
                    font-size: 48px;
                    font-weight: 700;
                    line-height: 52px;
                    @include desktop-max-width {
                        font-size: 16px;
                        font-weight: 700;
                        line-height: 18px;
                    }
                }
                :global(.scale-on-hover) {
                    transition: none;

                    &:hover {
                        transform: none;
                    }
                }
                :global(.image-wrapper) {
                    max-height: 70% !important;
                    height: -webkit-fill-available;
                    text-align: right;
                }
                :global(.image-wrapper img) {
                    height: 100% !important;
                    text-align: right;
                }
            }
            .brand-smaller-tile {
                :global(.text-wrapper) {
                    position: relative;
                    z-index: 1;
                }
                :global(.multi-banner-item) {
                    width: 318px;
                    @include desktop-max-width {
                        width: 252px;
                        height: 326px;
                    }
                }
                :global(.scale-on-hover) {
                    transition: none;

                    &:hover {
                        transform: none;
                    }
                }
                :global(.image-wrapper) {
                    max-height: 70% !important;
                    @include desktop-max-width {
                        height: -webkit-fill-available;
                        text-align: right;
                    }
                }
                :global(.image-wrapper img) {
                    height: 100% !important;
                }
            }
            .brand-bigger-tile,
            .brand-smaller-tile {
                display: grid;
                @include desktop-max-width {
                    display: flex;
                }
                :global(h3) {
                    font-size: 16px;
                    font-weight: 400;
                    line-height: 18px;
                    color: $neutral-dark-02;
                    @include desktop-max-width {
                        font-size: 12px;
                        font-weight: 400;
                        line-height: 14px;
                    }
                }
                :global(p) {
                    font-size: 18px;
                    font-weight: 700;
                    line-height: 20px;
                    color: $neutral-dark-01;
                    @include desktop-max-width {
                        font-size: 16px;
                        font-weight: 700;
                        line-height: 18px;
                    }
                }
            }
            .brand-smaller-tile {
                grid-auto-rows: 1fr;
                grid-template-columns: 1fr 1fr;
                gap: 24px;
            }
            .skeleton-item {
                height: 268px;
                border-radius: 20px;
            }
        }
    }
    .skeleton-item {
        height: 268px;
        border-radius: 20px;
    }
</style>
