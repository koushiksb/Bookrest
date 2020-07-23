const express = require('express');
const router = express.Router();
const isLoggedIn = require('../utils/isLoggedIn');
const Payment = require('../models/Payment')
const User = require('../models/User');
const Profile = require('../models/Profile')
const dateFormat = require('dateformat');

router.get('', isLoggedIn.isLoggedIn, (req, res) => {
    return res.render('payments', { layout: 'navbar2' });
})

router.get('/history', isLoggedIn.isLoggedIn, async (req, res) => {
    var paid;
    var received;
    var allPayments;
    await Payment.find({ purchaser: req.user._id, status: true }).populate({ path: 'owner', model: 'User', populate: { path: 'profile', model: 'Profile' } }).populate({ path: 'book', model: 'Book' }).then((x) => {
        paid = x;
        console.log('paid', paid);
    });

    await Payment.find({ owner: req.user._id, status: true }).populate({ path: 'purchaser', model: 'User', populate: { path: 'profile', model: 'Profile' } }).populate({ path: 'book', model: 'Book' }).then(async (y) => {
        received = [];
        await y.forEach((item, i) => {
            if (item.book.Author !== 'Wallet') {
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
        }
        else {
            allPayments.walletBalance = 0;
        }
    });

    console.log('all Payments', allPayments);
    allPayments.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    })
    // await Payment.find({ owner: req.user._id }).then((received) => {
    //     p2 = received;
    //     console.log('gotpaid', received);
    // });

    // for (i = 0; i < p1.length; i++) {
    //     await User.findOne({_id:p1[i].owner}).select('profile -_id').populate('profile','fname lname').then((paidto)=> {
    //         console.log('paid to',paidto);
    //         p1[i].profile = paidto;                 
    //     });
    // }

    // for (i = 0; i < p2.length; i++) {
    //     await User.findOne({_id:p1[i].purchaser}).select('profile -_id').populate('profile','fname lname').then((receivedfrom)=> {
    //         console.log('paid to',receivedfrom);
    //         p2[i].profile = receivedfrom;                 
    //     });
    // }

    return res.render('paymentshistory', { paid: paid, layout: 'navbar2', received: received, allPayments: allPayments });
})

router.get('/pending', isLoggedIn.isLoggedIn, async (req, res) => {
    var getPaid;
    var pay;
    var allPayments;
    await Payment.find({ purchaser: req.user._id, status: false }).populate({ path: 'owner', model: 'User', populate: { path: 'profile', model: 'Profile' } }).populate({ path: 'book', model: 'Book' }).then((x) => {
        pay = x;
        // console.log('paid', pay);
    });

    await Payment.find({ owner: req.user._id, status: false }).populate({ path: 'purchaser', model: 'User', populate: { path: 'profile', model: 'Profile' } }).populate({ path: 'book', model: 'Book' }).then((y) => {
        getPaid = y;
        // console.log('received', getPaid);
    });

    allPayments = pay.concat(getPaid);

    await User.findOne({ _id: req.user._id }).then((z) => {
        if (z.walletBalance) {
            allPayments.walletBalance = z.walletBalance;
        }
        else {
            allPayments.walletBalance = 0;
        }
    });

    console.log('all Payments', allPayments);
    allPayments.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    })
    return res.render('pendingpayments', { layout: 'navbar2', allPayments: allPayments });
})

module.exports = router;
