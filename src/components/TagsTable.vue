<template>
  <v-card
    title="DICOM Tags"
    class="px-2"
    flat
  >
    <v-container>
      <v-row no-gutters>
        <v-col>
          <!-- search -->
          <v-text-field
            v-model="search"
            label="Search"
            width="90%"
            clearable
            hide-details
            single-line
          />
        </v-col>
        <v-col>
          <!-- instance slider -->
          <v-slider
            value="0"
            step="1"
            :max="sliderMax"
            :min="sliderMin"
            title="Instance number"
            width="90%"
            hide-details
            @update:model-value="onSliderChange"
          >
            <template #append>
              <div
                class="instancenumber"
                title="Instance number"
              >
                {{ instanceNumber }}
              </div>
            </template>
          </v-slider>
        </v-col>
      </v-row>
    </v-container>
    <!-- tags table -->
    <v-data-table
      :items="searched"
      :search="search"
      disable-pagination
      items-per-page="-1"
      hide-default-footer
    />
  </v-card>
</template>

<script>
import { ref } from 'vue'
import {getTagFromKey} from 'dwv'

const toLower = text => {
  if (text) {
    return text.toString().toLowerCase()
  } else {
    return ''
  }
}

const searchAll = (items, term) => {
  if (term) {
    return items.filter(item => {
      return (
        toLower(item.name).includes(toLower(term)) ||
        toLower(item.value).includes(toLower(term))
      )
    })
  }
  return items
}

const getMetaArray = (tagData, instanceNumber) => {
  let reducer
  if (isDicomMeta(tagData)) {
    reducer = getDicomTagReducer(tagData, instanceNumber, '')
  } else {
    reducer = getTagReducer(tagData)
  }
  const keys = Object.keys(tagData)
  return keys.reduce(reducer, [])
}

const isDicomMeta = (meta) => {
  return typeof meta['00020010'] !== 'undefined'
}

const getTagReducer = (tagData) => {
  return function (accumulator, currentValue) {
    accumulator.push({
      name: currentValue,
      value: tagData[currentValue].value
    })
    return accumulator
  }
}

const getDicomTagReducer = (tagData, instanceNumber, prefix) => {
  return (accumulator, currentValue) => {
    const tag = getTagFromKey(currentValue)
    let key = tag.getNameFromDictionary()
    if (typeof key === 'undefined') {
      // add 'x' to help sorting
      key = 'x' + tag.getKey()
    }
    const name = key
    const element = tagData[currentValue]
    let value = element.value
    // possible 'merged' object
    // (use slice method as test for array and typed array)
    if (typeof value.slice === 'undefined' &&
      typeof value[instanceNumber] !== 'undefined') {
      value = value[instanceNumber]
    }
    // force instance number (otherwise takes value in non indexed array)
    if (name === 'InstanceNumber') {
      value = instanceNumber
    }
    // recurse for sequence
    if (element.vr === 'SQ') {
      // sequence tag
      accumulator.push({
        name: (prefix ? prefix + ' ' : '') + name,
        value: ''
      })
      // sequence value
      for (let i = 0; i < value.length; ++i) {
        const sqItems = value[i]
        const keys = Object.keys(sqItems)
        const res = keys.reduce(
          getDicomTagReducer(
            sqItems, instanceNumber, prefix + '[' + i + ']'), []
        )
        accumulator = accumulator.concat(res)
      }
    } else {
      // shorten long 'o'ther data
      if (element.vr[0] === 'O' && value.length > 10) {
        value = value.slice(0, 10).toString() +
          '... (len:' + value.length + ')'
      }
      accumulator.push({
        name: (prefix ? prefix + ' ' : '') + name,
        value: value.toString()
      })
    }
    return accumulator
  }
}

export default {
  //name: 'TagsTable',
  props: {
    'tagsData': {
      type: Object,
      default(rawProps) {
        return {}
      }
    }
  },
  setup(props) {
    const count = ref(0)
    return { count }
  },
  data: () => ({
    search: '',
    searched: [],
    sliderMin: undefined,
    sliderMax: undefined,
    instanceNumber: 0,
    instanceNumbers: []
  }),
  created() {
    // set slider with instance numbers ('00200013')
    const instanceElement = this.tagsData['00200013']
    if (typeof instanceElement !== 'undefined') {
      let instanceNumberValue = instanceElement.value
      if (typeof instanceNumberValue === 'string') {
        instanceNumberValue = [instanceNumberValue]
      }
      // convert string to numbers
      this.instanceNumbers = instanceNumberValue.map(Number)
      this.instanceNumbers.sort((a, b) => a - b)

      this.sliderMin = 0
      this.sliderMax = this.instanceNumbers.length - 1
      this.instanceNumber = this.instanceNumbers[this.sliderMin]
    }

    const metaArray = getMetaArray(this.tagsData, this.instanceNumber)
    this.searched = metaArray
  },
  methods: {
    searchOnTable() {
      const metaArray = getMetaArray(this.tagsData, this.instanceNumber)
      this.searched = searchAll(metaArray, this.search)
    },
    onSliderChange(event) {
      this.instanceNumber = this.instanceNumbers[event]
      this.searchOnTable()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
input[type=range] {
  margin-left: 20px
}
.instancenumber {
  width: 40px;
}
</style>
