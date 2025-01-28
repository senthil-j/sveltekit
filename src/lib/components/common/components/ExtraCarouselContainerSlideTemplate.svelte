<script lang="ts" context="module">
    import PictureTag from "../lazy-components/PictureTag.svelte";
    const isResponsive = false;
</script>

<script lang="ts">
    export let data;
    export let index;
    export let slidesLength;
    
    const height = "100%";
    const width = "100%";

    $: ({ link, image, mobileImage, bannerId, bannerName } = data);
</script>

<a
    class="carousel-slide"
    href={link || undefined}
    data-banner-name={bannerName}
    data-banner-id={bannerId}
    data-banner-image={isResponsive ? mobileImage : image}
>
    <PictureTag
        fetchpriority={((index === 0 || index === slidesLength - 1) &&
            "high") ||
            "auto"}
        {width}
        {height}
        {image}
        {mobileImage}
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
