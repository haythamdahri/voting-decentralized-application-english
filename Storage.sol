pragma solidity ^0.4.25;

// Construire le contrat à déployer
contract SimpleStorage {

    uint storedData;
 
    // Constructeur
    function SimpleStorage() {

    }

    // Fonction de stockage
    function set(uint x) public {
        storedData = x;
    }

    // Fonction du retoure de la donnée stockée 
    function get() public view returns (uint) {
        return storedData;
    }
}