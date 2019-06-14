const express = require('express');
const Cookies = require('cookies');
const sha512 = require('js-sha512');
const User = require('../models/user');
const forEachAsync = require('foreachasync');
const {
  toAscii,
  candidateStatistics,
  checkHeadNode,
  drowWinnerImage
} = require('../utils/functions');
const {
  bankingContractInstance,
  votingContractInstance,
  web3,
  getHeadNode,
  setHeadNode,
  getVotingStatus,
  setVotingStatus
} = require('../services/blockchain');
const router = express.Router();


// Cookies keys
let keys = ['address'];

/*
 *  Handle GET request for => /
 */
router.get('/', (req, res) => {
  // Create a cookies object
  var cookies = new Cookies(req, res, { keys: keys });

  // Retrieve cookies
  let address = cookies.get('address', { signed: true });

  if (address == undefined) {
    res.redirect('/login');
  } else {
    console.log(getVotingStatus());
    // CheckHeadNode
    checkHeadNode(web3).then(() => {
      console.log(`HEAD NODE: ${getHeadNode()}`);

      // Check if voting end
      // Redirect user to the winner page if the vote has been ended
      if (getVotingStatus()) {
        res.redirect('/winner');
        return;
      }

      // Retrieve candidats list from blockchain
      let candidatesNamesHex = votingContractInstance.getCandidateList();

      // Convert candidates hex code to string
      let candidates = new Array();
      let i = 0;

      forEachAsync
        .forEachAsync(candidatesNamesHex, item => {
          candidateStatistics(votingContractInstance, item).then(statistics => {
            candidates.push(statistics);
          });
        })
        .then(() => {
          // Send response to user
          context = { address: address, candidates: candidates };
          let voted = req.query.voted;
          let success = req.query.success;
          context['voted'] =
            voted != undefined ? 'You have already voted!' : undefined;
          context['success'] =
            success != undefined
              ? 'Your vote has been done successflly!'
              : undefined;

          res.render('index', context);
        });
    });
  }
});

/*
 *  Handle POST request for => /
 */
router.post('/', (req, res) => {
  // Create a cookies object
  var cookies = new Cookies(req, res, { keys: keys });

  // Retrieve amount from request body
  let candidate = req.body.candidate;

  // Retrieve cookies
  let address = cookies.get('address', { signed: true });

  // Check if user is authenticated
  if (address == undefined) {
    res.redirect('/login');
  } else {
    checkHeadNode(web3).then(() => {
      // Check if voting end
      // Redirect user to the winner page if the vote has been ended
      if (getVotingStatus()) {
        res.redirect('/winner');
        return;
      }

      // Check if voter has been voted
      let isVoted = votingContractInstance.checkVoteStatus
        .call(address.toString())
        .toString();
      if (JSON.parse(isVoted)) {
        res.redirect('/?voted');
      } else {
        // Add user vote
        // Mark the user
        votingContractInstance.voteForCandidate(
          candidate,
          { from: getHeadNode() },
          () => {
            votingContractInstance.markVoter(
              address.toString(),
              { from: getHeadNode() },
              () => {
                res.redirect('/?success');
              }
            );
          }
        );
      }
    });
  }
});

/*
 *  Handle GET request for => /login
 */

router.get('/login', (req, res) => {
  // Create a cookies object
  var cookies = new Cookies(req, res, { keys: keys });

  // Add error message
  if (req.query.error != undefined) {
    console.log(req.params);
    req.flash('loginError', "Invalid user address, please check your informations!");
  }

  // Retrieve cookies
  let address = cookies.get('address', { signed: true });

  if (address != undefined) {
    res.redirect('/banking');
  } else {
    // Render login html page
    res.render('login', { address: null, message: req.flash('loginError') });
  }
});

/*
 *  Handle POST request for => /login
 */
router.post('/login', (req, res) => {
  // Retrieve request data
  let address = req.body.address.toLowerCase();

  // Create a cookies object
  var cookies = new Cookies(req, res, { keys: keys });

  // Chech if account exists
  let found = false;
  let accounts = web3.eth.accounts;
  console.log('Address: ' + address);
  for (let i = 0; i < accounts.length; i++) {
    console.log(accounts[i]);
    if (accounts[i] == address) {
      // Set cookies + check address on the blockchain
      cookies.set('address', address, { signed: true });
      found = true;
      break;
    }
  }
  if (found) {
    res.redirect('/');
  } else {
    res.redirect('/login?error');
  }
  // });
});

/*
 *  Handle GET request for => /banking
 */
router.get('/banking', (req, res) => {
  // Create a cookies object
  var cookies = new Cookies(req, res, { keys: keys });

  if (req.query.success != undefined) {
    req.flash('successMessage', 'Transaction has been done successflly!');
  }

  // Retrieve cookies
  let address = cookies.get('address', { signed: true });

  if (address == undefined) {
    res.redirect('/login');
  } else {
    bankingContractInstance.getBalance((error, balance) => {
      res.render('banking', {
        address: address,
        balance: balance,
        message: req.flash('successMessage')
      });
    });
  }
});

/*
 *  Handle POST request for => /banking
 */
router.post('/banking', (req, res) => {

  // Create a cookies object
  var cookies = new Cookies(req, res, { keys: keys });

  // Retrieve amount from request body
  let amount = req.body.amount;

  // Retrieve cookies
  let address = cookies.get('address', { signed: true });

  // Check if user is authenticated
  if (address == undefined) {
    res.redirect('/login');
  } else {
    checkHeadNode(web3);
    bankingContractInstance.deposit(
      Number(req.body.amount),
      {
        from: getHeadNode()
      },
      (error, transaction) => {
        res.redirect('/banking?success');
      }
    );
  }
});

/*
 *  Handle GET request for => /logout
 */
router.get('/logout', (req, res) => {
  // Redirect use to home
  res.redirect('/');
});

/*
 *  Handle POST request for => /logout
 */
router.post('/logout', (req, res) => {
  // Create a cookies object
  var cookies = new Cookies(req, res, { keys: keys });

  // Destroy session
  cookies.set('address', { maxAge: Date.now() });

  // redirect user to login page
  res.redirect('/login');
});

/*
 *  Handle GET request for => /winner
 */
router.get('/winner', (req, res) => {
  // Create a cookies object
  var cookies = new Cookies(req, res, { keys: keys });

  // Retrieve cookies
  let address = cookies.get('address', { signed: true });

  // Check if user is authenticated
  if (address == undefined) {
    res.redirect('/login');
  } else {
    if (!getVotingStatus()) {
      res.redirect('/');
      return;
    }

    // Retrieve winner name and number of votes
    let winnerName = toAscii(votingContractInstance.winner.call().toString());
    let votesCount = votingContractInstance.totalVotesFor
      .call(winnerName)
      .toString();

    drowWinnerImage(winnerName).then((winnerFileName) => {
      res.render('winner', {
        address: address,
        winnerName: winnerName,
        votesCount: votesCount,
        winnerFileName: winnerFileName
      });
    });
  }
});

/*
 *  Handle POST request for => /winner
 */
router.post('/winner', (req, res) => {
  // Post request does not have meaning
  res.redirect('/winner');
});

// Export the router
module.exports = router;
