<script setup>
import { computed } from 'vue';
import katex from 'katex';

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  block: {
    type: Boolean,
    default: false,
  },
});

const renderedText = computed(() => {
  if (!props.text) return '';
  try {
    let result = props.text;

    // Replace block math \[ \]
    result = result.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
      return katex.renderToString(math, { displayMode: true, throwOnError: false });
    });

    // Replace inline math \( \)
    result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
      return katex.renderToString(math, { displayMode: false, throwOnError: false });
    });

    // Highlight words wrapped in single quotes (e.g. 'mollify')
    result = result.replace(/(^|\s)'([^']+)'(?=[.,;!?\s]|$)/g, (_, before, word) => {
      return `${before}<u class="font-bold text-primary">${word}</u>`;
    });

    return result;
  } catch (e) {
    console.error('KaTeX rendering error:', e);
    return props.text;
  }
});
</script>

<template>
  <component :is="block ? 'div' : 'span'" v-html="renderedText"></component>
</template>
