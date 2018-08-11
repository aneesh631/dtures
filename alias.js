const {mongoose} = require('./server/db/mongoose')
const {User} = require('./server/models/user');
const {Item} = require('./server/models/item');
const config = require('./config');

(async () => {
    await (async () => {
        await Item.updateMany({},{$set: {alias: ""}})
    })();
    process.exit()
})();

