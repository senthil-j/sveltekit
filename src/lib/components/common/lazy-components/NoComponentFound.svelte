<script lang="ts">
    import { APP_CONSTANTS } from "../../../common/config/app-constants";

    export let metaData: any;
    export function onLoad() {
        console.log("No component:", metaData);
    }

    const filterOutProperties = [
        "uuid",
        "modifiedtime",
        "synchronizationBlocked",
        "container",
    ];
    $: moreInfoPoints = Object.keys(metaData || {})
        .filter((k) => filterOutProperties.indexOf(k) === -1)
        .map((k) => [k, metaData[k]]);
</script>

{#if !APP_CONSTANTS.IS_PRODUCTION}
    <section class="no-component-container px48">
        <h3 style="margin-block:10px">No svelte component found. More Info:</h3>
        <table id="moreInfo">
            {#each moreInfoPoints as moreInfoPoint}
                <tr>
                    <td><strong>{moreInfoPoint[0]}</strong></td>
                    <td>{moreInfoPoint[1]}</td>
                </tr>
            {/each}
        </table>
    </section>
{/if}

<style lang="scss">
    .no-component-container {
        table {
            margin-block: 20px;

            td {
                padding: 10px 5px;
                font-size: 16px;
                border: 4px solid white;
            }

            tr:nth-child(even) {
                background-color: #eee;
            }
            tr:nth-child(odd) {
                background-color: #ddd;
            }
        }
    }
</style>
