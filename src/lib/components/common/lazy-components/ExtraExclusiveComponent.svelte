<script lang="ts">
    import { getGroupedCMSComponentsFromHybrisAsync } from "../services/hybris";
    import ImageTag from "./ImageTag.svelte";

    export let metaData;
    export function onLoad() {
        const extraShopByCategoryList =
            metaData?.extraShopByCategoryList.split(" ");
        const extraStaticPromotors = metaData?.staticPromotors.split(" ");

        return getGroupedCMSComponentsFromHybrisAsync([
            extraShopByCategoryList,
            extraStaticPromotors,
        ]).then(([shopByData, staticPromotorsData]) => {
            staticPromotors = staticPromotorsData;
            shopByCategoryList = shopByData;

            loaded =
                staticPromotors.length > 0 && shopByCategoryList.length > 0;
            return loaded;
        });
    }

    let loaded = false;
    let staticPromotors = [];
    let shopByCategoryList = [];
</script>

<section class="extra-exclusive-wrapper px48 py80">
    {#if loaded}
        <section class="exclusive-container px48">
            <section class="flex-left">
                <section class="logo-container">
                    <!-- <PictureTag
                        image={metaData?.logo}
                        height=";28px"
                        width="56px;"
                        getAllResolutions={false}
                    /> -->
                    <ImageTag imageUrls={[metaData?.logo]} maxHeight={28} />
                </section>

                <section class="title-subtitle">
                    <p class="title">{metaData?.title}</p>
                    <h3>{metaData?.description}</h3>
                </section>

                <section class="static-list">
                    {#each staticPromotors as staticPromotor}
                        <section class="static-item">
                            <!-- <PictureTag
                                image={staticPromotor.image}
                                height="36px"
                                getAllResolutions={false}
                            /> -->
                            <ImageTag
                                imageUrls={[staticPromotor.image]}
                                widths={[36]}
                                heights={[36]}
                            />
                            <p class="promotor-text">
                                {staticPromotor.description}
                            </p>
                        </section>
                    {/each}
                </section>
            </section>
            <section class="flex-right category-tile-list scrollbar-hidden">
                {#each shopByCategoryList as category}
                    <a href={category.url} class="category-tile scale-on-hover">
                        <!-- <PictureTag
                            image={category.imageUrl}
                            height="64px;80px"
                            getAllResolutions={false}
                        /> -->
                        <ImageTag
                            imageUrls={[category.imageUrl]}
                            widths={[64, 80]}
                            heights={[64, 80]}
                        />

                        <h4>{category.categoryName}</h4>
                        {#if category.mainLabel}
                            <p>{category.mainLabel}</p>
                        {/if}
                    </a>
                {/each}
            </section>
        </section>
    {:else}
        <section class="exclusive-container px48 skeleton-item"></section>
    {/if}
</section>

<style lang="scss">
    @import "../styles/colors.new.scss";

    .exclusive-container {
        background:
            url(../../images/class-pro-bg.png) no-repeat,
            $secondary-gray-02;
        background-position-x: center;
        background-position-y: top;
        background-size: contain;
        border-radius: 20px;
        padding: 24px 16px;
        display: flex;
        flex-direction: column;

        @include desktop-min-width {
            flex-direction: row;
            padding: 40px;
            background-position-y: center;
        }

        .flex-left {
            display: flex;
            flex-wrap: wrap;
            gap: 16px 12px;

            @include desktop-min-width {
                display: block;
            }

            .logo-container {
                flex-basis: 56px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .title-subtitle {
                flex-basis: calc(100% - 56px - 12px);
            }
            .static-list {
                flex-basis: 100%;
            }
        }
        &.skeleton-item {
            height: 448px;
        }

        & > * {
            flex-basis: 50%;
        }

        .title {
            margin-block: 0 4px;
            font-size: 12px;
            font-weight: 400;
            line-height: 14px;
            color: $neutral-dark-02;

            @include desktop-min-width {
                margin-block: 40px 8px;
                font-size: 16px;
                line-height: 18px;
            }
        }
        h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 700;
            line-height: 18px;
            color: $neutral-dark-02;

            @include desktop-min-width {
                font-size: 28px;
                line-height: 32px;
                max-width: 340px;
            }
        }
        .static-list {
            display: flex;
            flex-direction: column;
            gap: 24px;

            @include desktop-min-width {
                margin-top: 36px;
            }

            .static-item {
                display: flex;
                align-items: center;
                gap: 18px;

                @include desktop-min-width {
                    gap: 12px;
                }
            }
        }
        .promotor-text {
            margin: 0;
            font-size: 14px;
            font-weight: 700;
            line-height: 16px;
            color: $neutral-dark-01;

            @include desktop-min-width {
                font-size: 18px;
                font-weight: 500;
                line-height: 20px;
                max-width: 210px;
            }
        }

        .category-tile-list {
            display: flex;
            justify-content: flex-start;
            flex-basis: 100%;
            flex-wrap: nowrap;
            margin-top: 16px;
            overflow: auto hidden;
            gap: 12px;

            @include desktop-min-width {
                justify-content: flex-end;
                flex-wrap: wrap;
                flex-basis: 50%;
                overflow: auto;
                margin-top: 0;
            }

            .category-tile {
                aspect-ratio: 1;
                height: 130px;
                background-color: $primary-white;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 8px;

                :global(img) {
                    flex-grow: 1;
                    max-height: 96px;
                    object-position: center !important;

                    @include responsive {
                        max-height: 75px;
                    }
                }

                @include desktop-min-width {
                    height: 178px;
                    padding: 16px 16px 18px;
                }

                h4 {
                    color: $neutral-dark-01;
                    margin-block: auto 0;
                    font-size: 14px;
                    font-weight: 500;
                    line-height: 16px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;

                    @include desktop-min-width {
                        margin-block: 20px 8px;
                        font-size: 18px;
                        line-height: 20px;
                    }
                }
                p {
                    margin-block: 0;
                    font-size: 10px;
                    font-weight: 400;
                    line-height: 12px;
                    color: $neutral-dark-03;
                    text-align: center;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;

                    @include desktop-min-width {
                        font-size: 14px;
                        font-weight: 700;
                        line-height: 16px;
                    }
                }
            }
        }
    }
</style>
