const puppeteer = require('puppeteer');
const BASE_URL = 'https://www.sizeofficial.fr/homme/chaussures/promo/?maxprice-eur=20&minprice-eur=0&sort=price-low-high';

// sofficial for size official
const sofficial = {
  browser: null,
  page: null,

  initialize: async () => {

    sofficial.browser = await puppeteer.launch({
      headless: false
    });

    sofficial.page = await sofficial.browser.newPage();
  },

  getProducts: async () => {
    await sofficial.page.goto(BASE_URL, { waitUntil: 'networkidle2' });

    let products = await sofficial.page.$$('.productListItem ');

    // click on the first product

    await sofficial.page.click('li.productListItem:nth-child(2) .itemQuickView.quickView.btn.btn-default');

    // const [response] = await Promise.all([
    //   page.waitForNavigation(),
    //   sofficial.page.click('.itemQuickView.quickView.btn.btn-default')
    // ]);

    console.log(products[0]);

    debugger;
  }
}

module.exports = sofficial;