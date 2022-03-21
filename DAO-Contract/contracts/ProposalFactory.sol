// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "./CryptoDevsDAO.sol";

contract ProposalFactory {
    address immutable tokenImplementation;
    address[] public deployedProposals;
    ICryptoDevsNFT cryptoDevsNFT;

    constructor() public {
        tokenImplementation = address(new CryptoDevsDAO());
    }

    function createProposal(uint256 _nftTokenId, address _nftMarketplace, address _cryptoDevsNFT) public payable returns (address){

        address payable clone = payable(Clones.clone(tokenImplementation));
        CryptoDevsDAO(clone).initialize{value: msg.value}(_nftTokenId, _nftMarketplace, _cryptoDevsNFT);
        deployedProposals.push(clone);
        cryptoDevsNFT = ICryptoDevsNFT(_cryptoDevsNFT);
        return clone;
    }

    function getDeployedProposals() public view returns (address[] memory) {
        return deployedProposals;
    }

    fallback() external payable {}

    modifier nftHolderOnly() {
        require(cryptoDevsNFT.balanceOf(msg.sender) > 0, "NOT_A_DAO_MEMBER");
        _;
    }
}