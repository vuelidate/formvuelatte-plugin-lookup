import LookupPlugin from '../src/index.js'

const schema = [
  {
    "model": "firstName",
    "type": "FormText",
    "label": "First Name",
    "mappable": true,
    "unique": false
  },
  {
    "label": "Favorite thing about Vue",
    "required": true,
    "model": "favoriteThingAboutVue",
    "type": "FormSelect",
    "mappable": true,
    "unique": false
  },
  {
    "label": "Are you a Vue fan?",
    "model": "isVueFan",
    "type": "FormCheckbox",
    "mappable": true,
    "unique": false
  }
]

const warn = jest.spyOn(console, 'warn').mockImplementation();

describe('Lookup Plugin', () => {
  beforeEach(() => jest.clearAllMocks())
  afterAll(() => warn.mockRestore())

  describe('mapComponents', () => {
    it('maps an key value object of components inside the schema', () => {
      const lookup = LookupPlugin({
        mapComponents: {
          'FormText': 'BaseInput'
        },
        mapProps: {
          type: 'component'
        }
      })
      const { parsedSchema } = lookup({ parsedSchema: schema })

      for (let el of parsedSchema) {
        expect(el.component).not.toEqual('FormText')
      }

      expect(parsedSchema[0].component).toEqual('BaseInput')
    })
  })

  describe('mapProps', () => {
    it('maps props in the schema elements from a key value pair object', () => {
      const lookup = LookupPlugin({
        mapProps: {
          label: 'tag'
        }
      })
      const { parsedSchema } = lookup({ parsedSchema: schema })

      for (let el of parsedSchema) {
        expect('tag' in el).toEqual(true)
        expect('label' in el).toEqual(false)
      }
    })

    it('can receive a function to create the mapping', () => {
      const mapper = jest.fn((el) => {
        if (el.type === 'FormText') {
          return {
            mappable: 'remapped',
            type: 'component'
          }
        }

        return {
          type: 'component'
        }
      })

      const lookup = LookupPlugin({
        mapProps: mapper
      })

      const { parsedSchema } = lookup({ parsedSchema: schema })

      expect('mappable' in parsedSchema[0]).toBe(false)
      expect('remapped' in parsedSchema[0]).toBe(true)
    })

    describe('deleting properties', () => {
      it('can delete a property if its equal to false', () => {
        const lookup = LookupPlugin({
          mapProps: {
            label: false
          }
        })
        const { parsedSchema } = lookup({ parsedSchema: schema })

        for (let el of parsedSchema) {
          expect('label' in el).toEqual(false)
        }
      })

      it('can delete a property through a function', () => {
        const lookup = LookupPlugin({
          mapProps: (el) => {
            return {
              label: false
            }
          }
        })

        const { parsedSchema } = lookup({ parsedSchema: schema })

        for (let el of parsedSchema) {
          expect('label' in el).toEqual(false)
        }
      })
    })
  })
})
