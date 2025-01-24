<script lang="ts">
    export let metaData;
    export function onLoad() {}
</script>

<section class="paragraph-component-container">
    {@html metaData?.content}
</section>

<!-- Styles ported from wrapper.less file to adapt for svelte -->
<style lang="scss">
    @import "../../common/styles/colors.new.scss";

    .paragraph-component-container :global {
        .c_ {
            &wrapper {
                padding-left: 16px;
                padding-right: 16px;

                @include desktop-min-width {
                    padding-left: 48px;
                    padding-right: 48px;
                }
            }
        }
    }
</style>
