// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = {
  'default e2e tests': function (browser) {
    browser
    .url('http://localhost:8080/main.html')
      .waitForElementVisible('.ultron-workspace', 5000)
      .assert.elementPresent('.navbar-brand')
      .assert.containsText('.project-name', '奥创')
      .end()
  }
}
