pragma solidity ^0.4.25;
// We have to specify what version of compiler this code will compile with

contract Voting {
  /* mapping field below is equivalent to an associative array or hash.
  The key of the mapping is candidate name stored as type bytes32 and value is
  an unsigned integer to store the vote count
  */
  
  
  mapping (bytes32 => uint8) votesReceived;
  
  /* Solidity doesn't let you pass in an array of strings in the constructor (yet).
  We will use an array of bytes32 instead to store the list of candidates
  */
  
  bytes32[] candidateList;
  bytes32[] votersList;
  
  /* This is the constructor which will be called once when you
  deploy the contract to the blockchain. When we deploy the contract,
  we will pass an array of candidates who will be contesting in the election
  */
  constructor(bytes32[] candidateNames) public {
    candidateList = candidateNames;
  }

  // Retrieve candidates list
  function getCandidateList() view public returns (bytes32[]) {
    return candidateList;
  } 

  // This function returns the total votes a candidate has received so far
  function totalVotesFor(bytes32 candidate) view public returns (uint8) {
    if (validCandidate(candidate) == false) revert();
    return votesReceived[candidate];
  }

  // This function returns name of the winner
  function winner() view public returns (bytes32) {
    bytes32 winnerName = candidateList[0]; // Temprory, first candidate as winner
    uint8 winnerVotes = votesReceived[winnerName];
    
    for (uint i = 1; i < candidateList.length; i++) {
      bytes32 candidateName = candidateList[i];
      uint8 receivedVotes = votesReceived[candidateName];
      if( receivedVotes > winnerVotes ) {
        winnerVotes = receivedVotes;
        winnerName = candidateName;
      }
    }
    return winnerName;
  }

  // This function increments the vote count for the specified candidate. This
  // is equivalent to casting a vote
  function voteForCandidate(bytes32 candidate) public {
    if (validCandidate(candidate) == false) revert();
    votesReceived[candidate] += 1;
  }

  // Mark voter that he had already voted
  function markVoter(bytes32 voterAddress) public {
   for(uint i = 0; i < votersList.length; i++) {
      if (votersList[i] == voterAddress) {
        revert();
      }
    }
    votersList.push(voterAddress);
  }

  // Check if user has been voted (returns true if already voted on a candidate)
  function checkVoteStatus(bytes32 voterAddress) view public returns (bool) {
    for(uint i = 0; i < votersList.length; i++) {
      if (votersList[i] == voterAddress) {
        return true;
      }
    }
    return false;
  }

  function validCandidate(bytes32 candidate) view public returns (bool) {
    for(uint i = 0; i < candidateList.length; i++) {
      if (candidateList[i] == candidate) {
        return true;
      }
    }
    return false;
  }

  
}
