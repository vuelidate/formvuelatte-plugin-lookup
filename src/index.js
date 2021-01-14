import { watchEffect, ref } from 'vue'

/**
 * LookupPlugin
 * @param {Object} configuration
 * @param {Object|Function} configuration.mapComponents - Key value pair of component mapping or a function that returns it
 * @param {Object|Function} configuration.mapProps - Key value pair of prop mapping or a function that returns it
 *
 * @returns {Function}
 */
export default function LookupPlugin ({ mapComponents = {}, mapProps = null }) {
  return function (baseReturns) {
    const { parsedSchema } = baseReturns
    const replacedSchema = ref()

    watchEffect(() => {
      replacedSchema.value = mapProperties(parsedSchema.value, mapProps)
      replacedSchema.value = mapComps(replacedSchema.value, mapComponents)
    })

    return {
      ...baseReturns,
      parsedSchema: replacedSchema
    }
  }
}

/**
 * For a Schema, find the elements in each of the rows and remap the element with the given function
 * @param {Array} schema
 * @param {Function} fn
 *
 * @returns {Array}
 */
export const mapElementsInSchema = (schema, fn) => schema.map(row => row.map(el => fn(el)))

/**
 * Remap components in a schema
 * @param {Array} schema - The schema
 * @param {Object|Function} mapComponents
 *
* @returns {Array}
 */
const mapComps = (schema, mapComponents) => {
  return mapElementsInSchema(schema, el => {
    const newKey = mapComponents[el.component]

    if (!newKey) return { ...el }

    return {
      ...el,
      component: mapComponents[el.component]
    }
  })
}

/**
 * Remap properties in a schema
 * @param {Array} schema - The schema
 * @param {Function|Object} mapProps - A key pair value object or function that returns it
 *
 * @returns {Array}
 */
const mapProperties = (schema, mapProps) => {
  if (!mapProps || !['object', 'function'].includes(typeof mapProps)) return schema

  if (typeof mapProps === 'function') {
    return mapPropertiesWithUserFunction(schema, mapProps)
  }

  let schemaCopy
  for (const prop in mapProps) {
    schemaCopy = mapElementsInSchema(schema, el => {
      return replacePropInElement(el, prop, mapProps[prop])
    })
  }

  return schemaCopy
}

/**
 * Remap properties using a user defined function
 * @param {Array} schema
 * @param {Function} fn
 *
 * @returns {Array} - Parsed schema
 */
const mapPropertiesWithUserFunction = (schema, fn) => {
  const mapPropsForElement = (el, fn) => {
    const map = fn(el)
    for (const prop in map) {
      el = replacePropInElement(
        el, prop, map[prop]
      )
    }

    return el
  }

  return mapElementsInSchema(schema, el => {
    return mapPropsForElement(el, fn)
  })
}

/**
 *
 * @param {Object} el - The element to replace props in
 * @param {String} prop - The prop to replace or fn to pick the prop
 * @param {String|Function|Boolean} replacement - The replacement for the prop, a function that returns it or the boolean "false" to delete it
 *
 * @returns {Object} - The replaced element
 */
const replacePropInElement = (el, prop, replacement) => {
  let propReplacement = replacement
  if (typeof replacement === 'function') {
    // If replacement is a function, call it to get
    // the prop to be replaced. If its falsey, then return
    // the element as is
    propReplacement = replacement(el)

    if (!propReplacement) return el
  }

  if (!(prop in el)) {
    if (process.env && process.env.NODE_ENV !== 'production') {
      console.warn(`LookupPlugin: property "${prop}" not found in`, el)
    }

    // Return the el without replacing
    return el
  }

  const originalValue = el[prop]
  const elementCopy = { ...el }

  delete elementCopy[prop]

  if (propReplacement === false) {
    return elementCopy
  }

  elementCopy[propReplacement] = originalValue

  return elementCopy
}
