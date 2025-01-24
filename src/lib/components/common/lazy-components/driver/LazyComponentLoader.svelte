<script lang="ts">
    import { onMount } from "svelte";
    import CMSExternalLinksComponent from "../CMSExternalLinksComponent.svelte";
    import ExtraAmplienceBannerComponent from "../ExtraAmplienceBannerComponent.svelte";
    import ExtraClearanceSaleComponent from "../ExtraClearanceSaleComponent.svelte";
    import ExtraShopByCategoryListComponent from "../ExtraShopByCategoryListComponent.svelte";
    import ExtraUpcomingOrdersWidgetComponent from "../ExtraUpcomingOrdersWidgetComponent.svelte";
    import { cardClassesMap, slotGroups } from "./common-mapper";

    export let slotName: string;
    export let componentUids: string[];
    export let componentsData: any[];

    let element;
    let cardHidden = false;
    let cardDynamicStyles = undefined;
    let childClassesAndStyles: { classnames: string; styles: string }[] = [];

    $: additionalClasses = getAdditionalClasses(
        slotName,
        componentUids?.length > 0 && componentUids[0],
    );

    const fullWidthArray = [
        "ExtraProductCategoryComponent",
        "ExtraCategoryServiceComponent",
    ];
    let contentClassName = "";
    if (fullWidthArray.includes(componentsData[0]?.typeCode)) {
        contentClassName = "content-fullwidth";
    }
    let childrenOnLoadFns =
        componentUids?.length > 0 && Array(componentUids.length);
    let childrenOnViewportFns =
        componentUids?.length > 0 && Array(componentUids.length);

    $: childComponents =
        componentUids?.length > 0 &&
        componentUids.map((uid) => getComponentAsync(uid));

    onMount(() => {
        const rootMarginBlock = "250px";
        const rootMarginInline = "0px";
        const io = new IntersectionObserver(onIntersectionObservation, {
            rootMargin: `${rootMarginBlock} ${rootMarginInline} ${rootMarginBlock} ${rootMarginInline}`,
        });
        const vp = new IntersectionObserver(onViewportIntersectionObserve);
        setTimeout(() => {
            io.observe(element);
            vp.observe(element);
        });
    });

    function getHeightForUid(uid) {
        const uidToHeightMap = {
            "extraMainPageBannerSlot-homepage": "505px",
            dealsCategoryListComponent: "442px",
        };

        if (uid in uidToHeightMap) {
            console.log("[Lazy] height:", uidToHeightMap[uid]);
            return uidToHeightMap[uid];
        }
        return undefined;
    }

    function onIntersectionObservation(
        entries: IntersectionObserverEntry[],
        observer: IntersectionObserver,
    ) {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                Promise.all(childComponents).then((results) => {
                    callChildrenOnLoads();
                    observer.unobserve(element);
                });
            }
        });
    }
    function onViewportIntersectionObserve(
        entries: IntersectionObserverEntry[],
        observer: IntersectionObserver,
    ) {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                Promise.all(childComponents).then((results) => {
                    console.log("Calling onLoad for •••", results);
                    callChildrenOnViewport();
                    observer.unobserve(element);
                });
            }
        });
    }

    async function getComponentAsync(uid: string) {
        const compData = componentsData.find((c) => c?.uid === uid);
        let componentPromise, metaData;

        if (compData) {
            metaData = compData;
            const typeCode = compData.typeCode;
            switch (typeCode) {
                case "ExtraAmplienceBannerComponent":
                    componentPromise = Promise.resolve({
                        default: ExtraAmplienceBannerComponent,
                    });
                    break;
                case "CMSExternalLinksComponent":
                    componentPromise = Promise.resolve({
                        default: CMSExternalLinksComponent,
                    });
                    break;
                case "ExtraShopByCategoryListComponent":
                    componentPromise = Promise.resolve({
                        default: ExtraShopByCategoryListComponent,
                    });
                    break;
                case "ExtraClearanceSaleComponent":
                    componentPromise = Promise.resolve({
                        default: ExtraClearanceSaleComponent,
                    });
                    break;
                case "ExtraUpcomingOrdersWidgetComponent":
                    componentPromise = Promise.resolve({
                        default: ExtraUpcomingOrdersWidgetComponent,
                    });
                    break;

                default:
                    componentPromise = import("./LazyComponents.svelte").then(
                        (res) => ({
                            default:
                                typeCode in res
                                    ? res[typeCode]
                                    : res.NoComponentFound,
                        }),
                    );
            }
        } else {
            metaData = { uid };
            componentPromise = import("./LazyComponents.svelte").then(
                (res) => ({ default: res.NoComponentFound }),
            );
        }
        return componentPromise.then(({ default: component }) =>
            Object.assign({}, { metaData, component }),
        );
    }

    function callChildrenOnLoads() {
        const childLoadPromises: Promise<boolean>[] = [];
        childrenOnLoadFns.forEach((onLoadFn) => {
            if (typeof onLoadFn === "function") {
                const result = onLoadFn();
                const hasReturnValue = typeof result !== "undefined";
                if (hasReturnValue) {
                    if (result instanceof Promise) {
                        childLoadPromises.push(result);
                    } else if (
                        typeof result === "boolean" ||
                        typeof result === "object"
                    ) {
                        childLoadPromises.push(Promise.resolve(result));
                    }
                } else {
                    childLoadPromises.push(Promise.resolve(true));
                }
            }
        });

        if (childLoadPromises.length > 0) {
            Promise.all(childLoadPromises)
                .then((childLoadResults) => {
                    // childLoadResults.length === childLength
                    childClassesAndStyles = childLoadResults.map(
                        (clr: any, index) => {
                            let classesAndStyles = {
                                classnames: "",
                                styles: "",
                            };
                            if (clr === false) {
                                classesAndStyles.classnames = "cardHidden";
                            } else if (typeof clr === "string") {
                                classesAndStyles.classnames = clr;
                            } else if (typeof clr === "object") {
                                if ("className" in clr) {
                                    classesAndStyles.classnames = clr.className;
                                }
                                if ("style" in clr) {
                                    classesAndStyles.styles = clr.style;
                                }
                            }
                            if ("containerClasses" in componentsData[index]) {
                                classesAndStyles.classnames +=
                                    " " +
                                    componentsData[index].containerClasses;
                            }

                            return classesAndStyles;
                        },
                    );
                })
                .catch(() => {
                    cardHidden = false;
                });
        } else {
            cardHidden = false;
        }
    }

    function callChildrenOnViewport() {
        childrenOnViewportFns.forEach((onVPFn) => {
            if (typeof onVPFn === "function") {
                onVPFn();
            }
        });
    }

    function getAdditionalClasses(slotname, uid) {
        if (slotname in cardClassesMap) {
            return cardClassesMap[slotname];
        }
        if (uid in cardClassesMap) {
            return cardClassesMap[uid];
        }
        return "";
    }
