// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "./CryptoDevsDAO.sol";


/**
 * Minimal interface for CryptoDevsNFT containing only two functions
 * that we are interested in
 */
// interface ICryptoDevsNFT {
//     /// @dev balanceOf returns the number of NFTs owned by the given address
//     /// @param owner - address to fetch number of NFTs for
//     /// @return Returns the number of NFTs owned
//     function balanceOf(address owner) external view returns (uint256);

//     /// @dev tokenOfOwnerByIndex returns a tokenID at given index for owner
//     /// @param owner - address to fetch the NFT TokenID for
//     /// @param index - index of NFT in owned tokens array to fetch
//     /// @return Returns the TokenID of the NFT
//     function tokenOfOwnerByIndex(address owner, uint256 index)
//         external
//         view
//         returns (uint256);
// }

contract ProposalFactory {
    address immutable tokenImplementation;
    address[] public deployedProposals;
    ICryptoDevsNFT cryptoDevsNFT;

    event ProposalCreated(address indexed proposer, address indexed cloneAddress, address _nftMarketplace, uint256 indexed _nftTokenId, uint256 _nftPrice);

    constructor(address _cryptoDevsNFT) public {
        tokenImplementation = address(new CryptoDevsDAO());
        cryptoDevsNFT = ICryptoDevsNFT(_cryptoDevsNFT);
    }

    function createProposal(uint256 _nftTokenId, address _nftMarketplace, uint256 _nftPrice) public payable nftHolderOnly returns (address){

        address payable clone = payable(Clones.clone(tokenImplementation));
        CryptoDevsDAO(clone).initialize{value: _nftPrice}(_nftTokenId, _nftPrice, _nftMarketplace, address(cryptoDevsNFT));
        deployedProposals.push(clone);
        emit ProposalCreated(msg.sender,  clone, _nftMarketplace, _nftTokenId,  _nftPrice);
        return clone;
        
    }

    function getDeployedProposals() public view returns (address[] memory) {
        return deployedProposals;
    }

    fallback() external payable {}

    receive() external payable {}

    modifier nftHolderOnly() {
        require(cryptoDevsNFT.balanceOf(msg.sender) > 0, "NOT_A_DAO_MEMBER");
        _;
    }
}