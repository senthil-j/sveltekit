<script>
    import { page } from '$app/stores';
    import LazyComponentLoader from '../../lib/components/common/lazy-components/driver/LazyComponentLoader.svelte';
    const { language, store} = $page?.params;
    export let data;
    const {slotNameToGroupedUidsArray, componentDataMap} = data;   
</script>

<!-- <div>
  <h1>{$page} Page for {store} ({language})</h1>
  <a href="/en-sa/">home</a>
  <a href="/en-sa/about">about</a>
</div> -->

{#if slotNameToGroupedUidsArray?.length > 0 && componentDataMap}
    {#each slotNameToGroupedUidsArray as [slotName, componentUids]}
      <LazyComponentLoader {slotName} {componentUids} componentsData={componentUids.map(c => componentDataMap[c])} />
    {/each}
  {/if}