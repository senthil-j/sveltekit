<script>
    import { page } from '$app/stores';
    const { language, store} = $page?.params;
    export let data;
   console.log(data, 'componentDataMapcomponentDataMapcomponentDataMapcomponentDataMap');
</script>

<div>
  <h1>{$page} Page for {store} ({language})</h1>
  <a href="/en-sa/">home</a>
  <a href="/en-sa/about">about</a>
</div>