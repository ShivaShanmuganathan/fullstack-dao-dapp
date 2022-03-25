// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";


// IFakeNFTMarketplace & ICryptoDevsNFT Interfaces are added here

/**
 * Minimal interface for FakeNFTMarketplace containing only three functions
 * that we are interested in
 */
interface IFakeNFTMarketplace {
    /// @dev getPrice() returns the price of an NFT from the FakeNFTMarketplace
    /// @return Returns the price in Wei for an NFT
    function getPrice() external view returns (uint256);

    /// @dev available() returns whether or not the given _tokenId has already been purchased
    /// @return Returns a boolean value - true if available, false if not
    function available(uint256 _tokenId) external view returns (bool);

    /// @dev purchase() purchases an NFT from the FakeNFTMarketplace
    /// @param _tokenId - the fake NFT tokenID to purchase
    function purchase(uint256 _tokenId) external payable;
}

/**
 * Minimal interface for CryptoDevsNFT containing only two functions
 * that we are interested in
 */
interface ICryptoDevsNFT {
    /// @dev balanceOf returns the number of NFTs owned by the given address
    /// @param owner - address to fetch number of NFTs for
    /// @return Returns the number of NFTs owned
    function balanceOf(address owner) external view returns (uint256);

    /// @dev tokenOfOwnerByIndex returns a tokenID at given index for owner
    /// @param owner - address to fetch the NFT TokenID for
    /// @param index - index of NFT in owned tokens array to fetch
    /// @return Returns the TokenID of the NFT
    function tokenOfOwnerByIndex(address owner, uint256 index)
        external
        view
        returns (uint256);
}

