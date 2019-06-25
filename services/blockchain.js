const Web3 = require('web3');
const fs = require('fs');
const solc = require('solc');
const MINIMAL_POWER = 99; // Minimal balance must be at least 5(99.95 for test) Ethers
let VOTING_END = false; // If all accounts have ehers less than MINIMAL_POWER, so that we end the voting
let HEAD_NODE = '';

// Initialize web3
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

// ------------------------- Banking contract -------------------------
const bankingCode = fs.readFileSync('contracts/Banking.sol').toString();
const bankingCompiledCode = solc.compile(bankingCode);
const bankingByteCode = {
  linkReferences: {},
  object:
    '608060405234801561001057600080fd5b5060405160208061018483398101806040528101908080519060200190929190505050806000819055505061013a8061004a6000396000f300608060405260043610610057576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806312065fe01461005c5780635f1cb5e714610087578063f04991f0146100b4575b600080fd5b34801561006857600080fd5b506100716100e1565b6040518082815260200191505060405180910390f35b34801561009357600080fd5b506100b2600480360381019080803590602001909291905050506100ea565b005b3480156100c057600080fd5b506100df600480360381019080803590602001909291905050506100fc565b005b60008054905090565b80600080828254039250508190555050565b806000808282540192505081905550505600a165627a7a723058208dfa89baf837c5180196de5ceeeab425f36bc217104205efc19de7b12ed286b90029',
  opcodes:
    'PUSH1 0x80 PUSH1 0x40 MSTORE CALLVALUE DUP1 ISZERO PUSH2 0x10 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0x40 MLOAD PUSH1 0x20 DUP1 PUSH2 0x184 DUP4 CODECOPY DUP2 ADD DUP1 PUSH1 0x40 MSTORE DUP2 ADD SWAP1 DUP1 DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP DUP1 PUSH1 0x0 DUP2 SWAP1 SSTORE POP POP PUSH2 0x13A DUP1 PUSH2 0x4A PUSH1 0x0 CODECOPY PUSH1 0x0 RETURN STOP PUSH1 0x80 PUSH1 0x40 MSTORE PUSH1 0x4 CALLDATASIZE LT PUSH2 0x57 JUMPI PUSH1 0x0 CALLDATALOAD PUSH29 0x100000000000000000000000000000000000000000000000000000000 SWAP1 DIV PUSH4 0xFFFFFFFF AND DUP1 PUSH4 0x12065FE0 EQ PUSH2 0x5C JUMPI DUP1 PUSH4 0x5F1CB5E7 EQ PUSH2 0x87 JUMPI DUP1 PUSH4 0xF04991F0 EQ PUSH2 0xB4 JUMPI JUMPDEST PUSH1 0x0 DUP1 REVERT JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0x68 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x71 PUSH2 0xE1 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0x93 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0xB2 PUSH1 0x4 DUP1 CALLDATASIZE SUB DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0xEA JUMP JUMPDEST STOP JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0xC0 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0xDF PUSH1 0x4 DUP1 CALLDATASIZE SUB DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0xFC JUMP JUMPDEST STOP JUMPDEST PUSH1 0x0 DUP1 SLOAD SWAP1 POP SWAP1 JUMP JUMPDEST DUP1 PUSH1 0x0 DUP1 DUP3 DUP3 SLOAD SUB SWAP3 POP POP DUP2 SWAP1 SSTORE POP POP JUMP JUMPDEST DUP1 PUSH1 0x0 DUP1 DUP3 DUP3 SLOAD ADD SWAP3 POP POP DUP2 SWAP1 SSTORE POP POP JUMP STOP LOG1 PUSH6 0x627A7A723058 KECCAK256 DUP14 STATICCALL DUP10 0xba 0xf8 CALLDATACOPY 0xc5 XOR ADD SWAP7 0xde 0x5c 0xee 0xea 0xb4 0x25 RETURN PUSH12 0xC217104205EFC19DE7B12ED2 DUP7 0xb9 STOP 0x29 ',
  sourceMap:
    '26:361:0:-;;;71:64;8:9:-1;5:2;;;30:1;27;20:12;5:2;71:64:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;122:6;112:7;:16;;;;71:64;26:361;;;;;;'
};
const bankingAbiDefinition = [
  {
    constant: true,
    inputs: [],
    name: 'getBalance',
    outputs: [
      {
        name: '',
        type: 'int256'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: 'amount',
        type: 'int256'
      }
    ],
    name: 'withdrawal',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: 'amount',
        type: 'int256'
      }
    ],
    name: 'deposit',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        name: 'amount',
        type: 'int256'
      }
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'constructor'
  }
];

