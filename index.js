require('dotenv').config()
const so = require('./size-official');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

(async () => {

  let i = 1;
  const TEN_MINUTES = 600000;
  const ONE_SECOND = 1000;

  await so.initialize();
  
  // user recursive timeout instead of cron job, this way, it will wait until the code execution is complete before running again.
  // https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Timeouts_and_intervals#recursive_timeouts

  setTimeout(async function run() {
    
    console.log("----------------------------------------------------------------");
    console.log("========= Tral N° ", i);
    console.log("----------------------------------------------------------------");

    try {
      const itemsInCart = await so.checkProducts();
      console.log("\n----------------------------------------------------------------");
      console.log("========= Items in cart: ", itemsInCart);
      console.log("----------------------------------------------------------------");
  
      // if items in cart => alert me
      if (itemsInCart !== "0") {
        const msg = {
          to: 'delphinrukundo@yahoo.fr',
          from: 'fcilecode@gmail.com', 
          subject: 'New items in the cart (Size?)',
          html: `You've got ${itemsInCart}`,
        };
  
        // sending e-mail
        sgMail
          .send(msg)
          .then(() => {
            console.log('\n========= 🎉 Email sent')
          })
          .catch((error) => {
            console.error(error)
          });
      }
    } catch (error) {
      // send e-mail notifying error
      const msg = {
        to: 'delphinrukundo@yahoo.fr',
        from: 'fcilecode@gmail.com', 
        subject: 'An error has occured on Size?',
        html: `Error: ${error}`,
      };

       // sending e-mail
       sgMail
       .send(msg)
       .then(() => {
         console.log('\n========= 🎉 Email sent')
       })
       .catch((error) => {
         console.error(error)
       });
    }


    i++;
    setTimeout(run, TEN_MINUTES);
  }, ONE_SECOND);
})()