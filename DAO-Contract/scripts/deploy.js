const { ethers } = require("hardhat");
const { CRYPTODEVS_NFT_CONTRACT_ADDRESS } = require("../constants");

async function main() {
  // Deploy the FakeNFTMarketplace contract first
  const FakeNFTMarketplace = await ethers.getContractFactory(
    "FakeNFTMarketplace"
  );
  const fakeNftMarketplace = await FakeNFTMarketplace.deploy();
  await fakeNftMarketplace.deployed();

  console.log("FakeNFTMarketplace deployed to: ", fakeNftMarketplace.address);

  // Now deploy the proposal factory
  const ProposalFactory = await ethers.getContractFactory("ProposalFactory");    
  const proposal_factory = await ProposalFactory.deploy(CRYPTODEVS_NFT_CONTRACT_ADDRESS);
  await proposal_factory.deployed();
  console.log("ProposalFactory deployed to: ", proposal_factory.address);
  const Proposal = await ethers.getContractFactory("CryptoDevsDAO");

  const sendEtherTxn = await owner.sendTransaction({
    to: proposal_factory.address,
    value: ethers.utils.parseEther("0.05"), // Sends exactly 0.05 ether
  });
  sendEtherTxn.wait();

  // Now deploy the CryptoDevsDAO contract
  (await proposal_factory.createProposal(1, fakeNftMarketplace.address, ethers.utils.parseEther("0.01"))).wait();
  console.log("createProposal complete")

  console.log("Deployed Proposal Address", await proposal_factory.getDeployedProposals());
  proposed_contract = Proposal.attach((await proposal_factory.getDeployedProposals())[0]);

  proposalTxn = await proposed_contract.getProposal();

  console.log("Token ID ",proposalTxn.nftTokenId.toNumber());
  console.log("Proposal Contract Balance ", ethers.utils.formatEther(await ethers.provider.getBalance(proposed_contract.address)));
  console.log("Proposal Factory Contract Balance ", ethers.utils.formatEther(await ethers.provider.getBalance(proposal_factory.address)));
  console.log("1st DAO Contract Deployed To: ", proposed_contract.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });