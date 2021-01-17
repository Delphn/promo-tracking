// sizeofficial.fr
// jdsports.fr


const puppeteer = require('puppeteer')
const $ = require('cheerio')
const CronJob = require('cron').CronJob
const nodemailer = require('nodemailer')

puppeteer.launch({headless: true}).then(async browser => {
  let promoUrl = 'https://www.sizeofficial.fr/homme/chaussures/promo/?maxprice-eur=20&minprice-eur=0&sort=price-low-high'

  // let browser = await puppeteer.launch()
  let page = await browser.newPage()

  await page.goto(promoUrl, {waitUntil: 'networkidle2' })

  const productList = await page.evaluate(() => {
    let items = document.querySelector("#productListMain").innerHTML

    return items
  })

  let productsDetails = {
    '0': {},
    '1': {},
    '2': {},
    '3': {},
    '4': {},
    '5': {},
    '6': {},
    '7': {},
    '8': {},
    '9': {},
    '10': {},
    '11': {},
    '12': {},
    '13': {},
    '14': {},
    '15': {},
    '16': {},
    '17': {},
    '18': {},
    '19': {},
  }
  
  const urls = $('a[data-e2e="plp-productList-link"]', productList)
  const pricesWas = $('.was span[data-oi-price]', productList)
  const pricesNow = $('.now span[data-oi-price]', productList)

  // get prices before discount
  pricesWas.each(el => {
    productsDetails[el].pricesWas = pricesWas[el].children[0].data
    // console.log('prices[el].innerHTML: ', pricesWas[el].children[0].data)
  })


  // get prices after discount
  pricesNow.each(el => {
    productsDetails[el].priceNow = pricesNow[el].children[0].data
    // console.log('prices[el].innerHTML: ', prices[el].children[0].data)
  })

  // get urls
  urls.each(el => {
    productsDetails[el].url = urls[el].attribs.href
    // productsDetails.push({
      // url: urls[el].attribs.href
    // })
  })
  

  console.log("productsDetails: ", productsDetails)

  await browser.close()
})