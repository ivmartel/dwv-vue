// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = {
  'default e2e tests': browser => {
    browser
      .url(process.env.VUE_DEV_SERVER_URL)
      .waitForElementVisible('#app', 5000)
      .assert.elementPresent('.legend')
      .assert.containsText('.legend', 'Powered by dwv')
      .assert.elementCount('.layerContainer', 1)
      .assert.elementCount('.imageLayer', 1)
      .end()
  }
}
