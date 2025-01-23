<script>
    import "../app.css";
    import Footer from "../lib/components/footer/footer.svelte";
    import Header from "../lib/components/header/header.svelte";
</script>
  
<div>
    <Header />
        <slot />
    <Footer />
</div>