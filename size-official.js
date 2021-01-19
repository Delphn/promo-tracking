const puppeteer = require('puppeteer');
// const BASE_URL = 'https://www.sizeofficial.fr/homme/chaussures/promo/?maxprice-eur=20&minprice-eur=0&sort=price-low-high';
const BASE_URL = 'https://www.sizeofficial.fr/promo/';

// sofficial for size official
const sofficial = {
  browser: null,
  page: null,

  initialize: async () => {

    sofficial.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });

    sofficial.page = await sofficial.browser.newPage();
    // await sofficial.page.setViewport({ width: 1366, height: 768});
  },

  checkProducts: async () => {
    await sofficial.page.goto(BASE_URL, { waitUntil: 'networkidle2' });

    let productBtns = await sofficial.page.$$('.productListItem span.itemOverlay');

    for (let i = 0; i < productBtns.length; i++) {
      // click on "ACHAT RAPIDE" button
      // await sofficial.page.click(`li.productListItem:nth-child(${i}) .itemQuickView.quickView.btn.btn-default`);

      let productBtn = productBtns[i];

      productBtn.click();

      // if error message go to the next iteration
      const errorMessage = await sofficial.page.$('#popupMessage');
      if (errorMessage) continue;
      
      // Wait for the dialog to show up
      // await sofficial.page.waitForNavigation({ waitUntil: 'networkidle2' });
      await sofficial.page.waitForTimeout(1000); // wait for 1 second
      await sofficial.page.waitForSelector('.popBox');

      // check if sizes are available
      const sizeBtns = await sofficial.page.$$('button[data-e2e="pdp-productDetails-size"]');
      // console.log('sizeBtns: ', sizeBtns);
      
      // for each size greater than 41 => add to cart
      for (let j = 0; j < sizeBtns.length; j++) {
        sizeBtn = sizeBtns[j];

        const size = await sizeBtn.getProperty('outerText')


        if (Number(size._remoteObject.value) > 41 ) {

          // create a new page
          const newPage = await sofficial.browser.newPage();
          await newPage.goto(BASE_URL, { waitUntil: 'networkidle2' });

          // get the nth product
          const currentProduct = productBtns.length > 1 ? await newPage.$(`.productListItem:nth-child(${i+1}) .itemOverlay`) : await newPage.$('.productListItem .itemOverlay');
          currentProduct.click({delay: 50});
          await newPage.waitForTimeout(1000); // wait for 1 second
          await newPage.waitForSelector('button[data-e2e="pdp-productDetails-size"]');
          
          // get the nth size
          const currentSize = sizeBtns.length > 1 ? await newPage.$(`button[data-e2e="pdp-productDetails-size"]:nth-child(${j+1})`) :  await newPage.$('button[data-e2e="pdp-productDetails-size"]');
          
          // console.log("currentSize: " + currentSize);
          // console.log("sizeBtns.length: " + sizeBtns.length);
          
          
          // click on the button after delay (50 millisecinds betwen mousedown and mouseup)
          await currentSize.click({delay: 50});
          
          // click on "AJOUTER AU PANIER" button after delay
          const addToBasketBtn = await newPage.$('.add-to-basket');
          await addToBasketBtn.click({delay: 50});
          
          
          await newPage.waitForNavigation({ waitUntil: 'networkidle2'});
          await newPage.waitForTimeout(1000); // wait for 1 second

          await newPage.close();

          // await sofficial.page.waitForTimeout(1000); // wait for 1 second

          // close the new page

          // Navigate back
          // await sofficial.page.goto(BASE_URL, { waitUntil: 'networkidle2' });
          // await sofficial.page.goBack({ waitUntil: 'networkidle2' });
          // sizeBtns = await sofficial.page.$$('button[data-e2e="pdp-productDetails-size"]');
        }

      }

      // debugger;

    }

    // if cart.length > 0, notify by email or sms

    // click on the first product
    // console.log("products length: " + products.length)


    // const [response] = await Promise.all([
    //   page.waitForNavigation(),
    //   sofficial.page.click('.itemQuickView.quickView.btn.btn-default')
    // ]);

    // console.log(products[0]);

    // debugger;
  }
}

module.exports = sofficial;