// sizeofficial.fr
// jdsports.fr


const puppeteer = require('puppeteer')
const $ = require('cheerio')
const CronJob = require('cron').CronJob
const nodemailer = require('nodemailer')

puppeteer.launch({headless: false}).then(async browser => {
  let promoUrl = 'https://www.sizeofficial.fr/homme/chaussures/promo/?maxprice-eur=20&minprice-eur=0&sort=price-low-high'

  // let browser = await puppeteer.launch()
  let page = await browser.newPage()

  await page.goto(promoUrl, {waitUntil: 'networkidle2' })

  let data = await page.evaluate(() => {
    let items = document.querySelectorAll(".productListItem")

    let productsDetails = []

    items.forEach(item => {
      const url =  $('.itemImage', item.innerHTML)
      productsDetails.push(url)
    })


    return productsDetails
  })

  console.log(data)

  debugger

  await browser.close()
})