/*
 * Retrieve contract from its address
 */
let bankingContract = web3.eth.contract(bankingAbiDefinition);
// The contract address must be changed for each deployment
bankingContractInstance = bankingContract.at(
  '0xb000fdc4ad001516a7f7b637834fae0782160a22'
);

// ------------------------- Voting contract -------------------------
const votingCode = fs.readFileSync('contracts/Banking.sol').toString();
const votingCompiledCode = solc.compile(votingCode);
const votingByteCode = {
  linkReferences: {},
  object:
    '6080604052600060035534801561001557600080fd5b5060405161068e38038061068e83398101806040528101908080518201929190505050806001908051906020019061004e929190610055565b50506100cd565b828054828255906000526020600020908101928215610097579160200282015b82811115610096578251829060001916905591602001919060010190610075565b5b5090506100a491906100a8565b5090565b6100ca91905b808211156100c65760008160009055506001016100ae565b5090565b90565b6105b2806100dc6000396000f300608060405260043610610083576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680632f265cf714610088578063392e6678146100d3578063597492981461011c578063cc9ab2671461014d578063dfbf53ae1461017e578063f46559fa146101b1578063fdbc4006146101fa575b600080fd5b34801561009457600080fd5b506100b76004803603810190808035600019169060200190929190505050610266565b604051808260ff1660ff16815260200191505060405180910390f35b3480156100df57600080fd5b5061010260048036038101908080356000191690602001909291905050506102b0565b604051808215151515815260200191505060405180910390f35b34801561012857600080fd5b5061014b600480360381019080803560001916906020019092919050505061030f565b005b34801561015957600080fd5b5061017c6004803603810190808035600019169060200190929190505050610393565b005b34801561018a57600080fd5b506101936103f6565b60405180826000191660001916815260200191505060405180910390f35b3480156101bd57600080fd5b506101e060048036038101908080356000191690602001909291905050506104cb565b604051808215151515815260200191505060405180910390f35b34801561020657600080fd5b5061020f61052a565b6040518080602001828103825283818151815260200191508051906020019060200280838360005b83811015610252578082015181840152602081019050610237565b505050509050019250505060405180910390f35b6000801515610274836102b0565b1515141561028157600080fd5b600080836000191660001916815260200190815260200160002060009054906101000a900460ff169050919050565b600080600090505b6001805490508110156103045782600019166001828154811015156102d957fe5b90600052602060002001546000191614156102f75760019150610309565b80806001019150506102b8565b600091505b50919050565b60008090505b60028054905081101561035d57816000191660028281548110151561033657fe5b906000526020600020015460001916141561035057600080fd5b8080600101915050610315565b60028290806001815401808255809150509060018203906000526020600020016000909192909190915090600019169055505050565b600015156103a0826102b0565b151514156103ad57600080fd5b6001600080836000191660001916815260200190815260200160002060008282829054906101000a900460ff160192506101000a81548160ff021916908360ff16021790555050565b6000806000806000806001600081548110151561040f57fe5b90600052602060002001549450600080866000191660001916815260200190815260200160002060009054906101000a900460ff169350600192505b6001805490508310156104c05760018381548110151561046757fe5b90600052602060002001549150600080836000191660001916815260200190815260200160002060009054906101000a900460ff1690508360ff168160ff1611156104b3578093508194505b828060010193505061044b565b849550505050505090565b600080600090505b60028054905081101561051f5782600019166002828154811015156104f457fe5b90600052602060002001546000191614156105125760019150610524565b80806001019150506104d3565b600091505b50919050565b6060600180548060200260200160405190810160405280929190818152602001828054801561057c57602002820191906000526020600020905b81546000191681526020019060010190808311610564575b50505050509050905600a165627a7a723058201be0a4fff5eea801b038ae581db1144681d84e6a6c0839504d9c0252b40a12580029',
  opcodes:
    'PUSH1 0x80 PUSH1 0x40 MSTORE PUSH1 0x0 PUSH1 0x3 SSTORE CALLVALUE DUP1 ISZERO PUSH2 0x15 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0x40 MLOAD PUSH2 0x68E CODESIZE SUB DUP1 PUSH2 0x68E DUP4 CODECOPY DUP2 ADD DUP1 PUSH1 0x40 MSTORE DUP2 ADD SWAP1 DUP1 DUP1 MLOAD DUP3 ADD SWAP3 SWAP2 SWAP1 POP POP POP DUP1 PUSH1 0x1 SWAP1 DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 PUSH2 0x4E SWAP3 SWAP2 SWAP1 PUSH2 0x55 JUMP JUMPDEST POP POP PUSH2 0xCD JUMP JUMPDEST DUP3 DUP1 SLOAD DUP3 DUP3 SSTORE SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 DUP2 ADD SWAP3 DUP3 ISZERO PUSH2 0x97 JUMPI SWAP2 PUSH1 0x20 MUL DUP3 ADD JUMPDEST DUP3 DUP2 GT ISZERO PUSH2 0x96 JUMPI DUP3 MLOAD DUP3 SWAP1 PUSH1 0x0 NOT AND SWAP1 SSTORE SWAP2 PUSH1 0x20 ADD SWAP2 SWAP1 PUSH1 0x1 ADD SWAP1 PUSH2 0x75 JUMP JUMPDEST JUMPDEST POP SWAP1 POP PUSH2 0xA4 SWAP2 SWAP1 PUSH2 0xA8 JUMP JUMPDEST POP SWAP1 JUMP JUMPDEST PUSH2 0xCA SWAP2 SWAP1 JUMPDEST DUP1 DUP3 GT ISZERO PUSH2 0xC6 JUMPI PUSH1 0x0 DUP2 PUSH1 0x0 SWAP1 SSTORE POP PUSH1 0x1 ADD PUSH2 0xAE JUMP JUMPDEST POP SWAP1 JUMP JUMPDEST SWAP1 JUMP JUMPDEST PUSH2 0x5B2 DUP1 PUSH2 0xDC PUSH1 0x0 CODECOPY PUSH1 0x0 RETURN STOP PUSH1 0x80 PUSH1 0x40 MSTORE PUSH1 0x4 CALLDATASIZE LT PUSH2 0x83 JUMPI PUSH1 0x0 CALLDATALOAD PUSH29 0x100000000000000000000000000000000000000000000000000000000 SWAP1 DIV PUSH4 0xFFFFFFFF AND DUP1 PUSH4 0x2F265CF7 EQ PUSH2 0x88 JUMPI DUP1 PUSH4 0x392E6678 EQ PUSH2 0xD3 JUMPI DUP1 PUSH4 0x59749298 EQ PUSH2 0x11C JUMPI DUP1 PUSH4 0xCC9AB267 EQ PUSH2 0x14D JUMPI DUP1 PUSH4 0xDFBF53AE EQ PUSH2 0x17E JUMPI DUP1 PUSH4 0xF46559FA EQ PUSH2 0x1B1 JUMPI DUP1 PUSH4 0xFDBC4006 EQ PUSH2 0x1FA JUMPI JUMPDEST PUSH1 0x0 DUP1 REVERT JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0x94 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0xB7 PUSH1 0x4 DUP1 CALLDATASIZE SUB DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH1 0x0 NOT AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0x266 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 PUSH1 0xFF AND PUSH1 0xFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0xDF JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x102 PUSH1 0x4 DUP1 CALLDATASIZE SUB DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH1 0x0 NOT AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0x2B0 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 ISZERO ISZERO ISZERO ISZERO DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0x128 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x14B PUSH1 0x4 DUP1 CALLDATASIZE SUB DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH1 0x0 NOT AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0x30F JUMP JUMPDEST STOP JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0x159 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x17C PUSH1 0x4 DUP1 CALLDATASIZE SUB DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH1 0x0 NOT AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0x393 JUMP JUMPDEST STOP JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0x18A JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x193 PUSH2 0x3F6 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 PUSH1 0x0 NOT AND PUSH1 0x0 NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0x1BD JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x1E0 PUSH1 0x4 DUP1 CALLDATASIZE SUB DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH1 0x0 NOT AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0x4CB JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 ISZERO ISZERO ISZERO ISZERO DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0x206 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x20F PUSH2 0x52A JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE DUP4 DUP2 DUP2 MLOAD DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 PUSH1 0x20 MUL DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH2 0x252 JUMPI DUP1 DUP3 ADD MLOAD DUP2 DUP5 ADD MSTORE PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH2 0x237 JUMP JUMPDEST POP POP POP POP SWAP1 POP ADD SWAP3 POP POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH1 0x0 DUP1 ISZERO ISZERO PUSH2 0x274 DUP4 PUSH2 0x2B0 JUMP JUMPDEST ISZERO ISZERO EQ ISZERO PUSH2 0x281 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST PUSH1 0x0 DUP1 DUP4 PUSH1 0x0 NOT AND PUSH1 0x0 NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH1 0x0 SWAP1 SLOAD SWAP1 PUSH2 0x100 EXP SWAP1 DIV PUSH1 0xFF AND SWAP1 POP SWAP2 SWAP1 POP JUMP JUMPDEST PUSH1 0x0 DUP1 PUSH1 0x0 SWAP1 POP JUMPDEST PUSH1 0x1 DUP1 SLOAD SWAP1 POP DUP2 LT ISZERO PUSH2 0x304 JUMPI DUP3 PUSH1 0x0 NOT AND PUSH1 0x1 DUP3 DUP2 SLOAD DUP2 LT ISZERO ISZERO PUSH2 0x2D9 JUMPI INVALID JUMPDEST SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 ADD SLOAD PUSH1 0x0 NOT AND EQ ISZERO PUSH2 0x2F7 JUMPI PUSH1 0x1 SWAP2 POP PUSH2 0x309 JUMP JUMPDEST DUP1 DUP1 PUSH1 0x1 ADD SWAP2 POP POP PUSH2 0x2B8 JUMP JUMPDEST PUSH1 0x0 SWAP2 POP JUMPDEST POP SWAP2 SWAP1 POP JUMP JUMPDEST PUSH1 0x0 DUP1 SWAP1 POP JUMPDEST PUSH1 0x2 DUP1 SLOAD SWAP1 POP DUP2 LT ISZERO PUSH2 0x35D JUMPI DUP2 PUSH1 0x0 NOT AND PUSH1 0x2 DUP3 DUP2 SLOAD DUP2 LT ISZERO ISZERO PUSH2 0x336 JUMPI INVALID JUMPDEST SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 ADD SLOAD PUSH1 0x0 NOT AND EQ ISZERO PUSH2 0x350 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST DUP1 DUP1 PUSH1 0x1 ADD SWAP2 POP POP PUSH2 0x315 JUMP JUMPDEST PUSH1 0x2 DUP3 SWAP1 DUP1 PUSH1 0x1 DUP2 SLOAD ADD DUP1 DUP3 SSTORE DUP1 SWAP2 POP POP SWAP1 PUSH1 0x1 DUP3 SUB SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 ADD PUSH1 0x0 SWAP1 SWAP2 SWAP3 SWAP1 SWAP2 SWAP1 SWAP2 POP SWAP1 PUSH1 0x0 NOT AND SWAP1 SSTORE POP POP POP JUMP JUMPDEST PUSH1 0x0 ISZERO ISZERO PUSH2 0x3A0 DUP3 PUSH2 0x2B0 JUMP JUMPDEST ISZERO ISZERO EQ ISZERO PUSH2 0x3AD JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST PUSH1 0x1 PUSH1 0x0 DUP1 DUP4 PUSH1 0x0 NOT AND PUSH1 0x0 NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH1 0x0 DUP3 DUP3 DUP3 SWAP1 SLOAD SWAP1 PUSH2 0x100 EXP SWAP1 DIV PUSH1 0xFF AND ADD SWAP3 POP PUSH2 0x100 EXP DUP2 SLOAD DUP2 PUSH1 0xFF MUL NOT AND SWAP1 DUP4 PUSH1 0xFF AND MUL OR SWAP1 SSTORE POP POP JUMP JUMPDEST PUSH1 0x0 DUP1 PUSH1 0x0 DUP1 PUSH1 0x0 DUP1 PUSH1 0x1 PUSH1 0x0 DUP2 SLOAD DUP2 LT ISZERO ISZERO PUSH2 0x40F JUMPI INVALID JUMPDEST SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 ADD SLOAD SWAP5 POP PUSH1 0x0 DUP1 DUP7 PUSH1 0x0 NOT AND PUSH1 0x0 NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH1 0x0 SWAP1 SLOAD SWAP1 PUSH2 0x100 EXP SWAP1 DIV PUSH1 0xFF AND SWAP4 POP PUSH1 0x1 SWAP3 POP JUMPDEST PUSH1 0x1 DUP1 SLOAD SWAP1 POP DUP4 LT ISZERO PUSH2 0x4C0 JUMPI PUSH1 0x1 DUP4 DUP2 SLOAD DUP2 LT ISZERO ISZERO PUSH2 0x467 JUMPI INVALID JUMPDEST SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 ADD SLOAD SWAP2 POP PUSH1 0x0 DUP1 DUP4 PUSH1 0x0 NOT AND PUSH1 0x0 NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH1 0x0 SWAP1 SLOAD SWAP1 PUSH2 0x100 EXP SWAP1 DIV PUSH1 0xFF AND SWAP1 POP DUP4 PUSH1 0xFF AND DUP2 PUSH1 0xFF AND GT ISZERO PUSH2 0x4B3 JUMPI DUP1 SWAP4 POP DUP2 SWAP5 POP JUMPDEST DUP3 DUP1 PUSH1 0x1 ADD SWAP4 POP POP PUSH2 0x44B JUMP JUMPDEST DUP5 SWAP6 POP POP POP POP POP POP SWAP1 JUMP JUMPDEST PUSH1 0x0 DUP1 PUSH1 0x0 SWAP1 POP JUMPDEST PUSH1 0x2 DUP1 SLOAD SWAP1 POP DUP2 LT ISZERO PUSH2 0x51F JUMPI DUP3 PUSH1 0x0 NOT AND PUSH1 0x2 DUP3 DUP2 SLOAD DUP2 LT ISZERO ISZERO PUSH2 0x4F4 JUMPI INVALID JUMPDEST SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 ADD SLOAD PUSH1 0x0 NOT AND EQ ISZERO PUSH2 0x512 JUMPI PUSH1 0x1 SWAP2 POP PUSH2 0x524 JUMP JUMPDEST DUP1 DUP1 PUSH1 0x1 ADD SWAP2 POP POP PUSH2 0x4D3 JUMP JUMPDEST PUSH1 0x0 SWAP2 POP JUMPDEST POP SWAP2 SWAP1 POP JUMP JUMPDEST PUSH1 0x60 PUSH1 0x1 DUP1 SLOAD DUP1 PUSH1 0x20 MUL PUSH1 0x20 ADD PUSH1 0x40 MLOAD SWAP1 DUP2 ADD PUSH1 0x40 MSTORE DUP1 SWAP3 SWAP2 SWAP1 DUP2 DUP2 MSTORE PUSH1 0x20 ADD DUP3 DUP1 SLOAD DUP1 ISZERO PUSH2 0x57C JUMPI PUSH1 0x20 MUL DUP3 ADD SWAP2 SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 JUMPDEST DUP2 SLOAD PUSH1 0x0 NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 PUSH1 0x1 ADD SWAP1 DUP1 DUP4 GT PUSH2 0x564 JUMPI JUMPDEST POP POP POP POP POP SWAP1 POP SWAP1 JUMP STOP LOG1 PUSH6 0x627A7A723058 KECCAK256 SHL 0xe0 LOG4 SELFDESTRUCT 0xf5 0xee 0xa8 ADD 0xb0 CODESIZE 0xae PC SAR 0xb1 EQ 0x46 DUP2 0xd8 0x4e PUSH11 0x6C0839504D9C0252B40A12 PC STOP 0x29 ',
  sourceMap:
    '101:2873:0:-;;;672:1;651:22;;896:86;8:9:-1;5:2;;;30:1;27;20:12;5:2;896:86:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;963:14;947:13;:30;;;;;;;;;;;;:::i;:::-;;896:86;101:2873;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;'
};
const votingAbiDefinition = [
  {
    constant: true,
    inputs: [
      {
        name: 'candidate',
        type: 'bytes32'
      }
    ],
    name: 'totalVotesFor',
    outputs: [
      {
        name: '',
        type: 'uint8'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      {
        name: 'candidate',
        type: 'bytes32'
      }
    ],
    name: 'validCandidate',
    outputs: [
      {
        name: '',
        type: 'bool'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: 'voterAddress',
        type: 'bytes32'
      }
    ],
    name: 'markVoter',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: 'candidate',
        type: 'bytes32'
      }
    ],
    name: 'voteForCandidate',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'winner',
    outputs: [
      {
        name: '',
        type: 'bytes32'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      {
        name: 'voterAddress',
        type: 'bytes32'
      }
    ],
    name: 'checkVoteStatus',
    outputs: [
      {
        name: '',
        type: 'bool'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'getCandidateList',
    outputs: [
      {
        name: '',
        type: 'bytes32[]'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        name: 'candidateNames',
        type: 'bytes32[]'
      }
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'constructor'
  }
];

/*
 * Retrieve contract from its address
 */
let votingContract = web3.eth.contract(votingAbiDefinition);
// The contract address must be changed for each deployment
votingContractInstance = votingContract.at(
  '0xf9b090ef5b56a4f387f069ae6bb5dadd0cc34b8a'
);

// Set Head node
HEAD_NODE = web3.eth.accounts[0];

let getHeadNode = () => {
  return HEAD_NODE.toString();
};

let setHeadNode = NEW_HEAD_NODE => {
  HEAD_NODE = NEW_HEAD_NODE;
};

let getVotingStatus = () => {
  return VOTING_END;
};

let setVotingStatus = status => {
  VOTING_END = status;
};

/*
 * Deploy the contract for the first using => Use node console instead
 */
// var amount = 85000;
// var bankingContract = web3.eth.contract([{"constant":true,"inputs":[],"name":"getBalance","outputs":[{"name":"","type":"int256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"int256"}],"name":"withdrawal","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"int256"}],"name":"deposit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"amount","type":"int256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]);
// var contractInstance = bankingContract.new(
//    amount,
//    {
//      from: web3.eth.accounts[0],
//      data: '0x608060405234801561001057600080fd5b5060405160208061018483398101806040528101908080519060200190929190505050806000819055505061013a8061004a6000396000f300608060405260043610610057576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806312065fe01461005c5780635f1cb5e714610087578063f04991f0146100b4575b600080fd5b34801561006857600080fd5b506100716100e1565b6040518082815260200191505060405180910390f35b34801561009357600080fd5b506100b2600480360381019080803590602001909291905050506100ea565b005b3480156100c057600080fd5b506100df600480360381019080803590602001909291905050506100fc565b005b60008054905090565b80600080828254039250508190555050565b806000808282540192505081905550505600a165627a7a72305820fdfd1dfc4cc281c72a830cb67c53ab9ed1b310548b3b727ea8a0868391cae35e0029',
//      gas: '4700000'
//    }, (e, contract) => {
//     if (typeof contract.address !== 'undefined') {
//         return contract;
//     } else {
//         return null;
//     }
//  });

module.exports = {
  bankingContractInstance: bankingContractInstance,
  votingContractInstance: votingContractInstance,
  web3: web3,
  HEAD_NODE: HEAD_NODE,
  MINIMAL_POWER: MINIMAL_POWER,
  getHeadNode,
  getHeadNode,
  setHeadNode: setHeadNode,
  getVotingStatus: getVotingStatus,
  setVotingStatus: setVotingStatus
};
