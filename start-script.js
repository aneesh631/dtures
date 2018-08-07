const {mongoose} = require('./server/db/mongoose')
const {User} = require('./server/models/user');
const {Item} = require('./server/models/item');
const config = require('./config');

(async () => {
    //create default admin if not present
    await (async () => {
        let defaultAdmins = config.DEFAULT_ADMINS
        for (admin of defaultAdmins){
            let user = await User.findOne({email: admin.email})
            admin.password =  config.DEFAULT_PASSWORD
            if(!user) await new User(admin).save()
        }
    })();
    // create root node if not present
    await (async () => {
        let root = await Item.findOne({name: 'root'})
        if(!root) await new Item({name: 'root',label: 'root'}).save()
    })();
    process.exit()
})();

// "prestart": "node start-script.js",
