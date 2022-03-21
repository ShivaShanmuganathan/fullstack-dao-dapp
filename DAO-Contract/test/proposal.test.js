const { expect } = require("chai");
const { ethers } = require("hardhat");
const { CRYPTODEVS_NFT_CONTRACT_ADDRESS } = require("../constants");

describe("Proposal Factory", function () {

  before(async function () {

    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();          

  });
  
  it("Should Deploy Proposal Factory & Create New Proposal Contract", async function () {

    // Deploy the FakeNFTMarketplace contract first
    const FakeNFTMarketplace = await ethers.getContractFactory(
      "FakeNFTMarketplace"
    );
    const fakeNftMarketplace = await FakeNFTMarketplace.deploy();
    await fakeNftMarketplace.deployed();
    console.log("FakeNFTMarketplace deployed to: ", fakeNftMarketplace.address);


    // Deploy the ProposalFactory contract second
    const ProposalFactory = await ethers.getContractFactory("ProposalFactory");    
    const proposal_factory = await ProposalFactory.deploy();
    await proposal_factory.deployed();
    console.log("ProposalFactory deployed to: ", proposal_factory.address);


    const Proposal = await ethers.getContractFactory("CryptoDevsDAO");

    await proposal_factory.createProposal(1, fakeNftMarketplace.address, CRYPTODEVS_NFT_CONTRACT_ADDRESS, {value: ethers.utils.parseEther("0.1")});

    console.log("Deployed Proposal Address", await proposal_factory.getDeployedProposals());
    proposed_contract = await Proposal.attach((await proposal_factory.getDeployedProposals())[0]);

    proposalTxn = await proposed_contract.getProposal();

    console.log(proposalTxn.nftTokenId.toNumber());
    console.log("Proposal Contract Balance ", ethers.utils.formatEther(await ethers.provider.getBalance(proposed_contract.address)));
    console.log("Proposal Factory Contract Balance ", ethers.utils.formatEther(await ethers.provider.getBalance(proposal_factory.address)));
    
    // expect(await proposed_contract.initialize(1, fakeNftMarketplace.address, CRYPTODEVS_NFT_CONTRACT_ADDRESS, {value: ethers.utils.parseEther("0.1")})).to.be.revertedWith("Initializable: contract is already initialized");

    // await proposed_contract.voteOnProposal(0);

    
  });

  // it("Should return description of proposal in the new proposal contract", async function () {  

  //   const return_value = (await proposed_contract.getSummary());
  //   console.log(return_value.description.toString());

  // });

  // it("Should check the proposer of the new proposal contract", async function () {  
    
  //   const return_value = (await proposed_contract.getSummary());
  //   console.log("Proposer Address", return_value.proposer.toString());
  //   console.log("Owner Address", owner.address)

  // });

  // it("Should set voting in the new proposal contract", async function () {  
  //   // enum returns 1 because VOTING is in 1 position in enum
  //   await proposed_contract.setVote();
  //   const return_value = (await proposed_contract.getSummary());
  //   console.log(return_value.status.toString());

  // });

  // it("Should upvote in the new proposal contract", async function () {  
    
  
  //   await proposed_contract.connect(addr1).upvote();
  //   await proposed_contract.connect(addr2).upvote();
  //   const return_value = (await proposed_contract.getSummary());
  //   console.log("Approval Count", return_value.approvalCount.toString());

  // });

  // it("Should downvote in the new proposal contract", async function () {  
    
  //   await proposed_contract.connect(addr3).downvote();
  //   await proposed_contract.connect(addr4).downvote();
  //   const return_value = (await proposed_contract.getSummary());
  //   console.log("Disapproval Count", return_value.disApprovalCount.toString());

  // });

  // it("Should upvote in the new proposal contract & move to ACCEPTED status", async function () {  
    
  //   // enum returns 2 because ACCEPTED is in 2 position in enum
  //   await proposed_contract.connect(addr1).upvote();
  //   await proposed_contract.connect(addr2).upvote();
  //   await proposed_contract.connect(addr3).upvote();
  //   // await proposed_contract.connect(addr4).downvote();
  //   const return_value = (await proposed_contract.getSummary());
  //   console.log("Status Of Proposal", return_value.status.toString());

  // });

  // it("Should downvote in the new proposal contract & move to REJECTED status", async function () {  
    
  //   // enum returns 3 because REJECTED is in 3 position in enum
  //   await proposed_contract.connect(addr1).downvote();
  //   await proposed_contract.connect(addr2).downvote();
  //   await proposed_contract.connect(addr3).downvote();
  //   // await proposed_contract.connect(addr4).downvote();
  //   const return_value = (await proposed_contract.getSummary());
  //   console.log("Status Of Proposal", return_value.status.toString());

  // });


  
});