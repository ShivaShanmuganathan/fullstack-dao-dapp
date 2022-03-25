// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "./CryptoDevsDAO.sol";


contract ProposalFactory {
    address immutable tokenImplementation;
    address[] public deployedProposals;
    ICryptoDevsNFT cryptoDevsNFT;

    event ProposalCreated(address indexed proposer, address indexed cloneAddress, address _nftMarketplace, uint256 indexed _nftTokenId, uint256 _nftPrice);

    /// @notice Constructor function initializes the implementation DAO proposal contract, and the crypto dev nft membership contract address 
    /// @dev This is a minimal proxy contract, that uses the DAO proposal contract for implementing the calls made to clone contracts
    constructor(address _cryptoDevsNFT) public {
        tokenImplementation = address(new CryptoDevsDAO());
        cryptoDevsNFT = ICryptoDevsNFT(_cryptoDevsNFT);
    }

    /// @notice createProposal - This function is used to create a new proposal contract.
    /// @dev This function sends Ether to the newly created proposal contract
    /// @param _nftTokenId The tokenId of NFT
    /// @param _nftMarketplace The address of NFT marketplace
    /// @param _nftPrice The price of the NFT token    
    function createProposal(uint256 _nftTokenId, address _nftMarketplace, uint256 _nftPrice) public payable nftHolderOnly returns (address){

        address payable clone = payable(Clones.clone(tokenImplementation));
        CryptoDevsDAO(clone).initialize{value: _nftPrice}(_nftTokenId, _nftPrice, _nftMarketplace, address(cryptoDevsNFT));
        deployedProposals.push(clone);
        emit ProposalCreated(msg.sender,  clone, _nftMarketplace, _nftTokenId,  _nftPrice);
        return clone;
        
    }

    /// @notice getDeployedProposals - This function returns the address of all the contracts deploying using this factory contract
    function getDeployedProposals() public view returns (address[] memory) {
        return deployedProposals;
    }

    // The following two functions allow the contract to accept ETH deposits
    // directly from a wallet without calling a function
    fallback() external payable {}

    receive() external payable {}

    /// @notice nftHolderOnly modifier only allows the Crypto Dev NFT Holder to create and vote on propoal contract
    modifier nftHolderOnly() {
        require(cryptoDevsNFT.balanceOf(msg.sender) > 0, "NOT_A_DAO_MEMBER");
        _;
    }
}