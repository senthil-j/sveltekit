<!-- This is v2 of PictureTag -->
<script>
    // imageUrl : [ mobileImage, desktopImage ] OR [ mobileDesktopImage ]
    export let imageUrls= [];
    // widths: [ mobileWidth, desktopWidth ] OR [ mobileDesktopWidth ] OR [] for 100% width
    export let widths = [];
    // heights: [ mobileHeight, desktopHeight ] OR [ mobileDesktopHeight ]
    export let heights = [];
    export let maxHeight = undefined;
    export let objectFit = "contain";
    export let objectPosition = "left center";
    export let fetchpriority = "auto";
    export let alt = "noname";

    let loadingAttr;
    $: loadingAttr = fetchpriority === "auto" ? "lazy" : undefined;
    $: widthAttr =
        widths?.length === 2
            ? widths[1]
            : widths[0] || undefined;
    $: heightAttr =
         heights?.length === 2
            ? heights[1]
            : heights[0] || undefined;
    $: srcsetAttr = generateSrcSet(imageUrls, widths, maxHeight);
    $: sizesAttr = getSizes(widths);

    function generateSrcSet(
        imageUrls,
        widths,
        maxHeight,
    ){
        const MAX_PIXEL_DENSITY = 2;
        const MOBILE_MAX_WIDTH_PX = 899;
        const _w = widths?.length >= 2 ? [...widths] : [widths[0], widths[0]];
        const _urls =
            imageUrls?.length >= 2
                ? [...imageUrls]
                : [imageUrls[0], imageUrls[0]];

        if (!!maxHeight) {
            console.log("Yoyo");
        }

        const srcsetMobile = [];
        const srcsetDesktop = [];
        for (let pxd = 1; pxd <= MAX_PIXEL_DENSITY; pxd++) {
            const _u = _urls[1];
            srcsetMobile.push(
                getSingleSrcsetString(_u, _w[0] * pxd, maxHeight),
            );
            srcsetDesktop.push(
                getSingleSrcsetString(_u, _w[1] * pxd, maxHeight),
            );
        }

        const finalSrcset = [...srcsetMobile, ...srcsetDesktop].join(", ");
        console.log("[ImageTag] finalSrcset:", finalSrcset);
        return finalSrcset;
    }
    function getSingleSrcsetString(
        url,
        width,
        maxHeight,
    ) {
        if (!url) return "";
        if (url?.startsWith("//")) {
            url = window.location.protocol + url;
        }
        const urlObject = new URL(url);

        urlObject.searchParams.set("fmt", "auto");

        if (typeof width === "number" && !isNaN(width)) {
            urlObject.searchParams.set("w", width.toString());
            return `${urlObject.href} ${width}w`;
        } else if (typeof maxHeight === "number") {
            urlObject.searchParams.set("h", maxHeight.toString());
            return `${urlObject.href}`;
        }
    }
    function getSizes(widths) {
        /*
            (max-width: 899px) {widths[0]}px, {widths[1]}px
        */
        const MOBILE_MAX_WIDTH_PX = 899;
        if (widths.length === 2) {
            return `(max-width: ${MOBILE_MAX_WIDTH_PX}px) ${widths[0]}px, ${widths[1]}px`;
        } else if (widths.length === 1) {
            return `${widths[0]}px`;
        } else {
            return `100vw`;
        }
    }
</script>

<img
    src="#"
    loading={loadingAttr}
    width={widthAttr}
    height={heightAttr}
    srcset={srcsetAttr}
    sizes={sizesAttr}
    {fetchpriority}
    {alt}
    style:max-height={(maxHeight && maxHeight + "px") || undefined}
    style:object-fit={objectFit}
    style:object-position={objectPosition}
/>
