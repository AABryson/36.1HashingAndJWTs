const express = require('express')
const router = new express.Router
//###########################
const Message = require('../models/messages')
const {ensureLoggedIn} = require("../middleware/auth");
const ExpressError = require("../expressError");


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn, async function(req, res, next){
    try {
        //##################??
        let userName = req.user.username;
        //#################Message class
        let getid = await Message.get(req.params.id);
        //################their code
        if (getid.to_user.username !== username && getid.from_user.username !== username) {
            throw new ExpressError("Cannot read this message", 401);
        }
        return res.json({ message: getid})
    } catch(err) {
        next(err)
    }
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureLoggedIn, async function(req, res, next){
    try {
        //##############?
        const {from_username, to_username, body} = req.body;
        let result = await Message.create({from_username, to_username, body});
        return res.json({message : result})
    } catch(err) {
        next(err)
    }
    
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/read', ensureLoggedIn, async function(req, res, next){
    try {
        //#################their code
        let username = req.user.username;
        let msg = await Message.get(req.params.id);

        if (msg.to_user.username !== username) {
            throw new ExpressError("Cannot set this message to read", 401);
    }
        let result = await Message.markRead(req.params.id);
        return res.json({message : result})


    } catch (err) {
        return next(err);
    }
})

module.exports = router;