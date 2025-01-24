<script lang="ts">
    import { fade } from "svelte/transition";
    import MultiBannerItem from "./MultiBannerItem.svelte";
    import {
        getDataFromAmplienceAsync,
        parseMultiImageBannersData,
    } from "../../services/amplience";
    import { getJoodMembershipBasedPropertyValue } from "../../../../common/util";

    export let metaData;

    export function onLoad() {
        const amplienceId = getJoodMembershipBasedPropertyValue(
            metaData,
            "amplienceId",
            "blueAmplienceId",
            "goldAmplienceId",
        );
        return getDataFromAmplienceAsync(amplienceId)
            .then((res: any) => parseMultiImageBannersData(res))
            .then((data) => (bannersData = data))
            .then(() => (loaded = true))
            .catch(() => (failedToLoad = true));
    }

    let bannersData: any[] = [];
    let loaded: boolean = false;
    let failedToLoad: boolean = false;
</script>

{#if !failedToLoad}
    {#if loaded}
        <section class="multi-banners-grid" in:fade>
            {#each bannersData as bannerData}
                <MultiBannerItem {bannerData} on:click />
            {/each}
        </section>
    {:else}
        <section class="skeleton-container multi-banners-grid">
            <section class="skeleton-item"></section>
            <section class="skeleton-item"></section>
            <section class="skeleton-item"></section>
            <section class="skeleton-item"></section>
        </section>
    {/if}
{/if}

<style lang="scss">
    @import "../../styles/colors.new.scss";

    .multi-banners-grid {
        display: grid;
        grid-auto-rows: 1fr;
        grid-template-columns: 1fr 1fr;
        gap: 16px;

        @include desktop-min-width {
            gap: 24px;
            height: 560px;
        }
        .skeleton-item {
            height: 268px;
            border-radius: 20px;
        }
    }
</style>
