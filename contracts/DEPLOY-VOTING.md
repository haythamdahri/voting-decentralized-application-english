## Usage

After all dependancies are installed, run `Ganache` software.

Run the following commands to open the node console then deploy your contract to the Blockchain

```
HAYTHAM:~/Voting contract deloyment
$ node
> Web3 = require('web3')
> web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
> code = fs.readFileSync('Voting.sol').toString()
> solc = require('solc')
> compiledCode = solc.compile(code)
> abiDefinition = JSON.parse(compiledCode.contracts[':Voting'].interface)
> VotingContract = web3.eth.contract(abiDefinition)
> byteCode = compiledCode.contracts[':Voting'].bytecode
> deployedContract = VotingContract.new(['Rama','Nick','Jose', 'Navin', 'Mike', 'Pamela', 'Thierry', 'Susanne', 'Matilda', 'Angelique', 'Marcelle'], {data: byteCode, from: web3.eth.accounts[0], gas: 4700000})
> deployedContract.address
> contractInstance = VotingContract.at(deployedContract.address)
> contractInstance.voteForCandidate('Rama', {from: web3.eth.accounts[0]})
> contractInstance.getCandidateList.call().toString()
> contractInstance.markVoter('0x180524eD52a43b5d3e1E88dae42d486c122bd3BB', {from: web3.eth.accounts[0]})
> contractInstance.checkVoteStatus.call('0x180524eD52a43b5d3e1E88dae42d486c122bd3BB').toString() // Check if an address was used for vote
> web3.toUtf8(web3.toAscii("0x416e67656c697175650000000000000000000000000000000000000000000000")); // Convert bytes32 to string
> contractInstance.totalVotesFor.call('Rama').toString()
```