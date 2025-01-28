<script>
    import { getAppConfig } from "../../../../lib/app-config";
    import { isMobile } from "../../../../lib/util";

    export let glyph;
    export let glyphDesktop = null;
    export let size = 18;
    export let type = "font"; // possible values: font, url, primary
    export let glyphType = null;

    export let mobileSize = size;
    export let desktopSize = mobileSize;

    let glyphInUse = !isMobile() && glyphDesktop ? glyphDesktop : glyph;

    const { extraThemeResourcePath, primaryIconRootEnabled } = getAppConfig();
    const PNG_BASE_URL = `${extraThemeResourcePath}/micro-front-end/assets/icons`;

    $: primaryIconPath =
        primaryIconRootEnabled === "true"
            ? "/primary-icons.svg"
            : `${extraThemeResourcePath}/images/primary-icons.svg`;
</script>

<svelte:window
    on:resize={() =>
        (glyphInUse = !isMobile() && glyphDesktop ? glyphDesktop : glyph)}
/>

{#if type === "font"}
    {#if glyphType == "old"}
        <i
            class="c_icon c_icon--{glyphInUse}"
            style:--glyph={glyph}
            style:--glyphDesktop={glyphDesktop}
            style:--mobile-size="{mobileSize}px"
            style:--desktop-size="{desktopSize}px"
        >
        </i>
    {:else}
        <i
            class="c_icon_new c_icon_new--{glyphInUse}"
            style:--glyph={glyph}
            style:--glyphDesktop={glyphDesktop}
            style:--mobile-size="{mobileSize}px"
            style:--desktop-size="{desktopSize}px"
        >
        </i>
    {/if}
{:else if type === "url"}
    <img
        class="img-icon"
        src={glyph}
        alt="Icon"
        style:--mobile-size="{mobileSize}px"
        style:--desktop-size="{desktopSize}px"
    />
{:else if type === "png" || type === "svg"}
    <img
        class="png-icon"
        src={`${PNG_BASE_URL}/${glyph}.${type}`}
        alt="Icon"
        style:--mobile-size="{mobileSize}px"
        style:--desktop-size="{desktopSize}px"
    />
{:else if type === "primary"}
    <svg
        class="primary-icon"
        style:--mobile-size="{mobileSize}px"
        style:--desktop-size="{desktopSize}px"
    >
        <use xlink:href="{primaryIconPath}#{glyph}"> </use>
    </svg>
{/if}

<style lang="scss">
    @import "../../common/styles/colors.new.scss";
    i {
        font-style: normal;
        font-size: var(--mobile-size);

        @include desktop-min-width {
            font-size: var(--desktop-size);
        }
    }
    .img-icon,
    .png-icon,
    .primary-icon {
        aspect-ratio: 1;
        object-fit: contain;
        height: var(--mobile-size);
        @include desktop-min-width {
            height: var(--desktop-size);
        }
    }
    .img-icon,
    .png-icon {
        height: unset;
        aspect-ratio: auto;
        height: var(--mobile-size);
        @include desktop-min-width {
            height: var(--desktop-size);
        }
    }
    .svg-icon {
        fill: #fff;
        width: 24px;
        height: 24px;
        @include desktop-min-width {
            fill: red;
        }
    }
    svg {
        pointer-events: none !important;
    }
</style>
