const forEachAsync = require('foreachasync');
let {
  getHeadNode,
  setHeadNode,
  getVotingStatus,
  setVotingStatus,
  MINIMAL_POWER
} = require('../services/blockchain');
const Jimp = require('jimp');

const toAscii = hex => {
  var str = '';
  var i = 0,
    l = hex.length;
  if (hex.substring(0, 2) === '0x') {
    i = 2;
  }
  for (; i < l; i += 2) {
    var code = parseInt(hex.substr(i, 2), 16);
    if (code != 0) {
      str += String.fromCharCode(code);
    }
  }

  return str;
};

const candidateStatistics = async (votingContractInstance, candidate) => {
  // toAscii is personal function into order to retrieve candidate name
  let candidateName = toAscii(candidate);
  let votesCount = await votingContractInstance.totalVotesFor
    .call(candidateName)
    .toString();
  return { candidateName: candidateName, votesCount: votesCount };
};

const checkVotingEnd = accountsDetails => {
  let end = false;
  let accountsCounter = 0;
  accountsDetails.forEach((accountDetails, index) => {
    if (accountDetails.balance < MINIMAL_POWER) {
      accountsCounter += 1;
    }
  });
  if (accountsCounter == accountsDetails.length) {
    setVotingStatus(true);
    return true;
  } else {
    return false;
  }
};

const getAccountFromAddress = (accounts, address) => {
  for (let i = 0; i < accounts.length; i++) {
    if (accounts[i].toString() == address) {
      return accounts[i];
    }
  }
};

const verifyHeadNode = async (web3, accountsDetails) => {
  let headNodeAccount = getAccountFromAddress(web3.eth.accounts, getHeadNode());
  let changed = false;
  let newNode = false;
  await web3.eth.getBalance(headNodeAccount, (error, wei) => {
    if (!error) {
      var balance = web3.fromWei(wei, 'ether').toString();
      if (balance < MINIMAL_POWER) {
        setHeadNode(accountsDetails[0].accountAddress.toString());
      }
    }
  });
};

const checkHeadNode = async web3 => {
  let accountsDetails = new Array();
  let accounts = web3.eth.accounts;
  forEachAsync.forEachAsync(accounts, async (account, index) => {
    await web3.eth.getBalance(account, (error, wei) => {
      if (!error) {
        var balance = web3.fromWei(wei, 'ether').toString();
        accountsDetails.push({
          accountAddress: account,
          balance: balance
        });
        accountsDetails.sort((accountDetails1, accountDetails2) =>
          accountDetails1.balance > accountDetails2.balance ? 1 : -1
        );
        if (index == accounts.length - 1) {
          console.log('Balance HEAD NODE: ' + accountsDetails[0].balance);
          // First account which has more ethers will be as HEAD NODE
          verifyHeadNode(web3, accountsDetails).then(() => {
            // Check voting end if last iteration
            checkVotingEnd(accountsDetails);
          });
        }
      }
    });
  });
};

let drowWinnerImage = async winnerName => {
  let fileName = 'public/images/golden-laurel-wreath.jpg'; //a 1024px x 1024px backgroound image
  let exportedFileName = 'public/images/winner-image.jpg';
  let winnerFileName = '/images/winner-image.jpg';

  await Jimp.read(fileName)
    .then(function(image) {
      loadedImage = image;
      return Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
    })
    .then(function(font) {
      loadedImage.print(font, 267, 275, winnerName).write(exportedFileName);
    })
    .catch(function(err) {
      console.error(err);
    });
  return winnerFileName;
};

module.exports = {
  toAscii: toAscii,
  candidateStatistics: candidateStatistics,
  checkHeadNode: checkHeadNode,
  drowWinnerImage: drowWinnerImage
};
