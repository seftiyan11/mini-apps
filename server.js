require('dotenv').config()

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')

// Google Auth
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = '29895534022-49o0uv13q18vup9mfhicqr4j8649l1us.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID);

const PORT = 7000;

// Middleware

app.set('view engine', 'ejs');
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));


app.get('/', (req, res)=>{
    res.render('index');
})

app.post('/index', (req, res)=>{
    let token = req.body.token;

    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
      }
      verify()
      .then(()=>{
          res.cookie('session-token', token);
          res.send('success')
      })
      .catch(console.error);

})

app.get('/profile', checkAuthenticated, (req, res)=>{
    let user = req.user;
    res.render('profile', {user});
})

app.get('/protectedRoute', checkAuthenticated, (req,res)=>{
    res.send('This route is protected')
})

app.get('/logout', (req, res)=>{
    res.clearCookie('session-token');
    res.redirect('/')
})

app.get('/pages', (req, res)=>{
    res.render('pages');
})


// for google login authentication (function)

function checkAuthenticated(req, res, next){

    let token = req.cookies['session-token'];

    let user = {};
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = ticket.getPayload();
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
      }
      verify()
      .then(()=>{
          req.user = user;
          next();
      })
      .catch(err=>{
          res.redirect('/index')
      })

}

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
})