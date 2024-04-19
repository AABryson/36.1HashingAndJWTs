const express = require('express')
const jwt = require("jsonwebtoken");
const router = new express.Router;
const user = require('../models/user');
const { SECRET_KEY } = require('../config')
const expressError = require('./expressError');


/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async function(req, res, next){
    try {
        const {username, password} = req.body;
        let result = await user.authenticate(username, password)
        if(result){
            //##################user class
            let token = jwt.sign({username}, SECRET_KEY)
            user.updateLoginTimestamp(username)
            //##############return token
            return res.json({token})
        } else {
            throw new expressError('username or password not found', 400)
        }
    } catch(err) {
        next(err)
    }
})


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async function(req, res, next){
    const {username, password, first_name, last_name, photo} = req.body
    let result = await user.register(username, password, first_name, last_name, photo);
    let token = jwt.sign(result, SECRET_KEY);
    user.updateLoginTimestamp(username)
    return res.json({token})
}
)