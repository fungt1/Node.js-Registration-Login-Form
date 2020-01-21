const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const User = require('../models/User');

//welcome page
router.get('/', (req, res) => res.render('welcome'));

//dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user
  })
);

//get profile
router.get('/edit', ensureAuthenticated, (req, res) =>
  res.render('edit', {
    user: req.user
  })
);
//Update profile
router.post('/edit', ensureAuthenticated, (req, res) => {
  updateRecord(req, res);
  res.redirect('/edit');

});

function updateRecord(req, res) {
  User.findOne({ _id: req.user.id }, (err, doc) => {
    doc.name = req.body.name;
    doc.phoneNumber = req.body.phoneNumber;
    doc.save({ new: true });
  });
}


//delete account
router.post('/delete', ensureAuthenticated, (req, res) => {
  deleteRecord(req, res);
  req.logout();
  return res.redirect("");
});

function deleteRecord(req, res) {
  User.findOneAndDelete({ _id: req.user.id }, (err) => {
    if (err) {
      req.flash("error", err);
      return res.redirect("/dashboard");
    } else {
      req.flash('success_msg', 'Success! Your account has been deleted.');
    }
  });
}

module.exports = router;