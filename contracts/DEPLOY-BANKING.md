## Usage

After all dependancies are installed, run `Ganache` software.

Run the following commands to open the node console then deploy your contract to the Blockchain

```
HAYTHAM:~/hello_world_simple_storage
$ node
> Web3 = require('web3')
> web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
> code = fs.readFileSync('Banking.sol').toString()
> solc = require('solc')
> compiledCode = solc.compile(code)
> abiDefinition = JSON.parse(compiledCode.contracts[':Banking'].interface)
> BankingContract = web3.eth.contract(abiDefinition)
> byteCode = compiledCode.contracts[':Banking'].bytecode
> deployedContract = BankingContract.new(85000, {data: byteCode, from: web3.eth.accounts[0], gas: 4700000})
> deployedContract.address
> contractInstance = BankingContract.at(deployedContract.address)
> contractInstance.deposit(78000, {from: web3.eth.accounts[0]})
> contractInstance.getBalance.call().toString()
```