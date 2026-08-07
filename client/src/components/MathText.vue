<template>
  <component :is="block ? 'div' : 'span'" v-html="renderedText"></component>
</template>

<script setup>
import { computed } from 'vue'
import katex from 'katex'

const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  block: {
    type: Boolean,
    default: false
  }
})

const renderedText = computed(() => {
  if (!props.text) return ''
  try {
    // Basic parser for inline math \( \) and block math \[ \]
    // Since questionText is passed, we replace LaTeX delimiters with rendered HTML
    let result = props.text
    
    // Replace block math \[ \]
    result = result.replace(/\\\[([\s\S]*?)\\\]/g, (match, math) => {
      return katex.renderToString(math, { displayMode: true, throwOnError: false })
    })
    
    // Replace inline math \( \)
    result = result.replace(/\\\(([\s\S]*?)\\\)/g, (match, math) => {
      return katex.renderToString(math, { displayMode: false, throwOnError: false })
    })
    
    // Highlight words wrapped in single quotes (e.g. 'mollify')
    // Regex ensures we only match words wrapped in single quotes that are separated by spaces/punctuation
    result = result.replace(/(^|\s)'([^']+)'(?=[.,;!?\s]|$)/g, (match, before, word) => {
      return `${before}<u class="font-bold text-primary">${word}</u>`
    })
    
    return result
  } catch (e) {
    console.error('KaTeX error:', e)
    return props.text
  }
})
</script>
