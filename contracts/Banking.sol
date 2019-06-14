pragma solidity ^0.4.25;

contract Banking {
    int balance;
    
    constructor(int amount) public {
        balance = amount;
    }
    
    function deposit(int amount) public {
        balance += amount;
    }
    
    function withdrawal(int amount) public {
        balance -= amount;
    }
    
    function getBalance() view public returns(int){
        return balance;
    }
}