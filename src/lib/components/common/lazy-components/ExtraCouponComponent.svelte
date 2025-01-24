<script lang="ts">
    import { getContextedUrl, getStr } from "../../../common/util";
    import { openSnackBar } from "../../product-details/services/pdp-data-services";
    import PictureTag from "./PictureTag.svelte";

    export let metaData;
    export function onLoad() {
        return Promise.resolve("yellow");
    }

    $: copyIconUrl =
        metaData?.copyIconUrl ||
        "/_ui/responsive/theme-extra/images/home-copyIcon.png";

    function copyCouponCode() {
        const { couponCode } = metaData;
        navigator.clipboard.writeText(couponCode).then(() => {
            openSnackBar(getStr("coupon.code.copy.success.text"));
        });
    }
</script>

<section class="coupon-container">
    <section class="image">
        <PictureTag image={metaData?.iconUrl} width="64px;96px" />
    </section>
    <section class="info">
        <h2>{metaData?.title}</h2>
        <p>{@html metaData?.content}</p>
        <span class="coupon-code">
            {metaData?.couponCode}
            {#if metaData?.isCopyCouponAllowed == "true"}
                <button class="btn-copy-code" on:click={copyCouponCode}>
                    <PictureTag image={copyIconUrl} alt="Copy coupon code" />
                </button>
            {/if}
        </span>
    </section>
    <a
        href={getContextedUrl(metaData?.cmsLink?.url)}
        class="coupon-redirect-link c_button c_button-mob-full c_button--primary"
        >{metaData?.cmsLink?.linkName}</a
    >
</section>

<style lang="scss">
    @import "../styles/colors.new.scss";

    .coupon-container {
        padding: 20px 16px;
        background-color: $primary-yellow;
        display: flex;
        gap: 24px;
        align-items: flex-start;
        flex-direction: column;

        @include desktop-min-width {
            padding: 48px;
            flex-direction: row;
        }

        .image {
            position: absolute;
            right: 16px;

            @include desktop-min-width {
                position: static;
            }
        }
        .info {
            color: $primary-black;
            flex-grow: 1;
            width: 100%;

            @include desktop-min-width {
                width: unset;
            }

            h2,
            p {
                width: 80%;

                @include desktop-min-width {
                    width: unset;
                }
            }
            h2 {
                margin: 0;
                font-size: 20px;
                font-weight: 700;
                line-height: 22px;
                color: inherit;

                @include desktop-min-width {
                    font-size: 36px;
                    line-height: 40px;
                }
            }
            p {
                margin-block: 8px 0;
                font-size: 14px;
                font-weight: 400;
                line-height: 16px;
                color: inherit;

                @include desktop-min-width {
                    font-size: 18px;
                    line-height: 20px;
                }
            }
            .coupon-code {
                padding: 8px;
                border: 1px dashed $primary-black;
                margin-top: 12px;
                border-radius: 6px;
                font-size: 16px;
                font-weight: 500;
                line-height: 20px;
                display: block;
                text-align: center;

                @include desktop-min-width {
                    display: inline-block;
                    margin-top: 22px;
                    padding: 8px 16px;
                    text-align: unset;
                }

                .btn-copy-code {
                    border: 0;
                    margin-left: 8px;
                    background-color: transparent;
                }
            }
        }
        .coupon-redirect-link {
            align-self: center;
            font-size: 16px;
            font-weight: 700;
            line-height: 18px;
            padding: 15px 36px;

            @include desktop-min-width {
                font-size: 24px;
                line-height: 28px;
                padding: 18px 36px;
            }
        }
    }
</style>
