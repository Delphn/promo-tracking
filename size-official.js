const puppeteer = require('puppeteer');
const BASE_URL = 'https://www.sizeofficial.fr/homme/chaussures/promo/?maxprice-eur=20&minprice-eur=0&sort=price-low-high';
// const BASE_URL = 'https://www.sizeofficial.fr/homme/chaussures/promo/?sort=price-low-high';
// const BASE_URL = 'https://www.sizeofficial.fr/homme/chaussures/promo/?sort=price-high-low';

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

    await sofficial.page.setDefaultNavigationTimeout(0);

    await sofficial.page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  },

  checkProducts: async () => {
    await sofficial.page.reload();

    let productBtns = await sofficial.page.$$('.productListItem span.itemQuickView.quickView.btn.btn-default');

    // wait for chat iFrame and remove it
    await sofficial.page.waitForSelector('#hero-iframe-container');

    await sofficial.page.evaluate(() => {
      const heroiFrame = document.querySelector('#hero-iframe-container');
      heroiFrame.parentNode.removeChild(heroiFrame);
    })

    console.log("\n----------------- Listed Products: " + productBtns.length);

    for (let i = 0; i < productBtns.length; i++) {
      // click on "ACHAT RAPIDE" button
      let productBtn = productBtns[i];

      await productBtn.click({delay: 50});

      // Wait for the dialog to show up
      // await sofficial.page.waitForNavigation({ waitUntil: 'networkidle2' });
      await sofficial.page.waitForTimeout(1000); // wait for 1 second
      await sofficial.page.waitForSelector('.popBox');
      await sofficial.page.waitForSelector('.quickViewContent');

      // if error message go to the next iteration
      const errorMessage = await sofficial.page.$('#popupMessage');
      if (errorMessage) {
        await sofficial.page.waitForTimeout(1000); // wait for 1 second
        // close select size dialog and continue
        await sofficial.closeSelectSizeDialog();
        continue;
      }
      
      // check if sizes are available
      const sizeBtns = await sofficial.page.$$('button[data-e2e="pdp-productDetails-size"]');
      // console.log('sizeBtns: ', sizeBtns);

      console.log("\n----------------- Item n° " + (i+1) +" Available sizes: ", sizeBtns.length);
      
    //  for each available size
      for (let j = 0; j < sizeBtns.length; j++) {
        sizeBtn = sizeBtns[j];
        
        const size = await sizeBtn.getProperty('outerText')
        
        // if size greater than 41 => add to cart
        if (Number(size._remoteObject.value) > 41 ) {
          
          console.log("current size: ", Number(size._remoteObject.value))
          console.log("j+1: ", j+1)
          // create a new page
          const newPage = await sofficial.browser.newPage();
          await sofficial.page.setDefaultNavigationTimeout(0);
          await newPage.goto(BASE_URL, { waitUntil: 'networkidle2' });

          // wait for chat iFrame and remove it
          await newPage.waitForSelector('#hero-iframe-container');

          await newPage.evaluate(() => {
            const heroiFrame = document.querySelector('#hero-iframe-container');
            heroiFrame.parentNode.removeChild(heroiFrame);
          })

          // get the nth product
          await newPage.waitForSelector('.productListItem .itemOverlay');
          const currentProduct = productBtns.length > 1 ? await newPage.$(`.productListItem:nth-child(${i+1}) .itemOverlay`) : await newPage.$('.productListItem .itemOverlay');
          // if currentProduct=null, go to the next iteration (some children are not buttons)
          if(!currentProduct) {
            // sofficial.closeSelectSizeDialog();
            continue;
          }
          await currentProduct.click({delay: 50});
          await newPage.waitForTimeout(1000); // wait for 1 second
          await newPage.waitForSelector('button[data-e2e="pdp-productDetails-size"]');
          
          // get the nth size
          const currentSize = sizeBtns.length > 1 ? await newPage.$(`button[data-e2e="pdp-productDetails-size"]:nth-of-type(${j+1})`) :  await newPage.$('button[data-e2e="pdp-productDetails-size"]');

          const currentSizeInnerText = await currentSize.getProperty('innerText');

          console.log("current currentSizeInnerText: ", currentSizeInnerText);

          // debugger;

          // if currentSize=null, then the size is not available, close the dialog and go to the next iteration
          if(!currentSize || Number(currentSizeInnerText._remoteObject.value) < 42) {
            await sofficial.closeSelectSizeDialog();
            continue;
          }
          
          // click on the button after delay (50 millisecinds betwen mousedown and mouseup)
          await currentSize.click({delay: 50});
          
          await newPage.waitForTimeout(1000); // wait for 1 second
          // click on "AJOUTER AU PANIER" button after delay
          const addToBasketBtn = await newPage.$('button[title="Ajouter au panier"]');
          await addToBasketBtn.click({delay: 50});
          
          
          await newPage.waitForNavigation({ waitUntil: 'networkidle2'});
          await newPage.waitForTimeout(1000); // wait for 1 second

          await newPage.close();
        }
      }
      //  close the select size dialog
       await sofficial.closeSelectSizeDialog();
 
       // debugger;
    }

    // After the big for loop
    console.log("\n----------------- End of Listed Products!")

    const itemsInCart = await sofficial.itemsInCart();

    return itemsInCart
  },

  closeSelectSizeDialog: async () => {
    // await sofficial.page.waitForNavigation();
    await sofficial.page.waitForSelector('.popBox');
    await sofficial.page.waitForSelector('span[title="Fermer"]');
    await sofficial.page.waitForTimeout(1000);
    const closeDialogBtn = await sofficial.page.$('span[title="Fermer"]');
    await closeDialogBtn.click({delay: 50});
    await sofficial.page.waitForTimeout(1000);
  },

  itemsInCart: async () => {
    const cart = await sofficial.page.$('span.basketHasItems');

    if (cart) {
      const cartDescription = await cart.getProperty('outerText');
      return cartDescription._remoteObject.value;
    } else {
      return "0";
    }
  }
}

module.exports = sofficial;