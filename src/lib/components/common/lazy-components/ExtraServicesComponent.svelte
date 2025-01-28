<script>
    import { getCMSComponentsFromHybrisAsync, getUrlWithQueryParams } from "../../../../lib/ajax-services";
    import { getContextedUrl } from "../../../../lib/util";
    import Icon from "../components/Icon.svelte";
    import ImageTag from "./ImageTag.svelte";

    export let metaData;
    export async function onLoad() {
        const cmsComponents = metaData?.cmsComponents.split(" ");

        const urlParams = getCMSComponentsFromHybrisAsync(cmsComponents);
        const apiUrl = await getUrlWithQueryParams(urlParams.url, urlParams.params);

        await fetch(apiUrl)
        .then((res) => res.json())
            .then((res) => res.component)
            .then((cmsComponentsArray) =>
                resolveChildCMSLinks(cmsComponentsArray),
            )
            .then((componentData) => (childSectionDataList = componentData))
            .then(() => (loaded = true));
    }

      function resolveChildCMSLinks(cmsArray) {
        const miniPromises = cmsArray.map(async (c) => {
            if (c.typeCode === "CMSExternalLinksComponent") {
                const _cmsLinks = c.cmsLinks.split(" ");
                const urlParams = getCMSComponentsFromHybrisAsync(_cmsLinks);
                const apiUrl = await getUrlWithQueryParams(urlParams.url, urlParams.params);

                return await fetch(apiUrl)
                .then((res) => res.json())
                    .then((res) => res.component)
                    .then((linksArray) =>
                        Object.assign({}, c, { cmsLinks: linksArray }),
                    );
            } else {
                return Promise.resolve(c);
            }
        });

        return Promise.all(miniPromises);
    }

    let loaded = false;
    let childSectionDataList = [];
</script>

<section class="extra-services-container px48 py80">
    <h2>{metaData?.title}</h2>
    <section class="child-sections-container scrollbar-hidden">
        {#if loaded}
            {#each childSectionDataList as childSection}
                <section class="child">
                    {#if childSection.typeCode === "CMSParagraphComponent"}
                        {@html childSection.content}
                    {:else if childSection.typeCode === "CMSExternalLinksComponent"}
                        <div class="c_more-slot-content-box-title">
                            {childSection.title}
                        </div>
                        <p class="c_more-slot-content-box-description">
                            {childSection.subTitle}
                        </p>
                        <section class="links-container">
                            {#each childSection.cmsLinks as linkData}
                                <a
                                    href={getContextedUrl(linkData.url)}
                                    class="the-link scale-on-hover"
                                >
                                    <section class="data">
                                        <!-- <PictureTag
                                            image={linkData.iconUrl}
                                            height="20px"
                                            getAllResolutions={false}
                                        /> -->
                                        <ImageTag
                                            imageUrls={[linkData.iconUrl]}
                                            widths={[48]}
                                            heights={[20]}
                                        />
                                        <div class="text">
                                            {@html linkData.subTitle}
                                            <span
                                                style="color: {linkData.titleColorCode}"
                                                >{linkData.linkName}</span
                                            >
                                        </div>
                                    </section>
                                    <section class="icon">
                                        <Icon
                                            type="font"
                                            glyph="chevron_right"
                                            mobileSize={18}
                                            desktopSize={24}
                                        />
                                    </section>
                                </a>
                            {/each}
                        </section>
                    {/if}
                </section>
            {/each}
        {:else}
            <section class="child skeleton-item"></section>
            <section class="child skeleton-item"></section>
            <section class="child skeleton-item"></section>
        {/if}
    </section>
</section>

<style lang="scss">
    @import "../styles/colors.new.scss";

    .extra-services-container {
        h2 {
            margin-block: 0 16px;
            font-size: 20px;
            font-weight: 700;
            line-height: 22px;
            color: $primary-black;

            @include desktop-min-width {
                margin-block: 0 24px;
                font-size: 36px;
                line-height: 40px;
            }
        }
        .child-sections-container {
            display: flex;
            gap: 16px;
            overflow: auto hidden;

            @include desktop-min-width {
                gap: 32px;
                overflow: unset;
            }

            .child {
                background-color: $neutral-light-04;
                border-radius: 8px;
                padding: 24px 16px;
                flex: 1 0 85%;

                @include desktop-min-width {
                    border-radius: 12px;
                    padding: 32px;
                    flex: 1 0 33%;
                }

                &.skeleton-item {
                    height: 436px;
                }
                /*
                :global {
                    .c_more-slot-content-box-title {
                        font-size: 16px;
                        font-weight: 400;
                        line-height: 18px;
                        margin: 0;
                        color: $neutral-dark-01;

                        @include desktop-min-width {
                            font-size: 28px;
                            line-height: 32px;
                        }
                    }
                    .c_more-slot-content-box-description {
                        font-size: 14px;
                        font-weight: 700;
                        line-height: 16px;
                        margin-block: 0;
                        color: $neutral-dark-03;

                        @include desktop-min-width {
                            font-size: 16px;
                            line-height: 18px;
                        }
                    }
                    .c_more-slot-content-links-link {
                        font-size: 14px;
                        font-weight: 700;
                        line-height: 16px;
                        color: $icon-only-icon-blue;
                    }
                    .c_more-slot-content-app-details-scan {
                        padding-right: 16px;

                        @include desktop-min-width {
                            padding-right: 26px;
                        }

                        img {
                            object-fit: contain;
                            padding: 8px;

                            @include desktop-min-width {
                                padding: 16px;
                            }
                        }
                    }
                    .c_more-slot-content-app-details-scan-text {
                        padding-bottom: 8px;

                        @include desktop-min-width {
                            padding-bottom: 16px;
                        }
                    }
                    .c_more-slot-content-app-details {
                        padding-top: 40px;

                        @include desktop-min-width {
                            padding-top: 80px;
                        }
                    }
                    .links-container {
                        margin-top: 24px;
                        display: flex;
                        flex-direction: column;
                        gap: 8px;

                        @include desktop-min-width {
                            gap: 16px;
                        }
                        .the-link {
                            display: flex;
                            align-items: center;
                            padding: 12px 8px;
                            border: 1px solid $secondary-gray-02;
                            border-radius: 4px;
                            background-color: $primary-white;

                            @include desktop-min-width {
                                padding: 16px;
                                border-radius: 8px;
                            }
                            .data {
                                display: flex;
                                flex-direction: column;
                                justify-content: space-between;
                                gap: 12px;
                                flex-grow: 1;

                                .text {
                                    font-size: 14px;
                                    font-weight: 700;
                                    line-height: 16px;
                                    color: $neutral-dark-01;

                                    @include desktop-min-width {
                                        font-size: 16px;
                                        line-height: 18px;
                                    }
                                }
                            }
                        }
                    }
                }*/
            }
        }
    }
</style>
