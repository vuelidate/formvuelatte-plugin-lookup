# @formvuelatte/plugin-lookup

Lookup plugin for FormVueLatte

For full documentation check out [FormVueLatte's docs](http://formvuelatte-next.netlify.app/)

## Quick example

```html
<template>
  <div id="app">
    <SchemaFormWithPlugin
      :schema="schema"
      v-model="formData"
    />

    <pre>{{ formData }}</pre>
  </div>
</template>

<script>
import { SchemaFormFactory } from 'formvuelatte'
import LookupPlugin from '@/plugins/LookupPlugin'

import SCHEMA from 'some/schema.json'

const SchemaFormWithPlugin = SchemaFormFactory([
  LookupPlugin({
    mapComponents: {
      string: 'FormText',
      array: 'FormSelect',
      boolean: 'FormCheckbox',
      SchemaForm: 'SchemaFormWithPlugin'
    },
    mapProps: {
      type: 'component',
      info: 'label'
    }
  })
])

export default {
  name: 'App',
  components: {
    SchemaFormWithPlugin
  },
  setup () {
    const formData = ref({})

    return {
      schema: SCHEMA,
      formData
    }
  }
}
</script>
```
