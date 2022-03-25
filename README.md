# Full Stack DAO Dapp 

### [Check Out Live DAO Project 🚀](https://fullstack-dao-dapp.vercel.app/)
### [Check Out NFT Collection Dapp 🚀](https://nft-collection-dapp-kappa.vercel.app/)

## Project Description 📃

### [Full Stack DAO Project using OpenZeppelin's Minimal Proxy](https://fullstack-dao-dapp.vercel.app/)
- Users need to mint the NFT from this [NFT Minting Dapp.](https://nft-collection-dapp-kappa.vercel.app/)
- Only the Crypto Dev NFT Holders will be able to create proposals and vote.
- Proposals are created using [EIP 1167 minimal proxies.](https://eips.ethereum.org/EIPS/eip-1167)
- NFT Holders can create proposals by specifying the parameters required to make a purchase from the NFT Marketplace.
- On creation of a proposal, proposal factory contract sends Ether to the newly created proposal contract.
- `10 minutes` is the voting period for the proposal. Only the NFT Holders are allowed to vote.
- After the voting period, the proposal can be executed by the Crypto Dev NFT Holders.
- If `YayVotes > NayVotes`, then proposal is executed ⏩ NFT is purchased from the NFT Marketplace using the Ether in the proposal contract.
- If `YayVotes < NayVotes`, then proposal is not executed ⏩ Ether in the proposal contract is sent to the proposal factory contract.

## Directory Structure 📂
- `my-app` ⏩ Contains the Next.js Frontend of this application
- `DAO-Contract/contracts` ⏩ Contains all the Solditiy smart contracts deployed in the Rinkeby Test Network.
- `DAO-Contract/test` ⏩ Contains Tests for the smart contract

## How to run this project locally


