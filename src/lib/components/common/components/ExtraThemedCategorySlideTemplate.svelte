<script context="module">
    import { getAppConfig } from "../../../../lib/app-config";
</script>

<script>
    import ImageTag from "../lazy-components/ImageTag.svelte";

    export let data;
    const { encodedContextPath } = getAppConfig();

    $: ({ iconUrl: image, linkName, subTitle, url, themeIcon } = data);
</script>

<a class="themed-tile scale-on-hover" href={encodedContextPath + url}>
    <ImageTag imageUrls={[image]} widths={[132, 192]} heights={[160, 220]} />
    <section class="info">
        {#if linkName}
            <h3>{linkName}</h3>
        {/if}
        {#if subTitle}
            <p>{subTitle}</p>
        {/if}
    </section>
    <section class="theme-icon">
        <ImageTag imageUrls={[themeIcon]} widths={[64]} heights={[64]} />
    </section>
</a>

<style lang="scss">
    @import "../styles/colors.new.scss";
    $theme-icon-size: 32px;

    .themed-tile {
        max-width: 132px;
        height: 160px;
        display: inline-block;
        position: relative;
        cursor: pointer;

        @include desktop-min-width {
            max-width: 192px;
            height: 220px;
        }

        .info {
            position: absolute;
            bottom: 12px;
            left: 12px;
            right: 12px;
            display: flex;
            gap: 8px;
            flex-direction: column;

            @include desktop-min-width {
                bottom: 16px;
                left: 24px;
                right: 24px;
                gap: 12px;
            }

            h3,
            p {
                margin: 0;
                color: $primary-white;
                font-weight: 700;
            }
            h3 {
                font-size: 14px;
                line-height: 16px;

                @include desktop-min-width {
                    font-size: 24px;
                    line-height: 26px;
                }
            }
            p {
                font-size: 14px;
                line-height: 16px;
                font-weight: 500;

                @include desktop-min-width {
                    font-weight: 700;
                }
            }
        }

        .theme-icon {
            position: absolute;
            right: -$theme-icon-size;
            top: -$theme-icon-size;
        }
    }
</style>
