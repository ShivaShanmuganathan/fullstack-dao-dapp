const { expect } = require("chai");
const { ethers } = require("hardhat");
const METADATA_URL = "https://nft-collection-dapp-kappa.vercel.app/api/";

describe("Proposal Factory", function () {

  beforeEach(async function () {

    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();          

  });
  
  it("Should Deploy Proposal Factory, Create & Exectue Accepted Proposal", async function () {

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

    await deployedCryptoDevsContract.setPaused(true);
    await expect (deployedCryptoDevsContract.mint({value: ethers.utils.parseEther("0.001")})).to.be.revertedWith('Contract currently paused');
    await deployedCryptoDevsContract.setPaused(false);
    await deployedCryptoDevsContract.tokenURI(1);

    await expect(deployedCryptoDevsContract.withdraw()).to.not.be.reverted;




    // Deploy the FakeNFTMarketplace contract second
    const FakeNFTMarketplace = await ethers.getContractFactory(
      "FakeNFTMarketplace"
    );
    const fakeNftMarketplace = await FakeNFTMarketplace.deploy();
    await fakeNftMarketplace.deployed();
    console.log("FakeNFTMarketplace deployed to: ", fakeNftMarketplace.address);
    console.log("Token 1 Availability", await fakeNftMarketplace.available(1));

    // Deploy the ProposalFactory contract third
    const ProposalFactory = await ethers.getContractFactory("ProposalFactory");    
    const proposal_factory = await ProposalFactory.deploy(deployedCryptoDevsContract.address);
    await proposal_factory.deployed();
    console.log("ProposalFactory deployed to: ", proposal_factory.address);

    const Proposal = await ethers.getContractFactory("CryptoDevsDAO");
    
    const sendEtherTxn = await owner.sendTransaction({
      to: proposal_factory.address,
      value: ethers.utils.parseEther("1.0"), // Sends exactly 1.0 ether
    });
    sendEtherTxn.wait();

    // await proposal_factory.createProposal(1, fakeNftMarketplace.address, ethers.utils.parseEther("1"));
    
    expect(await proposal_factory.createProposal(1, fakeNftMarketplace.address, ethers.utils.parseEther("1")) ).to.emit(proposal_factory, 'ProposalCreated');

    // expect(await proposal_factory.createProposal(1, fakeNftMarketplace.address, ethers.utils.parseEther("1")))
    // .to.emit(proposal_factory, 'ProposalCreated')
    // .withArgs(owner.address, fakeNftMarketplace.address.address, 1, ethers.utils.parseEther("1"));

    console.log("Deployed Proposal Address", await proposal_factory.getDeployedProposals());
    proposed_contract = await Proposal.attach((await proposal_factory.getDeployedProposals())[0]);

    proposalTxn = await proposed_contract.getProposal();

    console.log("Token ID ",proposalTxn.nftTokenId.toNumber());
    console.log("Proposal Contract Balance ", ethers.utils.formatEther(await ethers.provider.getBalance(proposed_contract.address)));
    console.log("Proposal Factory Contract Balance ", ethers.utils.formatEther(await ethers.provider.getBalance(proposal_factory.address)));
    
    expect(await proposed_contract.voteOnProposal(0))
    .to.emit(proposed_contract, 'VotingExecuted')
    .withArgs(owner.address, 1, 0);

    


    // expect(await proposal_factory.createProposal(1, fakeNftMarketplace.address, ethers.utils.parseEther("1")))
    // .to.emit(proposal_factory, 'ProposalCreated')
    // .withArgs(owner.address, fakeNftMarketplace.address.address, 1, ethers.utils.parseEther("1"));

    proposalTxn = await proposed_contract.getProposal();

    console.log("Yay Votes",proposalTxn.yayVotes.toNumber());
    console.log("Nay Votes", proposalTxn.nayVotes.toNumber());
    console.log("Number of Proposals", (await proposal_factory.getDeployedProposals()).length)



    
    // INCREASE TIME AND EXECUTE PROPOSAL
    await ethers.provider.send('evm_increaseTime', [1800]);
    await ethers.provider.send('evm_mine');
    expect(await proposed_contract.executeProposal())
    .to.emit(proposed_contract, 'ProposalExecuted')
    .to.emit(proposed_contract, 'EtherWithdraw');
    
    console.log("Proposal Contract Balance After Execution ", ethers.utils.formatEther(await ethers.provider.getBalance(proposed_contract.address)));
    console.log("Owner Of Proposal Contract",await proposed_contract.owner())
    console.log("Token 1 Availability After Execution", await fakeNftMarketplace.available(1));
    
    console.log("Proposal Factory Contract Balance After Execution ", ethers.utils.formatEther(await ethers.provider.getBalance(proposal_factory.address)));
    console.log("fakeNftMarketplace Contract Balance After Execution ", ethers.utils.formatEther(await ethers.provider.getBalance(fakeNftMarketplace.address)));
    
  });

  it("Should Deploy Proposal Factory, Create & Exectue Denied Proposal", async function () {

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
    const proposal_factory = await ProposalFactory.deploy(deployedCryptoDevsContract.address);
    await proposal_factory.deployed();
    console.log("ProposalFactory deployed to: ", proposal_factory.address);

    const Proposal = await ethers.getContractFactory("CryptoDevsDAO");
    
    const sendEtherTxn = await owner.sendTransaction({
      to: proposal_factory.address,
      value: ethers.utils.parseEther("1.0"), // Sends exactly 1.0 ether
    });
    sendEtherTxn.wait();

    // await proposal_factory.createProposal(1, fakeNftMarketplace.address, ethers.utils.parseEther("1"));

    expect(await proposal_factory.createProposal(1, fakeNftMarketplace.address, ethers.utils.parseEther("1")) ).to.emit(proposal_factory, 'ProposalCreated');
    // expect(await proposal_factory.createProposal(1, fakeNftMarketplace.address, ethers.utils.parseEther("1")))
    // .to.emit(proposal_factory, 'ProposalCreated')
    // .withArgs(owner.address, fakeNftMarketplace.address.address, 1, ethers.utils.parseEther("1"));

    console.log("Deployed Proposal Address", await proposal_factory.getDeployedProposals());
    proposed_contract = await Proposal.attach((await proposal_factory.getDeployedProposals())[0]);

    proposalTxn = await proposed_contract.getProposal();

    console.log("Token ID ",proposalTxn.nftTokenId.toNumber());
    console.log("Proposal Contract Balance ", ethers.utils.formatEther(await ethers.provider.getBalance(proposed_contract.address)));
    console.log("Proposal Factory Contract Balance ", ethers.utils.formatEther(await ethers.provider.getBalance(proposal_factory.address)));
    
    expect(await proposed_contract.voteOnProposal(1))
    .to.emit(proposed_contract, 'VotingExecuted')
    .withArgs(owner.address, 1, 1);

    proposalTxn = await proposed_contract.getProposal();

    console.log("Yay Votes",proposalTxn.yayVotes.toNumber());
    console.log("Nay Votes", proposalTxn.nayVotes.toNumber());
    console.log("Number of Proposals", (await proposal_factory.getDeployedProposals()).length)

    
    // INCREASE TIME AND EXECUTE PROPOSAL
    await ethers.provider.send('evm_increaseTime', [1800]);
    await ethers.provider.send('evm_mine');
    expect(await proposed_contract.executeProposal())
    .to.emit(proposed_contract, 'ProposalExecuted')
    .to.emit(proposed_contract, 'EtherWithdraw');
    
    console.log("Proposal Contract Balance After Execution ", ethers.utils.formatEther(await ethers.provider.getBalance(proposed_contract.address)));
    console.log("Owner Of Proposal Contract",await proposed_contract.owner())
    
    console.log("Proposal Factory Contract Balance After Execution ", ethers.utils.formatEther(await ethers.provider.getBalance(proposal_factory.address)));
    console.log("fakeNftMarketplace Contract Balance After Execution ", ethers.utils.formatEther(await ethers.provider.getBalance(fakeNftMarketplace.address)));
    
  });

  
});