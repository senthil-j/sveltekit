<script lang="ts">
    import { intervalToDuration, isAfter } from "date-fns";
    import { onDestroy } from "svelte";
    import { fade } from "svelte/transition";
    import { getAppConfig } from "../../../common/config/app-config";
    import {
        getContextedUrl,
        getLangSpecificFieldname,
        numberTo2Digits,
    } from "../../../common/util";
    import Text from "../components/Text.svelte";
    import {
        OPTION_ATTRIBUTES_TO_RETRIEVE,
        getProductsFromAlgoliaAsync,
    } from "../services/algolia";
    import PictureTag from "./PictureTag.svelte";

    export let metaData;

    export function onLoad() {
        const endTime = metaData.validUptoTime;
        validUptoTime = new Date(endTime);
        isValid = isAfter(validUptoTime, Date.now());

        startTimer(endTime);
        const productCodes = metaData.productCarousal?.productCodes.split(" ");

        if (productCodes.length > +metaData.maxProductsToDisplay) {
            productCodes.length = +metaData.maxProductsToDisplay;
        }

        return getProductsFromAlgoliaAsync(
            productCodes,
            OPTION_ATTRIBUTES_TO_RETRIEVE([
                "amplienceProductBaseUrl",
                "nameEn",
                "nameAr",
                "urlAr",
                "urlEn",
            ]),
        ).then((res: any) => {
            if ("hits" in res) {
                products = res.hits;
                loaded = true;
                return Promise.resolve(true);
            }
            return Promise.resolve(false);
        });
    }

    const { lang } = getAppConfig();

    let isValid = true;
    let timeoutId: any;
    let validUptoTime: Date;
    let timeLeft: any;
    let products = [];
    let loaded = false;

    function startTimer(endTime) {
        if (!isNaN(validUptoTime.valueOf())) {
            timeoutId = setTimeout(() => {
                if (isAfter(validUptoTime, Date.now())) {
                    const duration = intervalToDuration({
                        start: Date.now(),
                        end: validUptoTime,
                    });
                    timeLeft = Object.assign(
                        {},
                        {
                            days: numberTo2Digits(duration.days),
                            hours: numberTo2Digits(duration.hours),
                            minutes: numberTo2Digits(duration.minutes),
                            seconds: numberTo2Digits(duration.seconds),
                        },
                    );
                    startTimer(endTime);
                } else {
                    isValid = false;
                    const z = numberTo2Digits(0);
                    timeLeft = {
                        days: z,
                        hours: z,
                        minutes: z,
                        seconds: z,
                    };
                }
            }, 1000);
        }
    }
    function stopTimer() {
        clearTimeout(timeoutId);
    }

    onDestroy(() => {
        stopTimer();
    });
</script>

{#if isValid}
    {#if loaded}
        <section class="clearance-sale-container" in:fade>
            {#if timeLeft}
                <section class="timer">
                    <span class="timer-container">
                        <span
                            >{timeLeft.days}&nbsp;<Text
                                key="text.countdown.days"
                            /></span
                        >
                        <span>:</span>
                        <span
                            >{timeLeft.hours}&nbsp;<Text
                                key="text.countdown.hrs.text"
                            /></span
                        >
                        <span>:</span>
                        <span
                            >{timeLeft.minutes}&nbsp;<Text
                                key="text.countdown.mins"
                            /></span
                        >
                        <span>:</span>
                        <span
                            >{timeLeft.seconds}&nbsp;<Text
                                key="text.countdown.sec"
                            /></span
                        >
                    </span>
                </section>
            {/if}
            <h2>{metaData?.title}</h2>
            <p>{metaData?.subTitle}</p>
            <a
                href={getContextedUrl(metaData.clearanceLink.url)}
                class="clearance-link c_button c_button-mob-full c_button--primary"
                >{metaData?.clearanceLink?.linkName}</a
            >
            <section class="product-list-scroll-wrapper scrollbar-hidden">
                <section class="product-list-container">
                    {#each products as product}
                        <a
                            title={product[
                                getLangSpecificFieldname("name", lang)
                            ]}
                            href={getContextedUrl(
                                product[getLangSpecificFieldname("url", lang)],
                            )}
                            class="mini-product-tile scale-on-hover"
                        >
                            <!-- <img src="{product.amplienceProductBaseUrl}" alt="{product.nameEn}"> -->
                            <PictureTag
                                image={product.amplienceProductBaseUrl}
                                alt={product.nameEn}
                                getAllResolutions={false}
                                height="64px"
                            />
                        </a>
                    {/each}
                </section>
            </section>
        </section>
    {:else}
        <section class="clearance-sale-container skeleton-item"></section>
    {/if}
{/if}

<style lang="scss">
    @import "../styles/colors.new.scss";

    .clearance-sale-container {
        background-color: $secondary-gray-02;
        border-radius: 20px;
        padding: 0 16px 20px;
        overflow: hidden;
        position: relative;

        @include desktop-min-width {
            padding: 0 40px 40px;
            min-height: 560px;
        }

        .timer {
            color: $primary-yellow;
            background-color: $primary-black;
            margin-inline: -40px;
            padding: 8px;
            font-size: 14px;
            font-weight: 700;
            line-height: 16px;
            text-align: center;

            .timer-container {
                display: inline-flex;
                align-items: center;
                gap: 16px;

                @include desktop-min-width {
                    gap: 24px;
                }
            }
        }
        h2 {
            font-size: 20px;
            font-weight: 700;
            line-height: 22px;
            color: $neutral-dark-01;
            margin: 16px 0 0;

            @include desktop-min-width {
                font-size: 36px;
                line-height: 40px;
                margin: 28px 0 0;
            }
        }
        p {
            font-size: 14px;
            font-weight: 400;
            line-height: 16px;
            color: $neutral-dark-01;
            margin: 4px 0 0;

            @include desktop-min-width {
                font-size: 16px;
                margin: 8px 0 0;
                line-height: 18px;
            }
        }
        a.clearance-link {
            margin: 12px 0 0;
            padding: 10px 16px;
            width: fit-content;

            @include desktop-min-width {
                padding: 15px 36px;
                margin: 36px 0 0;
                width: initial;
            }
        }

        .product-list-scroll-wrapper {
            overflow-x: auto;
        }
        .product-list-container {
            margin-top: 20px;
            display: inline-flex;
            flex-wrap: nowrap;
            gap: 8px;

            @include desktop-min-width {
                position: absolute;
                left: 40px;
                right: 40px;
                bottom: 40px;
                gap: 20px;
                flex-wrap: wrap;
                margin-top: 0;
            }

            .mini-product-tile {
                width: 80px;
                aspect-ratio: 1;
                background-color: $primary-white;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;

                @include desktop-min-width {
                    width: 120px;
                    padding: 12px 24px;
                    border-radius: 12px;
                }

                img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }
            }
        }
    }
</style>
