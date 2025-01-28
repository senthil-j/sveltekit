<script>
    import { createEventDispatcher } from "svelte";
    import {
    	getAllImageSrcsets,
    	separateMobileDesktopParamsFromString,
    } from "../../../../lib/amplience";

    export let image;
    export let mobileImage = undefined;
    export let width = undefined;
    export let height = undefined;
    export let getAllResolutions = true;
    export let alt = "";
    export let imagePosition = "center center";
    export let templateName = "";
    export let fetchpriority = "auto";

    $: isResponsive = false;
    $: isAmplienceImage = image && !image.includes("windows.net");
    $: pictureSrcsets =
        image &&
        getAllImageSrcsets(
            image,
            mobileImage,
            getAllResolutions,
            templateName,
            width,
            height,
        );

    $: widthValueObj =
        (width?.length > 0 && separateMobileDesktopParamsFromString(width)) ||
        null;
    $: lengthUnit = (width || height || []).includes("%") ? "%" : "px";
    $: widthNumber =
        (!!widthValueObj &&
            parseInt(
                isResponsive ? widthValueObj.mobile : widthValueObj.desktop,
            )) ||
        undefined;
    $: heightValueObj =
        (height?.length > 0 && separateMobileDesktopParamsFromString(height)) ||
        null;
    $: heightNumber =
        (!!heightValueObj &&
            parseInt(
                isResponsive ? heightValueObj.mobile : heightValueObj.desktop,
            )) ||
        undefined;
    let loaded = false;
    const dispatcher = createEventDispatcher();

    function onImageLoad(e) {
        loaded = true;
        dispatcher("load", e);
    }

    function getWidthHeightStyleString(width, height, isResponsive) {
        // height: {height}; width: {width}
        if (width === undefined && height === undefined) {
            return "";
        }

        let outArray = [];
        let widthSplit = width?.split(";") || [];
        let heightSplit = height?.split(";") || [];

        //// NEW LOGIC ////
        if (widthSplit.length > 0) {
            //                       [1px] [1px, 2px], ['', 2px], [1px, '']
            // responsive: true =>    YES      YES        NO          YES
            // responsive: false =>   YES      YES        YES         NO

            if (
                isResponsive &&
                !(widthSplit.length === 2 && widthSplit[0].length === 0)
            ) {
                outArray.push(`width: ${widthSplit[0]}`);
            } else if (
                !isResponsive &&
                !(
                    widthSplit.length === 2 &&
                    (!widthSplit[1] || widthSplit[1].length === 0)
                )
            ) {
                if (widthSplit[1]?.length > 0)
                    outArray.push(`width: ${widthSplit[1]}`);
                else if (widthSplit[0]?.length > 0)
                    outArray.push(`width: ${widthSplit[0]}`);
            }
        }
        if (heightSplit.length > 0) {
            //                       [1px] [1px, 2px], ['', 2px], [1px, '']
            // responsive: true =>    YES      YES        NO          YES
            // responsive: false =>   YES      YES        YES         NO

            if (
                isResponsive &&
                !(heightSplit.length === 2 && heightSplit[0].length === 0)
            ) {
                outArray.push(`height: ${heightSplit[0]}`);
            } else if (
                !isResponsive &&
                !(heightSplit.length === 2 && heightSplit[1].length === 0)
            ) {
                if (heightSplit[1]?.length > 0)
                    outArray.push(`height: ${heightSplit[1]}`);
                else if (heightSplit[0]?.length > 0)
                    outArray.push(`height: ${heightSplit[0]}`);
            }
        }
        //////////////////

        return outArray.join(";");
    }
</script>

<picture
    class:visible={loaded}
    style="--img-width:{widthNumber}{lengthUnit}; --img-height:{heightNumber}{lengthUnit}"
>
    {#if pictureSrcsets?.length > 0 && isAmplienceImage}
        {#each pictureSrcsets as { media, type, srcset }}
            <source {media} {type} {srcset} />
        {/each}
        <img
            width={widthValueObj &&
                parseInt(
                    isResponsive ? widthValueObj.mobile : widthValueObj.desktop,
                )}
            height={heightValueObj &&
                parseInt(
                    isResponsive
                        ? heightValueObj.mobile
                        : heightValueObj.desktop,
                )}
            fetchpriority={fetchpriority !== "auto" ? fetchpriority : undefined}
            loading={fetchpriority === "auto" ? "lazy" : undefined}
            style={`object-position:${imagePosition}`}
            on:load={onImageLoad}
            src={pictureSrcsets[0].srcset}
            {alt}
        />
    {:else}
        <img
            width={widthValueObj &&
                parseInt(
                    isResponsive ? widthValueObj.mobile : widthValueObj.desktop,
                )}
            height={heightValueObj &&
                parseInt(
                    isResponsive
                        ? heightValueObj.mobile
                        : heightValueObj.desktop,
                )}
            fetchpriority={fetchpriority !== "auto" ? fetchpriority : undefined}
            loading={fetchpriority === "auto" ? "lazy" : undefined}
            style={`object-position:${imagePosition}`}
            on:load={onImageLoad}
            src={image}
            {alt}
        />
    {/if}
</picture>

<style lang="scss">
    picture {
        visibility: hidden;
        opacity: 0;
        transition: opacity 250ms ease;

        img {
            width: var(--img-width, auto);
            height: var(--img-height, auto);
            aspect-ratio: auto;
            object-fit: contain;
            max-width: 100%;
            max-height: 100%;
        }

        &.visible {
            visibility: visible;
            opacity: 1;
        }
    }
</style>
