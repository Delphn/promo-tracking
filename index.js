const so = require('./size-official');

(async () => {

  await so.initialize();

  await so.getProducts();

  debugger;

})()