contract CryptoDevsDAO is Initializable {

    // We will write contract code here
    // Create a struct named Proposal containing all relevant information
    struct Proposal {
        // nftTokenId - the tokenID of the NFT to purchase from FakeNFTMarketplace if the proposal passes
        uint256 nftTokenId;
        // priceOfNft - the price of the NFT to purchase from FakeNFTMarketplace if the proposal passes
        uint256 priceOfNft;
        // deadline - the UNIX timestamp until which this proposal is active. Proposal can be executed after the deadline has been exceeded.
        uint256 deadline;
        // yayVotes - number of yay votes for this proposal
        uint256 yayVotes;
        // nayVotes - number of nay votes for this proposal
        uint256 nayVotes;
        // executed - whether or not this proposal has been executed yet. Cannot be executed before the deadline has been exceeded.
        bool executed;        
    }
    
    // voters - a mapping of CryptoDevsNFT tokenIDs to booleans indicating whether that NFT has already been used to cast a vote or not
    mapping(uint256 => bool) voters;

    // proposal - Struct containing the details of the proposal
    Proposal public proposal;

    // owner - address of the owner of this contract
    address public owner;

    // Vote Enum containing possible options for a vote
    enum Vote {
        YAY, // YAY = 0
        NAY // NAY = 1
    }

    IFakeNFTMarketplace nftMarketplace;
    ICryptoDevsNFT cryptoDevsNFT;


    // Events to denote that voting, proposal and withdrawal has been completed
    event VotingExecuted(address indexed voter, uint256 numVotes, Vote vote);
    event ProposalExecuted(address _nftMarketplace, uint256 indexed _nftTokenId, uint256 _nftPrice, bool nft_purchased);
    event EtherWithdraw(address indexed receiver, uint256 balance);

    /// @notice initialize function initialized the proposal
    /// @dev Only if the tokenId is available in the nftMarketplace, this proposal can be initialized, ether is transferred from factory contract to this proposal
    /// @param _nftTokenId - contains the tokenId of the NFT
    /// @param _nftPrice - contains the price of the nft in the marketplace
    /// @param _nftMarketplace - contains the address of the nft marketplace
    /// @param _cryptoDevsNFT - contains the address of the crypto dev nft membership address
    function initialize(uint256 _nftTokenId, uint256 _nftPrice, address _nftMarketplace, address _cryptoDevsNFT) initializer public payable{

        nftMarketplace = IFakeNFTMarketplace(_nftMarketplace);
        cryptoDevsNFT = ICryptoDevsNFT(_cryptoDevsNFT);
        require(nftMarketplace.available(_nftTokenId), "NFT_NOT_FOR_SALE");
        proposal.nftTokenId = _nftTokenId;
        proposal.priceOfNft = _nftPrice;
        // Set the proposal's voting deadline to be (current time + 10 minutes)
        proposal.deadline = block.timestamp + 10 minutes;
        owner = msg.sender;

    }

    /// @dev voteOnProposal allows a CryptoDevsNFT holder to cast their vote on an active proposal
    /// @param vote - the type of vote they want to cast
    function voteOnProposal(Vote vote)
        external
        nftHolderOnly
        activeProposalOnly
    {
        
        uint256 voterNFTBalance = cryptoDevsNFT.balanceOf(msg.sender);
        uint256 numVotes = 0;

        // Calculate how many NFTs are owned by the voter
        // that haven't already been used for voting on this proposal
        for (uint256 i = 0; i < voterNFTBalance; i++) {
            uint256 tokenId = cryptoDevsNFT.tokenOfOwnerByIndex(msg.sender, i);
            if (voters[tokenId] == false) {
                numVotes++;
                voters[tokenId] = true;
            }
        }
        require(numVotes > 0, "ALREADY_VOTED");

        if (vote == Vote.YAY) {
            proposal.yayVotes += numVotes;
            emit VotingExecuted(msg.sender, numVotes, vote);
        } else {
            proposal.nayVotes += numVotes;
            emit VotingExecuted(msg.sender, numVotes, vote);
        }
    }

    /// @dev executeProposal allows any CryptoDevsNFT holder to execute a proposal after it's deadline has been exceeded
    function executeProposal()
        external
        nftHolderOnly
        inactiveProposalOnly
    {
        
        // If the proposal has more YAY votes than NAY votes
        // purchase the NFT from the FakeNFTMarketplace
        uint256 nftPrice = nftMarketplace.getPrice();
        
        

        if (proposal.yayVotes > proposal.nayVotes) {    
            require(address(this).balance >= nftPrice, "NOT_ENOUGH_FUNDS");
            nftMarketplace.purchase{value: nftPrice}(proposal.nftTokenId);
            emit ProposalExecuted(address(nftMarketplace), proposal.nftTokenId, nftPrice, true);
        }

        else {
            emit ProposalExecuted(address(nftMarketplace), proposal.nftTokenId, nftPrice, false);
        }

        proposal.executed = true;
        
        withdrawEther();
    }

    
    /// @dev withdrawEther allows the contract owner (deployer) to withdraw the ETH from the contract
    function withdrawEther() internal {

        emit EtherWithdraw(owner, address(this).balance);
        payable(owner).transfer(address(this).balance);        

    }

    /// @dev getProposal returns the proposal struct 
    function getProposal() public view returns (Proposal memory) {
    
        return proposal;

    }

    // Modifier which only allows a function to be
    // called if the given proposal's deadline has not been exceeded yet
    modifier activeProposalOnly() {
        require(
            proposal.deadline > block.timestamp,
            "DEADLINE_EXCEEDED"
        );
        _;
    }

    // Modifier which only allows a function to be
    // called if the given proposals' deadline HAS been exceeded
    // and if the proposal has not yet been executed
    modifier inactiveProposalOnly() {
        require(
            proposal.deadline <= block.timestamp,
            "DEADLINE_NOT_EXCEEDED"
        );
        require(
            proposal.executed == false,
            "PROPOSAL_ALREADY_EXECUTED"
        );
        _;
    }

    // Modifier which only allows a function to be
    // called by someone who owns at least 1 CryptoDevsNFT
    modifier nftHolderOnly() {
        require(cryptoDevsNFT.balanceOf(msg.sender) > 0, "NOT_A_DAO_MEMBER");
        _;
    }

    // The following two functions allow the contract to accept ETH deposits
    // directly from a wallet without calling a function
    receive() external payable {}

    fallback() external payable {}

}
