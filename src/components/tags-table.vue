<template>
  <div>
    <md-table
      v-model="searched"
      md-card
      md-fixed-header
    >
      <md-table-toolbar>
        <div class="md-toolbar-section-start">
          <h1 class="md-title">DICOM Tags</h1>
        </div>

        <div class="md-toolbar-section-end">
          <md-field md-clearable>
            <md-input
              placeholder="Search..."
              class="md-caption"
              v-model="search"
              @input="searchOnTable"
            />
          </md-field>
          <input type="range"
            step="1"
            :min="sliderMin"
            :max="sliderMax"
            :value="instanceNumber"
            @input="onSliderChange"
            title="Instance number"/>
          <div class="instancenumber"
            title="Instance number">{{ instanceNumber }}</div>
        </div>

      </md-table-toolbar>

      <md-table-empty-state
        md-label="No tags found"
        :md-description="`No tags found for this '${search}' query.`"
      >
      </md-table-empty-state>

      <md-table-row slot="md-table-row" slot-scope="{ item }">
        <md-table-cell md-label="Name" md-sort-by="name" md-numeric>{{
          item.name
        }}</md-table-cell>
        <md-table-cell md-label="Value" md-sort-by="value">{{
          item.value
        }}</md-table-cell>
      </md-table-row>
    </md-table>
  </div>
</template>

<script>
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
  name: 'TagsTable',
  props: ['tagsData'],
  data: () => ({
    search: null,
    searched: [],
    sliderMin: undefined,
    sliderMax: undefined,
    instanceNumber: undefined
  }),
  methods: {
    searchOnTable() {
      const metaArray = getMetaArray(this.tagsData, this.instanceNumber)
      this.searched = searchAll(metaArray, this.search)
    },
    onSliderChange(event) {
      this.instanceNumber = event.target.value
      this.searchOnTable()
    }
  },
  created() {
    // set slider with instance numbers ('00200013')
    const instanceElement = this.tagsData['00200013']
    if (typeof instanceElement !== 'undefined') {
      let instanceNumbers = instanceElement.value
      if (typeof instanceNumbers === 'string') {
        instanceNumbers = [instanceNumbers]
      }
      // convert string to numbers
      const numbers = instanceNumbers.map(Number)
      numbers.sort((a, b) => a - b)

      this.sliderMin = numbers[0]
      this.sliderMax = numbers[numbers.length - 1]
      this.instanceNumber = numbers[0]
    }

    const metaArray = getMetaArray(this.tagsData, this.instanceNumber)
    this.searched = metaArray
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