</script>

{#if slotName in slotGroups}
    <div
        class="card {additionalClasses}"
        style={cardDynamicStyles}
        class:cardHidden
        data-slotname={slotName}
        bind:this={element}
    >
        <div class="content {contentClassName}">
            {#each childComponents as childComponent, index}
                {#await childComponent}
                    <div
                        class="empty-container"
                        style="height: {getHeightForUid(componentUids[index])}"
                    ></div>
                {:then { metaData, component }}
                    {#if !("HIDE_COMPONENT" in metaData)}
                        <svelte:component
                            this={component}
                            bind:onLoad={childrenOnLoadFns[index]}
                            bind:onViewport={childrenOnViewportFns[index]}
                            {metaData}
                        />
                    {/if}
                {/await}
            {/each}
        </div>
    </div>
{:else}
    <div class="slot-wrapper" bind:this={element}>
        {#each childComponents as childComponent, index}
            <div
                class="card {additionalClasses} {childClassesAndStyles[index]
                    ?.classnames}"
                style={childClassesAndStyles[index]?.styles}
                class:cardHidden
                data-slotname={slotName}
            >
                <div class="content {contentClassName}">
                    {#await childComponent}
                        <div
                            class="empty-container"
                            style="height: {getHeightForUid(componentUids[index])}"
                        ></div>
                    {:then { metaData, component }}
                        {#if !("HIDE_COMPONENT" in metaData)}
                            <div
                                class="child-component-wrapper"
                                data-typecode={metaData?.typeCode}
                            >
                                <svelte:component
                                    this={component}
                                    bind:onLoad={childrenOnLoadFns[index]}
                                    bind:onViewport={childrenOnViewportFns[index]}
                                    {metaData}
                                />
                            </div>
                        {/if}
                    {/await}
                </div>
            </div>
        {/each}
    </div>
{/if}

<style lang="scss">
    @import "../../styles/colors.new.scss";

    .card {
        background-color: $primary-white;
        position: relative;

        &.cardHidden {
            display: none;
        }

        .content {
            max-width: 1440px;
            margin-inline: auto;
            &.content-fullwidth {
                max-width: 100%;
            }

            :global {
                .py80 {
                    padding-block: 40px;

                    @include desktop-min-width {
                        padding-block: 80px;
                    }
                }
                .px48 {
                    padding-inline: 16px;

                    @include desktop-min-width {
                        padding-inline: 48px;
                    }
                }

                .scrollbar-hidden {
                    &::-webkit-scrollbar {
                        width: 0;
                        height: 0;
                    }
                }
                .scale-on-hover {
                    transition: transform 250ms ease;

                    &:hover {
                        transform: scale(0.95);
                    }
                }
                .skeleton-item {
                    border: 0;
                    background-color: #ddd;
                    animation: skeleton-animation 2s infinite ease;
                    pointer-events: none;
                    flex-shrink: 0;

                    &.w-10 {
                        border-radius: 100px;
                        width: 10%;
                    }
                    &.w-25 {
                        border-radius: 100px;
                        width: 25%;
                    }
                    &.w-50 {
                        border-radius: 100px;
                        width: 50%;
                    }
                    &.w-75 {
                        border-radius: 100px;
                        width: 75%;
                    }
                    &.w-100 {
                        border-radius: 100px;
                        width: 100%;
                    }
                }
                @keyframes skeleton-animation {
                    0% {
                        filter: opacity(1);
                    }
                    50% {
                        filter: opacity(0.5);
                    }
                    100% {
                        filter: opacity(1);
                    }
                }

                .product-carousel-container + .product-carousel-container {
                    margin-top: -80px;
                }
            }
        }
        &.light-03-card {
            background-color: $neutral-light-03;
        }
        &.dark {
            background-color: $primary-black;
        }
        &.light {
            background-color: $neutral-light-04;
        }
        &::before,
        &::after {
            display: none;
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            height: 20px;
            background-color: $neutral-light-04;
            box-shadow:
                0px 1px 1px 0px rgba(0, 0, 0, 0.04) inset,
                0px -1px 1px 0px rgba(0, 0, 0, 0.04) inset;
        }
        &.divider-white {
            &::before,
            &::after {
                background-color: $primary-white;
            }
        }
        &.divider-top {
            margin-top: 20px;
            &::before {
                display: block;
                top: -20px;
            }
        }
        &.divider-bottom {
            margin-bottom: 20px;
            &::after {
                display: block;
                bottom: -20px;
            }
        }
        &.divider-sponsored {
            margin-bottom: 25px;
            &::after {
                height: 25px;
                display: block;
                bottom: -25px;
            }
        }
        &.yellow {
            background-color: $primary-yellow;
        }
        &.multi-banner-card .content {
            padding: 40px 16px;
            display: flex;
            column-gap: 16px;
            row-gap: 16px;
            flex-wrap: wrap;

            @include desktop-min-width {
                padding: 80px 48px;
                row-gap: 80px;
                column-gap: 24px;
            }

            /*
            //sveltekit sass
            :global {
                .clearance-sale-container,
                .multi-banners-grid {
                    flex-basis: 100%;

                    @include desktop-min-width {
                        flex-basis: calc(50% - 24px);
                    }
                }
                .shop-by-category-container {
                    flex-basis: 100%;
                }
            }
            */
            
        }
        &.super-wide-card .content {
            max-width: 100%;
        }
        &.transparent-card {
            background-color: transparent;
            box-shadow: none;
        }
        &.full-width-card .content {
            max-width: unset;
        }
    }
</style>
