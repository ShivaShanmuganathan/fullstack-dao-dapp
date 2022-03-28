import { Contract, providers } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import {
  CRYPTODEVS_DAO_ABI,
  CRYPTODEVS_DAO_CONTRACT_ADDRESS,
  PROPOSAL_ABI,
  FAKE_NFT_MARKETPLACE_ADDRESS,
  CRYPTODEVS_NFT_ABI,
  CRYPTODEVS_NFT_CONTRACT_ADDRESS,
} from "../constants";
import styles from "../styles/Home.module.css";
import { LottiePlayer } from 'lottie-web';
// import Lottie from "react-lottie";


export default function Home() {
  // ETH Balance of the DAO contract
  const [treasuryBalance, setTreasuryBalance] = useState("0");
  // Number of proposals created in the DAO
  const [numProposals, setNumProposals] = useState("0");
  // Array of all proposals created in the DAO
  const [proposals, setProposals] = useState([]);
  // User's balance of CryptoDevs NFTs
  const [nftBalance, setNftBalance] = useState(0);
  // Fake NFT Token ID to purchase. Used when creating a proposal.
  const [fakeNftTokenId, setFakeNftTokenId] = useState("");
  // Fake NFT Token ID to purchase. Used when creating a proposal.
  const [costOfToken, setCostOfToken] = useState("");
  // One of "Create Proposal" or "View Proposals"
  const [selectedTab, setSelectedTab] = useState("");
  // True if waiting for a transaction to be mined, false otherwise.
  const [loading, setLoading] = useState(false);
  // True if user has connected their wallet, false otherwise
  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();
  const ref = useRef();
  const [lottie, setLottie] = useState("");

  const checkNetwork = async() => {
    const { ethereum } = window;
    let chainId = await ethereum.request({ method: 'eth_chainId' })
    if (chainId !== '0x4') {
      // window.alert("Please switch to the Matic Test Network!");
      // throw new Error("Please switch to the Matic Test Network");
      
      window.alert("This Dapp works on Rinkeby Test Network Only. Please Approve to switch to Rinkeby");
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId:'0x4' }],
      })  
    }
    
  }

  // Helper function to connect wallet
  const connectWallet = async () => {
    try {
      await checkNetwork();
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  // Reads the ETH balance of the DAO contract and sets the `treasuryBalance` state variable
  const getDAOTreasuryBalance = async () => {
    try {
      const provider = await getProviderOrSigner();
      const balance = await provider.getBalance(
        CRYPTODEVS_DAO_CONTRACT_ADDRESS
      );
      setTreasuryBalance(balance.toString());
    } catch (error) {
      console.error(error);
    }
  };

  // Reads the number of proposals in the DAO contract and sets the `numProposals` state variable
  const getNumProposalsInDAO = async () => {
    try {
      const provider = await getProviderOrSigner();
      const contract = getDaoContractInstance(provider);
      const daoNumProposals = (await contract.getDeployedProposals()).length;      
      setNumProposals(daoNumProposals.toString());
    } catch (error) {
      console.error(error);
    }
  };

  // Reads the balance of the user's CryptoDevs NFTs and sets the `nftBalance` state variable
  const getUserNFTBalance = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = getCryptodevsNFTContractInstance(signer);
      const balance = await nftContract.balanceOf(signer.getAddress());
      setNftBalance(parseInt(balance.toString()));
    } catch (error) {
      console.error(error);
    }
  };

  // Calls the `createProposal` function in the contract, using the tokenId from `fakeNftTokenId`
  const createProposal = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const daoContract = getDaoContractInstance(signer);
      // console.log("Token Cost", (parseEther(costOfToken)).toString() );
      const txn = await daoContract.createProposal(fakeNftTokenId, FAKE_NFT_MARKETPLACE_ADDRESS, parseEther(costOfToken.toString()));
      // const txn = await daoContract.getDeployedProposals();
      
      setLoading(true);
      await txn.wait();
      await getNumProposalsInDAO();
      setLoading(false);
    } catch (error) {
      console.error(error);
      window.alert(error.data.message);
    }
  };

  // Helper function to fetch and parse one proposal from the DAO contract
  // Given the Proposal ID
  // and converts the returned data into a Javascript object with values we can use
  const fetchProposalById = async (id) => {
    try {
      const provider = await getProviderOrSigner();
      const daoContract = getDaoContractInstance(provider);
      const proposal_address = await daoContract.deployedProposals(id);
      const proposalContract = getProposalContractInstance(provider, proposal_address);
      const proposal = await proposalContract.getProposal();

      const parsedProposal = {
        proposalId: id,
        nftTokenId: proposal.nftTokenId.toString(),
        priceOfNft: formatEther(proposal.priceOfNft).toString() + " ETH",
        deadline: new Date(parseInt(proposal.deadline.toString()) * 1000),
        yayVotes: proposal.yayVotes.toString(),
        nayVotes: proposal.nayVotes.toString(),
        executed: proposal.executed,
      };
      return parsedProposal;
    } catch (error) {
      console.error(error);
    }
  };

  // Runs a loop `numProposals` times to fetch all proposals in the DAO
  // and sets the `proposals` state variable
  const fetchAllProposals = async () => {
    try {
      const proposals = [];
      for (let i = numProposals-1; i >= 0; i--) {
        const proposal = await fetchProposalById(i);
        proposals.push(proposal);
      }
      setProposals(proposals);
      return proposals;
    } catch (error) {
      console.error(error);
    }
  };

  // Calls the `voteOnProposal` function in the contract, using the passed
  // proposal ID and Vote
  const voteOnProposal = async (proposalId, _vote) => {
    try {
      const signer = await getProviderOrSigner(true);
      const daoContract = getDaoContractInstance(signer);
      const proposal_address = await daoContract.deployedProposals(proposalId);
      const proposalContract = getProposalContractInstance(signer, proposal_address);
      // const proposal = await proposalContract.getProposal();
      console.log("Works until here");
      let vote = _vote === "YAY" ? 0 : 1;
      const txn = await proposalContract.voteOnProposal(vote);
      setLoading(true);
      await txn.wait();
      setLoading(false);
      await fetchAllProposals();
    } catch (error) {
      console.error(error);
      window.alert(error.data.message);
    }
  };

  // Calls the `executeProposal` function in the contract, using
  // the passed proposal ID
  const executeProposal = async (proposalId) => {
    try {
      const signer = await getProviderOrSigner(true);
      const daoContract = getDaoContractInstance(signer);
      const proposal_address = await daoContract.deployedProposals(proposalId);
      const proposalContract = getProposalContractInstance(signer, proposal_address);
      const txn = await proposalContract.executeProposal();
      setLoading(true);
      await txn.wait();
      setLoading(false);
      await fetchAllProposals();
    } catch (error) {
      console.error(error);
      window.alert(error.data.message);
    }
  };

  // Helper function to fetch a Provider/Signer instance from Metamask
  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Please switch to the Rinkeby network!");
      throw new Error("Please switch to the Rinkeby network");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  // Helper function to return a DAO Contract instance
  // given a Provider/Signer
  const getDaoContractInstance = (providerOrSigner) => {
    return new Contract(
      CRYPTODEVS_DAO_CONTRACT_ADDRESS,
      CRYPTODEVS_DAO_ABI,
      providerOrSigner
    );
  };

  // Helper function to return a PROPOSAL Contract instance
  // given a Provider/Signer
  const getProposalContractInstance = (providerOrSigner, PROPOSAL_CONTRACT_ADDRESS) => {
    return new Contract(
      PROPOSAL_CONTRACT_ADDRESS,
      PROPOSAL_ABI,
      providerOrSigner
    );
  };

  // Helper function to return a CryptoDevs NFT Contract instance
  // given a Provider/Signer
  const getCryptodevsNFTContractInstance = (providerOrSigner) => {
    return new Contract(
      CRYPTODEVS_NFT_CONTRACT_ADDRESS,
      CRYPTODEVS_NFT_ABI,
      providerOrSigner
    );
  };

  useEffect(() => {
    import('lottie-web').then((Lottie) => setLottie(Lottie.default));
  }, []);

  useEffect(() => {
    if (lottie && ref.current) {
      const animation = lottie.loadAnimation({
        container: ref.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        // path to your animation file, place it inside public folder
        path: '/lf30_editor_bmxoknqd.json',
      });

      return () => animation.destroy();
    }
  }, [lottie]);


  // piece of code that runs everytime the value of `walletConnected` changes
  // so when a wallet connects or disconnects
  // Prompts user to connect wallet if not connected
  // and then calls helper functions to fetch the
  // DAO Treasury Balance, User NFT Balance, and Number of Proposals in the DAO
  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });

      connectWallet().then(() => {
        getDAOTreasuryBalance();
        getUserNFTBalance();
        getNumProposalsInDAO();
      });
    }
  }, [walletConnected]);

  // Piece of code that runs everytime the value of `selectedTab` changes
  // Used to re-fetch all proposals in the DAO when user switches
  // to the 'View Proposals' tab
  useEffect(() => {
    if (selectedTab === "View Proposals") {
      fetchAllProposals();
    }
  }, [selectedTab]);

  // Render the contents of the appropriate tab based on `selectedTab`
  function renderTabs() {
    if (selectedTab === "Create Proposal") {
      return renderCreateProposalTab();
    } else if (selectedTab === "View Proposals") {
      return renderViewProposalsTab();
    }
    return null;
  }

  // Renders the 'Create Proposal' tab content
  function renderCreateProposalTab() {
    if (loading) {
      return (
        <div className={styles.description}>
          ...Waiting For Transaction...
          <img className={styles.image2} src="/block1.gif" />
        </div>
      );
    } else if (nftBalance === 0) {
      return (
        <div className={styles.description}>
          You do not own any CryptoDevs NFTs. <br />
          <b>You cannot create or vote on proposals</b>
          <br />
          <form action="https://nft-collection-dapp-kappa.vercel.app/" method="get" target="_blank">
          <button
              className={styles.button2}
              type="submit"
            >
              MINT NFT
          </button>
          </form>
        </div>
      );
    } else {
      return (
        <div className={styles.container}>
          {/* <label>Fake NFT Token ID to Purchase: </label> */}
          <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="TokenId">
              Fake NFT Token ID to Purchase
            </label>
            <input
              className="shadow appearance-none border rounded w-half py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              type="number" 
              required
              min="0"
              placeholder="0"
              onChange={(e) => setFakeNftTokenId(e.target.value)}
            />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="Cost">
                Cost of TokenID [in Ether]
              </label>
              <input
                className="shadow appearance-none border rounded w-half py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                type="number" 
                required
                min="0"
                placeholder="0"
                onChange={(e) => setCostOfToken(e.target.value)}
              />
              
            </div>
            
            <button className={styles.button3} onClick={createProposal}>
              CREATE
            </button>
          </form>

          
          
        </div>
      );
    }
  }

  // Renders the 'View Proposals' tab content
  function renderViewProposalsTab() {
    if (loading) {
      return (
        <div className={styles.description}>
          Loading Transaction...
          <img className={styles.image2} src="/block1.gif" />
        </div>
      );
    } else if (proposals.length === 0) {
      return (
        <div className={styles.description}>
          No proposals have been created
        </div>
      );
    } else {
      return (
        <div>
          {proposals.map((p, index) => (
            
            <div key={index} className={styles.proposalCard}>

              <p>Proposal ID: {p.proposalId}</p>
              <p>Fake NFT to Purchase: {p.nftTokenId}</p>
              <p>Price of NFT: {p.priceOfNft}</p>
              <p>Deadline: {p.deadline.toLocaleString()}</p>
              <p>Yay Votes: {p.yayVotes}</p>
              <p>Nay Votes: {p.nayVotes}</p>
              <p>Executed: {p.executed.toString()}</p>
              {p.deadline.getTime() > Date.now() && !p.executed ? (
                <div className={styles.flex}>
                  <button
                    className={styles.button4}
                    onClick={() => voteOnProposal(p.proposalId, "YAY")}
                  >
                    Vote YAY
                  </button>
                  <button
                    className={styles.button5}
                    onClick={() => voteOnProposal(p.proposalId, "NAY")}
                  >
                    Vote NAY
                  </button>
                </div>
              ) : p.deadline.getTime() < Date.now() && !p.executed ? (
                <div className={styles.flex}>
                  <button
                    className={styles.button5}
                    onClick={() => executeProposal(p.proposalId)}
                  >
                  {/* <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => rentNft(nft)}>Rent</button> */}
                    Execute Proposal{" "}
                    {p.yayVotes > p.nayVotes ? "(YAY)" : "(NAY)"}
                  </button>
                </div>
              ) : (
                <div className={styles.description}>Proposal Executed</div>
              )}
            </div>
          ))}
        </div>
      );
    }
  }

  return (
    <div>
      <Head>
        <title>CryptoDevs DAO</title>

        <meta name="description" content="CryptoDevs DAO" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin></link>
        <link href="https://fonts.googleapis.com/css2?family=Palette+Mosaic&family=Libre+Baskerville&family=Raleway:wght@600&display=swap" rel="stylesheet"></link>

      </Head>

      <div className={styles.main}>
        <div>
          <h1 className="font-Cinzel font-bold text-5xl pt-8">Welcome to the DAO!</h1>
          {/* <div className={styles.description}>Welcome to the DAO!</div> */}
          <div className={styles.description}>
            Your CryptoDevs NFT Balance: {nftBalance}
            <br />
            Treasury Balance: {formatEther(treasuryBalance)} ETH
            <br />
            Total Number of Proposals: {numProposals}
          </div>
          <div className={styles.flex}>
            <button
              className={styles.button3}
              onClick={() => setSelectedTab("Create Proposal")}
            >
              CREATE PROPOSAL
            </button>
            <button
              className={styles.button}
              onClick={() => setSelectedTab("View Proposals")}
            >
              VIEW PROPOSALS
            </button>
          </div>
          {renderTabs()}
        </div>
        <div className={styles.Home_image}>
          {/* <img className={styles.image} src="/cryptodevs/0.svg" /> */}
          <div className={styles.image} ref={ref} />
          {/* <img className={styles.image} src="/animation_500_l13867tp.gif" /> */}
        </div>
      </div>

      <footer>
      
        <div className="grid lg:grid-cols-2 gap-4">

          <div className="mb-6 md:mb-0">

            <div className="font-Cinzel font-bold text-lg text-right pt-8 pb-4 ml-8 content-center">
            <a href="https://github.com/ShivaShanmuganathan" target="_blank" rel="noopener noreferrer">
              MADE BY SHIVA
            </a>
            </div>

          </div>

          <div className="mb-6 md:mb-0">

            <div className="font-Cinzel font-bold text-lg text-right pt-8 pb-4 mr-20">
            <a href="https://nft-collection-dapp-kappa.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-orange-700">
              CHECK OUT NFT-COLLECTION HERE
            </a>
            
            </div>

          </div>

        </div>
        
        {/* <div className="font-Cinzel font-bold text-s text-center pt-8 pb-4">

          <a href="https://github.com/ShivaShanmuganathan" target="_blank" rel="noopener noreferrer">
              MADE WITH &#10084; BY SHIVA
          </a>

        </div> */}

      </footer>

      {/* <footer class="bg-gray-100 text-center lg:text-left"> */}

        {/* <div class="container p-6 text-gray-800">
          <div class="grid lg:grid-cols-2 gap-4">
            <div class="mb-6 md:mb-0">
              <h5 class="font-medium mb-2 uppercase">Footer text</h5>

              <p class="mb-4">
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iste atque ea quis
                molestias. Fugiat pariatur maxime quis culpa corporis vitae repudiandae
                aliquam voluptatem veniam, est atque cumque eum delectus sint!
              </p>
            </div>

            <div class="mb-6 md:mb-0">
              <h5 class="font-medium mb-2 uppercase">Footer text</h5>

              <p class="mb-4">
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iste atque ea quis
                molestias. Fugiat pariatur maxime quis culpa corporis vitae repudiandae
                aliquam voluptatem veniam, est atque cumque eum delectus sint!
              </p>
            </div>
          </div>
        </div> */}

        {/* <div class="text-center text-gray-700 p-4" style="background-color: rgba(0, 0, 0, 0.2);">
          © 2021 Copyright:
          <a class="text-gray-800" href="https://tailwind-elements.com/">Tailwind Elements</a>
        </div> */}
      
      {/* </footer> */}


    </div>
  );
}