# Decentralized_Application
This is the code for "A Guide to Building Your First Decentralized Application" by Haytham Dahri


## Overview

This application is released for education purposes

## Dependencies

* ethereumjs-testrpc 
* web3@0.20.1
* solc

Install missing dependencies with [npm](https://www.npmjs.com/). 

```
> git clone xxx
> cd Decentralized_Application
> npm install 
```

## Usage

After all dependancies are installed, run the `testrpc` service with:
```
node_modules/ethereumjs-testrpc/build/cli.node.js
```

Run the following commands to open the node console then deploy your contract to the test chain

```
HAYTHAM:~/hello_world_voting$ node
> Web3 = require('web3')
> web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
> code = fs.readFileSync('Voting.sol').toString()
> solc = require('solc')
> compiledCode = solc.compile(code)
> abiDefinition = JSON.parse(compiledCode.contracts[':Voting'].interface)
> VotingContract = web3.eth.contract(abiDefinition)
> byteCode = compiledCode.contracts[':Voting'].bytecode
> deployedContract = VotingContract.new(['Rama','Nick','Jose', 'Navin', 'Mike', 'Pamela', 'Thierry', 'Susanne', 'Matilda', 'Angelique', 'Marcelle'],{data: byteCode, from: web3.eth.accounts[0], gas: 4700000})
> deployedContract.address
> contractInstance = VotingContract.at(deployedContract.address)
> contractInstance.voteForCandidate('Rama', {from: web3.eth.accounts[0]})
> contractInstance.totalVotesFor.call('Rama').toString()
```
