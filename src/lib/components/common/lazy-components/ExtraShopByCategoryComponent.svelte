<script lang="ts">
    import { getAppConfig } from "../../../../lib/app-config";
    import PictureTag from "./PictureTag.svelte";

    export let data;
    const { encodedContextPath } = getAppConfig();
</script>

<a
    href={encodedContextPath + data.url}
    class="shop-by-category-container scale-on-hover"
>
    <PictureTag
        image={data.imageUrl}
        alt={data.categoryName}
        getAllResolutions={false}
        height="64px;80px"
        fetchpriority="high"
    />
    <h3>{data.categoryName}</h3>
    <p class:link-style={"subLabel" in data}>
        {data.subLabel || data.mainLabel}
    </p>
</a>

<style lang="scss">
    @import "../styles/colors.new.scss";

    .shop-by-category-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-height: 148px;
        width: 140px;
        border: 1px solid $secondary-gray-02;
        border-radius: 8px;
        padding: 16px 8px;

        @include desktop-min-width {
            width: 178px;
        }

        h3 {
            margin-block: 12px 0;
            font-size: 16px;
            font-weight: 700;
            line-height: 20px;
            color: $neutral-dark-01;
            white-space: nowrap;
            text-overflow: ellipsis;
            max-width: 100%;
            overflow: hidden;

            @include desktop-min-width {
                margin-block: 20px 0;
                font-size: 18px;
                line-height: 20px;
            }
        }
        p {
            margin-block: 4px 0;
            font-size: 12px;
            font-weight: 500;
            line-height: 16px;
            color: $neutral-dark-03;

            @include desktop-min-width {
                margin-block: 8px 0;
                font-size: 14px;
                font-weight: 700;
                line-height: 16px;
            }

            &.link-style {
                color: $icon-only-icon-blue;
            }
        }
    }
</style>
