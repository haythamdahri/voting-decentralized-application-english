## Usage

After all dependancies are installed, run `Ganache` software.

Run the following commands to open the node console then deploy your contract to the Blockchain

```
HAYTHAM:~/hello_world_simple_storage
$ node
> Web3 = require('web3')
> web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
> code = fs.readFileSync('Storage.sol').toString()
> solc = require('solc')
> compiledCode = solc.compile(code)
> abiDefinition = JSON.parse(compiledCode.contracts[':SimpleStorage'].interface)
> StorageContract = web3.eth.contract(abiDefinition)
> byteCode = compiledCode.contracts[':SimpleStorage'].bytecode
> deployedContract = StorageContract.new({data: byteCode, from: web3.eth.accounts[0], gas: 4700000})
> deployedContract.address
> contractInstance = StorageContract.at(deployedContract.address)
> contractInstance.set(20, {from: web3.eth.accounts[0]})
> contractInstance.get.call().toString()
```