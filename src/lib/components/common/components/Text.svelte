<script>

    export let key = null;
    export let args= [];

    // if no key is available, can pass template directly, like "Hello {0}, {1}"
    export let template = null;

    $: pageLabels = {};
    $: theText = composeTextStringFromArgs(pageLabels, key, args, template);

    /*
        Usage:
        <Text key="shopMoreLabel" args={['value1', 'value2']}
    */
    function composeTextStringFromArgs(labels, key, args, template) {
        if (key && key in labels || template) {
            const t = key && key.length > 0 ? labels[key]['label'] : template;
            return args.reduce((str, val, index) => str.replaceAll(`{${index}}`, val), t);
        }
        return key;
    }
</script>

{@html theText}