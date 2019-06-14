const MINIMAL_POWER = 99.97; // 5 Ethereum
let HEAD_NODE = 0; // Le noeud maitre => 0 pour la prémière fois
let VOTING_END = false;

// Instanciate a new web3 object
web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
abi = JSON.parse(
  '[{"constant":false,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"totalVotesFor","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"validCandidate","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"votesReceived","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"x","type":"bytes32"}],"name":"bytes32ToString","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"candidateList","outputs":[{"name":"","type":"bytes32"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"voteForCandidate","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"contractOwner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"inputs":[{"name":"candidateNames","type":"bytes32[]"}],"payable":false,"type":"constructor"}]'
);
VotingContract = web3.eth.contract(abi);
// In your nodejs console, execute contractInstance.address to get the address at which the contract is deployed and change the line below to use your deployed address
contractInstance = VotingContract.at(
  '0xc3d5fc3af03a134a91c9587a3f662969322e0138'
);
candidates = {
  Rama: 'candidate-1',
  Nick: 'candidate-2',
  Jose: 'candidate-3',
  Navin: 'candidate-4',
  Mike: 'candidate-5',
  Pamela: 'candidate-6',
  Thierry: 'candidate-7',
  Susanne: 'candidate-8',
  Matilda: 'candidate-9',
  Angelique: 'candidate-10',
  Marcelle: 'candidate-11'
};

function voteForCandidate() {
  // Disable voting button
  $('#btn-voter').attr('disabled', 'true');
  candidateName = $('#candidate').val();
  isValid = contractInstance.validCandidate.call(candidateName);
  let oldHeadNode = HEAD_NODE;
  // Set HEAD NODE for every vote
  setHeadNone(() => {
    if (oldHeadNode != HEAD_NODE) {
      console.log('HEAD NODE CHANGED TO ' + HEAD_NODE);
    }
    if (isValid) {
      contractInstance.voteForCandidate(
        candidateName,
        { from: web3.eth.accounts[HEAD_NODE] },
        function() {
          let div_id = candidates[candidateName];
          $('#' + div_id).html(
            contractInstance.totalVotesFor.call(candidateName).toString()
          );
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });

          Toast.fire({
            type: 'success',
            title: `${candidateName} a reçu le vote avec succé`
          });
        }
      );
    } else {
      Swal.fire({
        type: 'error',
        title: 'Erreur...',
        text: `${candidateName} n'est pas un candidat valide!`,
        confirmButtonText: '<i class="far fa-window-close"></i> Fermer'
      });
    }
    // Re-enable voting button
    $('#btn-voter').removeAttr('disabled');
  });
}

// Set Head node dynamically
function setHeadNone(callback) {
  web3.eth.getAccounts((error, accounts) => {
    if (accounts) {
      let maxBalance = 0;
      // Retrieve HEAD NODE balance
      web3.eth.getBalance(web3.eth.accounts[HEAD_NODE], function(error, wei) {
        if (!error) {
          currentBalance = web3.fromWei(wei, 'ether');
          maxBalance = 0;

          // Change HEAD NODE dynamically in case of minimal power
          if (currentBalance < MINIMAL_POWER) {
            // If HEAD_NODE will not be changed, this means that it's the end
            let changed = false;
            for (let i = 1; i < accounts.length; i++) {
              web3.eth.getBalance(web3.eth.accounts[i], function(error, wei) {
                if (!error) {
                  var balance = web3.fromWei(wei, 'ether').toString();
                  if (maxBalance < balance && balance > MINIMAL_POWER) {
                    HEAD_NODE = i;
                    maxBalance = balance;
                    console.log('HEAD_NODE: ' + HEAD_NODE);
                    // When chaning HEAD NODE, it means there is at least one more node which can be a HEAD one
                    changed = true;
                  }
                }
              });
            }
          }
        }
      });
    }
  });
  callback();
}

function fetchCandidatesStatistics() {
  candidateNames = Object.keys(candidates);
  for (var i = 0; i < candidateNames.length; i++) {
    let name = candidateNames[i];
    let val = contractInstance.totalVotesFor.call(name).toString();
    $('#' + candidates[name]).html(val);
  }
  return true;
}

// On deocument load function
$(document).ready(function() {
  // Balance of HEAD_NONE account
  // web3.eth.getBalance(web3.eth.accounts[HEAD_NODE], function(error, wei) {
  //   if (!error) {
  //     var balance = web3.fromWei(wei, 'ether').toString();
  //     if (balance < MINIMAL_POWER) {
  //       let oldHeadNode = HEAD_NODE;
  //       setHeadNone(() => {
  //         if (oldHeadNode != HEAD_NODE) {
  //           console.log('HEAD NODE CHANGED TO ' + HEAD_NODE);
  //         }
  //         fetchCandidatesStatistics();
  //       });
  //     } else {
  //       fetchCandidatesStatistics();
  //     }
  //   }
  // });

  // Check cookie if user is connected
  let email = Cookies.get('email');
  let username = Cookies.get('username');
  let password = Cookies.get('password');
  if (email == null || username == null || password == null) {
    window.location.replace('/login.html');
  } else {
    $("body").show();
  }

  console.log(email);
  console.log(username);
  console.log(password);
});

// On logout event
$('#disconnect-link').on('click', () => {
  // Remove all session cookies
  Cookies.remove('email');
  Cookies.remove('password');
  Cookies.remove('username');
  window.location.replace('/login.html');
});
