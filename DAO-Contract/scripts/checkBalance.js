const { ethers } = require("hardhat");
const { CRYPTODEVS_NFT_CONTRACT_ADDRESS } = require("../constants");

async function main() {

    // Deploy the FakeNFTMarketplace contract first
    console.log("Balance of DAO Contract", (await ethers.provider.getBalance("0x05a565916578adF5fAF10b5145390B9d72cC2081")).toString())
    const Proposal = await ethers.getContractFactory("CryptoDevsDAO");
    proposed_contract = Proposal.attach("0x05a565916578adF5fAF10b5145390B9d72cC2081");

    proposalTxn = await proposed_contract.getProposal();

    console.log("Token ID ",proposalTxn.nftTokenId.toNumber());
    console.log("Proposal Contract Balance ", ethers.utils.formatEther(await ethers.provider.getBalance(proposed_contract.address)));
    const voteTxn = await proposed_contract.voteOnProposal(0);
    await voteTxn.wait();
    console.log("Vote Txn Complete");

    // proposalTxn = await proposed_contract.getProposal();

    // console.log("Yay Votes",proposalTxn.yayVotes.toNumber());
    // console.log("Nay Votes", proposalTxn.nayVotes.toNumber());
    // console.log("Number of Proposals", (await proposal_factory.getDeployedProposals()).length)
    

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });