const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// User model
const User = require('../models/User');

//Login page
router.get('/login', (req, res) => res.render('login'));

//Register
router.get('/register', (req, res) => res.render('register'));

//Register handle
router.post('/register', (req, res) => {
  const { name, phoneNumber, email, password, password2 } = req.body;
  let errors = [];

  //check required fields
  if (!name || !phoneNumber || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  }

  //check passwords match
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  // Check pass length
  if (password.length < 6) {
    errors.push({ msg: 'Passwords should be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      phoneNumber,
      email,
      password,
      password2
    })
  } else {
    // Validation passed
    User.findOne({ email: email })
      .then(user => {
        if (user) {
          //user exists
          errors.push({ msg: 'Email is already registered' })
          res.render('register', {
            errors,
            name,
            phoneNumber,
            email,
            password,
            password2
          });
        } else {
          const newUser = new User({
            name,
            phoneNumber,
            email,
            password
          });

          //Hash Password
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                .save()
                .then(user => {
                  req.flash(
                    'success_msg',
                    'You are now registered and can log in'
                  );
                  res.redirect('/users/login');
                })
                .catch(err => console.log(err));
            });
          });
        }
      });
  }
});

//login handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

//logout handle
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});



module.exports = router;