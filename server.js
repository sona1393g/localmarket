/*
 * Simple Login Registration Node.js App
 * This app use Express 3, Mongoose 3, Underscore and MongoDB database
 *
 *
 * Author By Equan Pr.
 * http://www.junwatu.com
 *
 * License :  Whatever you want! :D
 */

 var express = require("express"),
 session = require('express-session'),
 morgan         = require('morgan'),
 bodyParser     = require('body-parser'),
 multer  = require('multer'),
 cloudinary = require('cloudinary');
 methodOverride = require('method-override'),
 engines = require('consolidate'),
 app = express(),
 mongoose = require('mongoose');
 var  MongoStore = require ( 'connect-mongo' ) ( session );

 var config = require('config');
 var dbConfig; 

 var env = process.env.NODE_ENV || 'development';
 if ('development' == env) {
    dbConfig = config.get('App.dbConfig.url');
    app.set('PORT',config.get("App.Port"));
    app.set('IP',"127.0.0.1");


}else{
    dbConfig = "mongodb://"+config.get('App.dbConfig.user')+":"+config.get('App.dbConfig.password')+"@"+process.env.OPENSHIFT_MONGODB_DB_HOST+":"+process.env.OPENSHIFT_MONGODB_DB_PORT+"/localmarket";
    app.set('PORT',process.env.OPENSHIFT_NODEJS_PORT);
    app.set('IP',process.env.OPENSHIFT_NODEJS_IP);
}


/* ==================================
 * MongoDB connection using Mongoose
 */



 mongoose.connect(dbConfig);
 var db = mongoose.connection;
 db.on('connected', function () {
    console.log('Connection success database MongoDB.');
    dbmessage = 'Connection success database MongoDB. database MongoDB.';
});

 db.on('error', function () {
    console.error.bind(console, 'Connection error!');
    dbmessage = 'MongoDB error!';
});

 cloudinary.config(config.get('App.imageStorage'));

 app.use(session(
    {secret:"secret key",resave: true,
    saveUninitialized: true,
    store:new MongoStore({mongooseConnection: db})}));
 app.use(express.static(__dirname + '/public'));
    app.use(morgan('dev'));                     // log every request to the console
    app.use(bodyParser.urlencoded({ extended: false }))    // parse application/x-www-form-urlencoded
    app.use(bodyParser.json())    // parse application/json
    app.use(methodOverride());
   /* app.use(multer({ dest: './public/data/'}));*/
    var multipart = require('connect-multiparty');

    app.use(multipart({
        uploadDir: './public/data/'
    }));
    app.engine('html', engines.underscore);

    /*
     Set views directory. DO NOT set this with the same static directory!.
     */
     app.set('views', __dirname + '/src/views');
     app.set('view engine', 'html');


/*
Routes
*/
app.use('/vendor', require('./src/routes/vendors'));

app.use('/user', require('./src/routes/users'));
app.use('/customer', require('./src/routes/customers'));
app.use('/shop', require('./src/routes/items'));





app.get("/", function (req, res) {
    if (req.session.loggedIn) {
        res.redirect('/home')
    }else{
        res.render('index', {
            title:config.get('App.title'),
            message:'Welcome!!'
        });
    }
});

app.get("/home", function (req, res) {
    if (req.session.loggedIn) {
        res.render('user/home', {
            user:req.session.user,
            title: config.get('App.title')
        });
    } else {
        res.render('index', {
            title:config.get('App.title'),
            message:'Welcome!!'
        });
    }
})



// LOGOUT
app.get('/logout', function (req, res) {
    // clear user session
    req.session.loggedIn = false;
    res.render('index',{
        title:config.get('App.title'),
        message:'Byee!!'});
});


app.listen(app.get('PORT'),app.get('IP'),function(){


    console.log('Node-Express-MongoDB Dumas App');
    console.log('-------------------------------------------');
    console.log("Server Port: " + app.get('PORT'));
    console.log("Server IP: " + app.get('IP'));


});
