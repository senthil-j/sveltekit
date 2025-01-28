<script lang="ts">
    import { getCMSComponentsFromHybrisAsync, getUrlWithQueryParams } from "../../../../lib/ajax-services";
    import { isMobile } from "../../../../lib/util";
    import ImageTag from "./ImageTag.svelte";
    
    export let metaData;
    export async function onLoad() {
        const _cmsLinks = metaData?.cmsLinks.split(" ");

        const urlParams = getCMSComponentsFromHybrisAsync(_cmsLinks);
            const apiUrl = await getUrlWithQueryParams(urlParams.url, urlParams.params);

        await fetch(apiUrl)
        .then((res) => res.json())
            .then((res) => res.component)
            .then((cmsLinksData) => (cmsLinks = cmsLinksData))
            .then(() => (loaded = true));
    }

    let loaded = false;
    let cmsLinks = [];
    let isResponsive = isMobile();
</script>

<section
    class="shopping-journey-container py80 px48"
    class:skeleton-container={!loaded}
>
    {#if loaded}
        <h2>{metaData?.title}</h2>
        <section class="shopping-journey-items">
            {#each cmsLinks as { iconUrl, linkName, subTitle, url, additionalText }}
                <a href={url} class="shopping-journey-item">
                    <section class="journey-icon">
                        <!-- <PictureTag
                            image={iconUrl}
                            width="36px;48px"
                            getAllResolutions={false}
                        /> -->
                        <ImageTag
                            imageUrls={[iconUrl]}
                            widths={[36, 48]}
                            heights={[36, 48]}
                        />
                    </section>
                    <section class="info">
                        <h3>{linkName}</h3>
                        <p class="subtitle">{subTitle}</p>
                    </section>
                    <p class="additional-text">{additionalText}</p>
                </a>
            {/each}
        </section>
    {:else}
        <h2 class="skeleton-item w-25" class:w-50={isResponsive}>&nbsp;</h2>
        <section class="shopping-journey-items">
            <div class="shopping-journey-item skeleton-item"></div>
            <div class="shopping-journey-item skeleton-item"></div>
            <div class="shopping-journey-item skeleton-item"></div>
        </section>
    {/if}
</section>

<style lang="scss">
    @import "../styles/colors.new.scss";

    .shopping-journey-container {
        h2 {
            font-size: 20px;
            font-weight: 700;
            line-height: 22px;
            color: $primary-black;
            margin: 0 0 16px;
            text-align: center;

            @include desktop-min-width {
                font-size: 36px;
                line-height: 40px;
                margin: 0 0 24px;
                text-align: unset;
            }
        }
        .shopping-journey-items {
            display: flex;
            gap: 6px;

            @include desktop-min-width {
                gap: 32px;
            }

            .shopping-journey-item {
                flex: 1 1 33%;
                padding: 8px 0;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                text-align: center;

                @include desktop-min-width {
                    background-color: $neutral-light-04;
                    gap: 24px;
                    padding: 24px;
                    text-align: unset;
                }
                .journey-icon {
                    aspect-ratio: 1;
                    height: 48px;
                }
                .info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;

                    @include desktop-min-width {
                        gap: 12px;
                    }
                }

                h3 {
                    font-size: 14px;
                    font-weight: 500;
                    line-height: 16px;
                    color: $icon-only-icon-blue;
                    margin: 0;

                    @include desktop-min-width {
                        font-size: 24px;
                        font-weight: 700;
                        line-height: 26px;
                        color: $neutral-dark-01;
                    }
                }
                p {
                    font-weight: 700;
                    margin: 0;

                    &.subtitle {
                        font-size: 11px;
                        line-height: 12px;
                        font-weight: 400;
                        color: $neutral-dark-02;

                        @include desktop-min-width {
                            font-size: 16px;
                            line-height: 18px;
                            font-weight: 700;
                        }
                    }
                    &.additional-text {
                        font-size: 14px;
                        line-height: 16px;
                        color: $icon-only-icon-blue;
                        margin-top: auto;
                        display: none;

                        @include desktop-min-width {
                            display: block;
                        }
                    }
                }
            }
        }
    }

    .skeleton-container {
        .shopping-journey-items {
            height: 140px;

            @include desktop-min-width {
                height: 234px;
            }

            .skeleton-item {
                background-color: #ddd;
            }
        }
    }
</style>
