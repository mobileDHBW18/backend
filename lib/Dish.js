module.exports = class Dish {
  constructor (title, content, price, type) {
    this.title = title
    if (typeof content === 'object') {
      this.contents = content
    } else {
      this.contents = [].concat.apply([], content.split(', ').map(c => c.split(' oder ')))
    }
    this.price = price
    this.type = type
  }

  render () {
    return `*${this.title}* (${this.type}) _(${this.price})_\r\n• ${this.contents.join('\r\n• ')}`
  }

  filteredContents (commonElements) {
    return new Dish(
      this.title,
      this.contents.filter(element => {
        if (commonElements.indexOf(element) === -1) {
          return element
        }
      }),
      this.price,
      this.type
    )
  }
}
