const { expect } = require("chai");
const { ethers } = require("hardhat");
// const { CRYPTODEVS_NFT_CONTRACT_ADDRESS } = require("../constants");
const METADATA_URL = "https://nft-collection-dapp-kappa.vercel.app/api/";

describe("Proposal Factory", function () {

  before(async function () {

    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();          

  });
  
  it("Should Deploy Proposal Factory & Create New Proposal Contract", async function () {

    // Deploy the NFT contract first
    const metadataURL = METADATA_URL;
    const cryptoDevsContract = await ethers.getContractFactory("CryptoDevs");
    const deployedCryptoDevsContract = await cryptoDevsContract.deploy(
      metadataURL,
    );
    console.log("Owner Of Contract",await deployedCryptoDevsContract.owner())
    console.log("Owner Address", owner.address)
    console.log(
      "Crypto Devs Contract Address:",
      deployedCryptoDevsContract.address
    );
    await deployedCryptoDevsContract.mint({value: ethers.utils.parseEther("0.001")});



    // Deploy the FakeNFTMarketplace contract second
    const FakeNFTMarketplace = await ethers.getContractFactory(
      "FakeNFTMarketplace"
    );
    const fakeNftMarketplace = await FakeNFTMarketplace.deploy();
    await fakeNftMarketplace.deployed();
    console.log("FakeNFTMarketplace deployed to: ", fakeNftMarketplace.address);


    // Deploy the ProposalFactory contract third
    const ProposalFactory = await ethers.getContractFactory("ProposalFactory");    
    const proposal_factory = await ProposalFactory.deploy();
    await proposal_factory.deployed();
    console.log("ProposalFactory deployed to: ", proposal_factory.address);

    const Proposal = await ethers.getContractFactory("CryptoDevsDAO");

    await proposal_factory.createProposal(1, fakeNftMarketplace.address, deployedCryptoDevsContract.address, {value: ethers.utils.parseEther("1")});

    console.log("Deployed Proposal Address", await proposal_factory.getDeployedProposals());
    proposed_contract = await Proposal.attach((await proposal_factory.getDeployedProposals())[0]);

    proposalTxn = await proposed_contract.getProposal();

    console.log("Token ID ",proposalTxn.nftTokenId.toNumber());
    console.log("Proposal Contract Balance ", ethers.utils.formatEther(await ethers.provider.getBalance(proposed_contract.address)));
    console.log("Proposal Factory Contract Balance ", ethers.utils.formatEther(await ethers.provider.getBalance(proposal_factory.address)));
    
    await proposed_contract.voteOnProposal(0);

    proposalTxn = await proposed_contract.getProposal();

    console.log("Yay Votes",proposalTxn.yayVotes.toNumber());
    console.log("Nay Votes", proposalTxn.nayVotes.toNumber());

    
    // INCREASE TIME AND EXECUTE PROPOSAL
    await ethers.provider.send('evm_increaseTime', [1800]);
    await ethers.provider.send('evm_mine');
    await proposed_contract.executeProposal();
    
    console.log("Proposal Contract Balance After Execution ", ethers.utils.formatEther(await ethers.provider.getBalance(proposed_contract.address)));
    console.log("Owner Of Proposal Contract",await proposed_contract.owner())
    
    console.log("Proposal Factory Contract Balance After Execution ", ethers.utils.formatEther(await ethers.provider.getBalance(proposal_factory.address)));
    console.log("fakeNftMarketplace Contract Balance After Execution ", ethers.utils.formatEther(await ethers.provider.getBalance(fakeNftMarketplace.address)));
    
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