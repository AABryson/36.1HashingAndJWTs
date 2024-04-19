const db = require("../db");
const ExpressError = require("../expressError");
//#######################
const bcrypt = require('bcrypt')
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require('../config');


/** User class for message.ly */



/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) { 

      // const { username, password, first_name, last_name, phone } = req.body;
      let hashedPW = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
      //current_timestamp is database function that returns the current date and time at the moment the query is executed

      let result = await db.query(`INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at) VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp) RETURNING (username, password, first_name, last_name, phone)`, [username, hashedPW, first_name, last_name, phone]);
      console.log(result.rows[0])
      return result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    //################I didn't select just the password; but other code I've seen does.  Why? 
    let result = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);
    let user = result.rows[0];
    //###################
    if(await bcrypt.compare(password,  user.password) === true) {
      return true;
    } else {
      return false;
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    //####################SET
    let result = await db.query(`UPDATE users SET last_login_at = current_timestamp WHERE username = $1 RETURNING username`, [username])
    if (result.rows.length === 0){
      throw new ExpressError(`${username} not found`, 404)
    }
    return result.rows[0]
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    let result = await db.query('SELECT username, first_name, last_name, phone FROM users');
    return result.rows
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    //#################why not try/catch
      let result = await db.query(`SELECT username, first_name, last_name, phone, join_at, last_login_at FROM users WHERE username = $1`, [username]);
      if(result.rows.length === 0) {
        throw new ExpressError('There is no such user', 404)};
      return result.rows[0];

  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    //##########################
    let result = await db.query(`SELECT id, to_username, body, sent_at, read_at, username, first_name, last_name, phone FROM messages JOIN users ON messages.to_username = users.username WHERE from_username = $1`, [username]);
    //############
    return result.rows.map(toUser => ({
      id : toUser.id,
        to_user : {username : toUser.username, first_name : toUser.first_name, last_name : toUser.last_name, phone : toUser.phone},
        body : toUser.body,
        sent_at : toUser.sent_at,
        read_at : toUser.read_at
      })
    )
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) { 
    //#######################
    let result = await db.query(`SELECT id, from_username, body, sent_at, read_at, username, first_name, last_name, phone FROM messages JOIN users ON messages.from_username = users.username WHERE to_username = $1`, [username]);
    return result.rows.map(fromUser => ({
      id : fromUser.id,
        from_user : {username : fromUser.username, first_name : fromUser.first_name, last_name : fromUser.last_name, phone : fromUser.phone},
        body : fromUser.body,
        sent_at : fromUser.sent_at,
        read_at : fromUser.read_at
      })
    )
  }
}


module.exports = User;