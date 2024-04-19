const express = require('express')
const router = new express.Router
const User = require('../models/users');
const {ensureLoggedIn, ensureCorrectUser} = require("../middleware/auth");
const { isErrored } = require('supertest/lib/test');

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
//################ensureloggedin
router.get('/', ensureLoggedIn, async function(req, res, next){
    //#############try
    try {
        //#############User class
        let result = await User.all()
        //###################return
        return res.json({users : result})
    } catch (err) {
        return next(err)
    }
})

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
//###############ensureCorrectUser
router.get('/:username', ensureCorrectUser, async function(req, res, next){
    try {
        let result = await User.get(username);
        return res.json({user : result})
    } catch (err) {
        next(err)
    }
})

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/to', ensureCorrectUser, async function(req, res, next){
    try {
        let result = await User.messagesTo(username);
        return res.json({messages : result})
    } catch (err) {
        next(err)
    }
})

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/from', ensureCorrectUswer, async function(){
    let messagesfrom = await User.messagesFrom(username);
    return res.json({ messages : messagesfrom })
})

//##################
module.exports = router