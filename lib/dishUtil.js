const axios = require('axios')
const cheerio = require('cheerio')
const Dish = require('./Dish')

/**
 * Gets the HTML content of the Mensaria Metropol website
 * @returns {Promise}
 */
const getHtml = () => {
  return new Promise((resolve, reject) => {
    axios.get('https://www.stw-ma.de/speiseplan_mensaria_metropol.html').then(data => {
      if (data.status !== 200) {
        reject()
      }

      resolve(data.data)
    }).catch(error => {
      reject(error)
    })
  })
}

const getTypeFromIcon = (icon) => {
  switch (icon) {
    case 'icon-fish':
      return 'Fisch'
    case 'icon-chicken':
      return 'Huhn'
    case 'icon-carrot':
      return 'Vegetarisch'
    case 'icon-pig':
      return 'Schwein'
    case 'icon-cow':
      return 'Rind'
    default:
      return 'Unbekannt'
  }
}

/**
 * Parses the HTML and extracts the dishes from it
 * @param html The HTML string from the Mensaria Metropol website
 * @returns {Array}
 */
const getDishes = html => {
  const $ = cheerio.load(html)
  const rows = $('#mensa_plan > table.t1 > tbody').children('tr')

  const dishes = rows.toArray().map((row) => {
    const icon = $(row).find('.icon').removeClass('icon').attr('class')
    const type = getTypeFromIcon(icon)
    const children = $(row).children('td')
    const title = children.eq(0).find('b').text()

    const content = children.eq(1).find('p').children().toArray().map((val) => {
      const el = $(val)
      el.children().remove('small')
      return el.text()
    }).join(' ').replace(/\s+/g, ' ').replace(/\s,/g, ',')

    const price = children.eq(3).find('i').text()

    return new Dish(title, content, price, type)
  })

  return dishes
}

module.exports = {
  getHtml,
  getDishes
}
