import { ethers } from "ethers";

// A Web3Provider wraps a standard Web3 provider, which is
// what Metamask injects as window.ethereum into each page
const provider = new ethers.providers.Web3Provider(window.ethereum);

// The Metamask plugin also allows signing transactions to
// send ether and pay to change state within the blockchain.
// For this, you need the account signer...
const signer = provider.getSigner();

// Get the string from the text input
var message = document.getElementById("name");

// Look up the current block number
await provider.getBlockNumber();
// 13098598

// You can also use an ENS name for the contract address
const TokenAddress = "0x068964E433e3D35C68cbA901aF3eDd4776107CF1";

const TokenAbi = [
  [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"author","type":"address"},{"indexed":false,"internalType":"string","name":"text","type":"string"}],"name":"MakeMessage","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"freeJoss","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_messageIndex","type":"uint256"}],"name":"getMessages","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_newMessage","type":"string"}],"name":"makeMessage","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"messages","outputs":[{"internalType":"address","name":"author","type":"address"},{"internalType":"string","name":"text","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]
];

// The Contract object.  Read and write allowed because passing signer
const TokenContract = new ethers.Contract(TokenAddress, TokenAbi, signer);

// read only method to get a single message from messages
// https://docs.ethers.io/v5/api/contract/contract/#Contract-functionsCall
// messageObj should be a Result object (essentially an array) with messageObj[1]
// being author and messageObj[2] being the message.
// Need to check if this function is even needed.  Might be able to delete it
// from smart contract if calling the 'messages' array with an index returns the message
var messageObj = await TokenContract.getMessages(0);

// write message to give the caller 1 free jossToken
// accourding to the docs, it should never return anything. If something needs
// to be returned "it should be logged using a Solidity event (or EVM
// log), which can then be queried from the transaction receipt."
await TokenContract.freeJoss();

// write message to create a message and put it on the Blockchain
// has an argument that takes a string as the message.  Will also take the
// caller's address and create a message object and add it to messages array on
// chain.
// Should make this emit an event "which can then be queried from the transaction
// receipt" so I can update on front end.
await makeMessage(message);

//
// Attempts to wire connect Wallet button
//

async function connectWallet(){
  const provider = new ethers.providers.Web3Provider(
    window.ethereum,
    "any"
  );
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();

  (async function () {
    let userAddress = await signer.getAddress();
    document.getElementById("wallet").innerText =
      "Your wallet is " + userAddress;
  })();
}

//
// Attempts to wire freeJoss button
//

// request access to the user's MetaMask account
async function requestAccount() {
  await window.ethereum.request({ method: 'eth_requestAccounts' });
}

// From https://dev.to/dabit3/the-complete-guide-to-full-stack-ethereum-development-3j13
// This tutorial uses react so I might have to purge react stuff from here.
// This just queries the blockchain so we don't need user account info.
async function fetchMessage() {
  if (typeof window.ethereum !== 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    console.log({ provider })
    const contract = new ethers.Contract(TokenAddress, TokenAbi, provider)
    try {
      // Access the first index of the messages array.
      // TODO: might need [0] instead.
      const data = await contract.messages(0)
      alert(data);
      console.log('data: ', data)
    } catch (err) {
      console.log("Error: ", err)
    }
  }
}

//


//
// My attempts below
//

function init(){

  // A Web3Provider wraps a standard Web3 provider, which is
  // what Metamask injects as window.ethereum into each page
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  // The Metamask plugin also allows signing transactions to
  // send ether and pay to change state within the blockchain.
  // For this, you need the account signer...
  const signer = provider.getSigner();

  // You can also use an ENS name for the contract address
  const TokenAddress = "0x068964E433e3D35C68cbA901aF3eDd4776107CF1";

  const TokenAbi = [
    [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"author","type":"address"},{"indexed":false,"internalType":"string","name":"text","type":"string"}],"name":"MakeMessage","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"freeJoss","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_messageIndex","type":"uint256"}],"name":"getMessages","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_newMessage","type":"string"}],"name":"makeMessage","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"messages","outputs":[{"internalType":"address","name":"author","type":"address"},{"internalType":"string","name":"text","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]
  ];

  // The Contract object.  Read and write allowed because passing signer
  const TokenContract = new ethers.Contract(TokenAddress, TokenAbi, signer);
}

// Get the button:
jossbutton = document.getElementById("jossButton");

// When the user clicks on the button, call the freeJoss() function from contract
function freeJossButton() {

  // init function gets Web3 provider, signer, and contract information
  init();

  // write message to give the caller 1 free jossToken
  // accourding to the docs, it should never return anything. If something needs
  // to be returned "it should be logged using a Solidity event (or EVM
  // log), which can then be queried from the transaction receipt."
  await TokenContract.freeJoss();
}


//
//  EXAMPLES
//

//
// READ ONLY METHODS
//

// Get the ERC-20 token name
await daiContract.name();
// 'Dai Stablecoin'

// Get the ERC-20 token symbol (for tickers and UIs)
await daiContract.symbol();
// 'DAI'

// Get the balance of an address
balance = await daiContract.balanceOf("ricmoo.firefly.eth");
// { BigNumber: "14032899074838529727100" }

// Format the DAI for displaying to the user
ethers.utils.formatUnits(balance, 18);
// '14032.8990748385297271'


//
// STATE CHANGING METHODS
//

// The DAI Contract is currently connected to the Provider,
// which is read-only. You need to connect to a Signer, so
// that you can pay to send state-changing transactions.
const daiWithSigner = contract.connect(signer);

// Each DAI has 18 decimal places
const dai = ethers.utils.parseUnits("1.0", 18);

// Send 1 DAI to "ricmoo.firefly.eth"
tx = daiWithSigner.transfer("ricmoo.firefly.eth", dai);


//
// LISTENING TO EVENTS
//

// Receive an event when ANY transfer occurs
daiContract.on("Transfer", (from, to, amount, event) => {
    console.log(`${ from } sent ${ formatEther(amount) } to ${ to}`);
    // The event object contains the verbatim log data, the
    // EventFragment and functions to fetch the block,
    // transaction and receipt and event functions
});

// A filter for when a specific address receives tokens
myAddress = "0x8ba1f109551bD432803012645Ac136ddd64DBA72";
filter = daiContract.filters.Transfer(null, myAddress);
// {
//   address: 'dai.tokens.ethers.eth',
//   topics: [
//     '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
//     null,
//     '0x0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72'
//   ]
// }

// Receive an event when that filter occurs
daiContract.on(filter, (from, to, amount, event) => {
    // The to will always be "address"
    console.log(`I got ${ formatEther(amount) } from ${ from }.`);
});
