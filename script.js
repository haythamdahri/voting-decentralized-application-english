// On deocument load function
$(document).ready(function() {
  // Check cookie if user is connected
  let email = Cookies.get('email');
  let username = Cookies.get('username');
  let password = Cookies.get('password');
  if (email != null && username != null && password != null) {
    window.location.replace('/');
  }
});

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

// Login function
function login(event) {
  event.preventDefault();

  let email = $('#user-email').val();
  let password = $('#user-password').val();
  if (email == '' || password == '') {
    $('#login-error-message').fadeIn(250);
  } else {
    // If user does not exixts in the decentralized data
    // $("#login-error-message").html('<i class="fas fa-exclamation"></i> Email ou mot de passe invalide');
    // $("#login-error-message").fadeIn(250);
    Cookies.set('email', email);
    Cookies.set('password', password);
    Cookies.set('username', 'haytham');
    window.location.replace('/');
  }
}
