/*
All payment related logic goes here
*/

const Payment = require("../models/Payment");
const User = require("../models/User");
const Profile = require("../models/Profile");
const express = require("express");
const router = express.Router();
const dateFormat = require("dateformat");
const isLoggedIn = require("../utils/isLoggedIn");

router.get("", isLoggedIn.isLoggedIn, (req, res) => {
  return res.render("payments", { layout: "navbar2" });
});
/*Api to view payment history of the user*/
router.get("/history", isLoggedIn.isLoggedIn, async (req, res) => {
  var paid;
  var received;
  var allPayments;
  await Payment.find({ purchaser: req.user._id, status: true })
    .populate({
      path: "owner",
      model: "User",
      populate: { path: "profile", model: "Profile" },
    })
    .populate({ path: "book", model: "Book" })
    .then((x) => {
      paid = x;
      console.log("paid", paid);
    });

  await Payment.find({ owner: req.user._id, status: true })
    .populate({
      path: "purchaser",
      model: "User",
      populate: { path: "profile", model: "Profile" },
    })
    .populate({ path: "book", model: "Book" })
    .then(async (y) => {
      received = [];
      await y.forEach((item, i) => {
        if (item.book.Author !== "Wallet") {
          received.push(item);
        }
      });
      // console.log('received', received);
    });

  allPayments = paid.concat(received);

  await allPayments.forEach((item, i) => {
    item.formatDate = dateFormat(item.date, "dddd, mmmm dS, yyyy, h:MM:ss TT");
  });

  await User.findOne({ _id: req.user._id }).then((z) => {
    if (z.walletBalance) {
      allPayments.walletBalance = z.walletBalance;
    } else {
      allPayments.walletBalance = 0;
    }
  });

  console.log("all Payments", allPayments);
  allPayments.sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });


  return res.render("paymentshistory", {
    paid: paid,
    layout: "navbar2",
    received: received,
    allPayments: allPayments,
  });
});

/*Api to view pending payments of the user*/
router.get("/pending", isLoggedIn.isLoggedIn, async (req, res) => {
  var getPaid;
  var pay;
  var allPayments;
  await Payment.find({ purchaser: req.user._id, status: false })
    .populate({
      path: "owner",
      model: "User",
      populate: { path: "profile", model: "Profile" },
    })
    .populate({ path: "book", model: "Book" })
    .then((x) => {
      pay = x;
      // console.log('paid', pay);
    });

  await Payment.find({ owner: req.user._id, status: false })
    .populate({
      path: "purchaser",
      model: "User",
      populate: { path: "profile", model: "Profile" },
    })
    .populate({ path: "book", model: "Book" })
    .then((y) => {
      getPaid = y;
      // console.log('received', getPaid);
    });

  allPayments = pay.concat(getPaid);

  await User.findOne({ _id: req.user._id }).then((z) => {
    if (z.walletBalance) {
      allPayments.walletBalance = z.walletBalance;
    } else {
      allPayments.walletBalance = 0;
    }
  });

  console.log("all Payments", allPayments);
  allPayments.sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
  return res.render("pendingpayments", {
    layout: "navbar2",
    allPayments: allPayments,
  });
});

module.exports = router;
