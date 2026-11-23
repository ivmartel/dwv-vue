<template>
  <v-card
    title="DICOM Tags"
    class="px-2"
    flat
  >
    <v-container>
      <v-row density="compact">
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
            v-model="sliderIndex"
            step="1"
            :max="sliderMax"
            :min="sliderMin"
            title="Instance number"
            width="90%"
            hide-details
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
import {getDicomTagInfo, getTagFromKey} from 'dwv'

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

// key of the list of item ids in merged meta data
const MERGE_ID_KEY = 'mergeId'

/**
 * Get the item ids of merged meta data, sorted by instance number.
 * Ids are the item instance numbers, with an optional '-<suffix>'
 * (for ex. the frame number).
 *
 * @param {object} tagData The meta data.
 * @returns {string[]} The sorted ids, empty if the data is not merged.
 */
const getItemIds = (tagData) => {
  const ids = tagData[MERGE_ID_KEY]
  if (!Array.isArray(ids)) {
    return []
  }
  return [...ids].sort((a, b) =>
    a.localeCompare(b, undefined, {numeric: true}))
}

/**
 * Get an element value for an item: merged values are objects
 * indexed by item id, other values are arrays (or typed arrays).
 *
 * @param {*} value The element value.
 * @param {string|undefined} itemId The item id.
 * @returns {*} The item value.
 */
const getItemValue = (value, itemId) => {
  if (typeof itemId !== 'undefined' &&
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    !ArrayBuffer.isView(value)) {
    return value[itemId]
  }
  return value
}

const getMetaArray = (tagData, itemId) => {
  let reducer
  if (isDicomMeta(tagData)) {
    reducer = getDicomTagReducer(tagData, itemId, '')
  } else {
    reducer = getTagReducer(tagData)
  }
  const keys = Object.keys(tagData).filter(key => key !== MERGE_ID_KEY)
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

const getDicomTagReducer = (tagData, itemId, prefix) => {
  return (accumulator, currentValue) => {
    const tag = getTagFromKey(currentValue)
    let key = getDicomTagInfo(tag)?.getName()
    if (typeof key === 'undefined') {
      // add 'x' to help sorting
      key = 'x' + tag.getKey()
    }
    const name = (prefix ? prefix + ' ' : '') + key
    const element = tagData[currentValue]
    let value = getItemValue(element.value, itemId)
    if (typeof value === 'undefined') {
      value = []
    }
    // recurse for sequence
    if (element.vr === 'SQ') {
      // sequence tag
      accumulator.push({name, value: ''})
      // sequence value
      for (let i = 0; i < value.length; ++i) {
        const sqItems = value[i]
        const keys = Object.keys(sqItems)
        const res = keys.reduce(
          getDicomTagReducer(
            sqItems, itemId, prefix + '[' + i + ']'), []
        )
        accumulator = accumulator.concat(res)
      }
    } else {
      // shorten long 'o'ther data
      if (element.vr[0] === 'O' && value.length > 10) {
        value = value.slice(0, 10).toString() +
          '... (len:' + value.length + ')'
      }
      accumulator.push({name, value: value.toString()})
    }
    return accumulator
  }
}

export default {
  //name: 'TagsTable',
  props: {
    'tagsData': {
      type: Object,
      required: true
    }
  },
  data: () => ({
    search: '',
    searched: [],
    sliderIndex: 0,
    sliderMin: undefined,
    sliderMax: undefined,
    instanceNumber: undefined,
    itemIds: []
  }),
  watch: {
    // new data loaded while the dialog content is kept mounted
    tagsData() {
      this.initFromTags()
    },
    sliderIndex(index) {
      if (this.itemIds.length !== 0) {
        this.instanceNumber = this.itemIds[index]
      }
      this.searchOnTable()
    }
  },
  created() {
    this.initFromTags()
  },
  methods: {
    initFromTags() {
      // set slider with the merged item ids
      this.itemIds = getItemIds(this.tagsData)
      if (this.itemIds.length !== 0) {
        this.sliderMin = 0
        this.sliderMax = this.itemIds.length - 1
        this.instanceNumber = this.itemIds[0]
      } else {
        this.sliderMin = undefined
        this.sliderMax = undefined
        // single item: display its instance number ('00200013')
        this.instanceNumber = this.tagsData['00200013']?.value?.[0]
      }
      this.sliderIndex = 0
      this.searchOnTable()
    },
    searchOnTable() {
      const itemId = this.itemIds.length !== 0 ? this.instanceNumber : undefined
      const metaArray = getMetaArray(this.tagsData, itemId)
      this.searched = searchAll(metaArray, this.search)
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
