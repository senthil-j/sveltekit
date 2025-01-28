<script context="module">
    const isResponsive = false;
</script>

<script>
    import ImageTag from "../lazy-components/ImageTag.svelte";

    export let data;
    export let index;
    export let slidesLength;
    $: ({ link, image, mobileImage, bannerId, bannerName } = data);
</script>

<a
    class="carousel-slide"
    href={link || undefined}
    data-banner-name={bannerName}
    data-banner-id={bannerId}
    data-banner-image={isResponsive ? mobileImage : image}
>
    <ImageTag
        imageUrls={[mobileImage, image]}
        widths={[768, 1440]}
        heights={[500, 480]}
        fetchpriority={((index === 0 || index === slidesLength - 1) &&
            "high") ||
            "auto"}
        alt="hero banner"
    />
</a>

<style lang="scss">
    @import "../styles/colors.new.scss";
    .carousel-slide {
        min-height: 480px;

        @include responsive {
            min-height: 450px;
        }
    }
</style>
