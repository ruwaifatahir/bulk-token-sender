//----------------------------IMPORTS---------------------------------
import dotenv from "dotenv";
import {
  JsonRpcProvider,
  Wallet,
  Contract,
  parseEther,
  formatEther,
} from "ethers";
import { tokenAbi } from "./abi/tokenAbi.js";
import { bulkSenderAbi } from "./abi/bulkSenderAbi.js";

dotenv.config();

//----------------------------CONSTANTS and VARS---------------------------------
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
const BULK_TOKEN_SENDER_ADDRESS = process.env.BULK_TOKEN_SENDER_ADDRESS;

/**
 * Demo receivers and amounts for demonstration purposes
 * In a real scenario, these will be pending withdrawals for users
 */
const receivers = [
  "0x116612cF1d491c372F9Eb3dDb86fBf9447bef28d",
  "0x5Ac75b178015A01F711414804C6f074A1B69417b",
  "0x4b45306259418249CE43ee7b311Bc555c0EE133C",
  "0x74F25dB732066C2dB21D9a5003c36be076729Ad1",
  "0xb5a1CB10274492FDDA5794a7b639eFb1d8aE7cAb",
  "0x6f77CC1819f5c33E760Fc3917c0b10AA27d75dE4",
  "0xe59C24676fBF48f2b3F52dbF4D4938610378B081",
  "0x66288E5EAa4B4e22A38423f00A8e0E359bD71e78",
  "0x585d53b858c5D9A7F0458b81e76D5D3Ea874d00a",
  "0xe7643bcC1EfEeC746ceb53d86A7e16EbEEca7e99",
];

const amounts = [
  parseEther("10.76"),
  parseEther("7.21"),
  parseEther("56.109"),
  parseEther("120.77"),
  parseEther("21.02"),
  parseEther("74.6"),
  parseEther("98.19"),
  parseEther("56.71"),
  parseEther("88.1"),
  parseEther("34.45"),
];

/**
 * Initiate provider to read data from blockchain
 * Initiate signer to write data to blockchain
 * Note: The signer can both read and write data from the blockchain,
 * but when initiating the signer class, we need to supply a
 * provider to the signer
 */
const provider = new JsonRpcProvider(RPC_URL);
const signer = new Wallet(PRIVATE_KEY, provider);

/**
 * Initiate the token and bulk sender contracts to enable interaction with them
 * tokenContract - is the actual token contract that will be transferred to users as a reward
 * bulkSenderContract - is the contract responsible for sending rewards to users in bulk
 */
const tokenContract = new Contract(TOKEN_ADDRESS, tokenAbi, signer);
const bulkSenderContract = new Contract(
  BULK_TOKEN_SENDER_ADDRESS,
  bulkSenderAbi,
  signer
);

//----------------------------MAIN ROUTINE---------------------------------
const main = async () => {
  //Log the balance of receivers before bulk send
  receivers.forEach(async (receiver) =>
    console.log(await viewBalance(tokenContract, receiver))
  );

  /**
   * Approve the bulk sender contract so it can transfer rewards to users on our behalf
   * Note: You should only run this function when bulk sender is approved already
   * You might need to approve the contract again if all allowance is used
   */
  await approve(tokenContract, BULK_TOKEN_SENDER_ADDRESS, parseEther("100000"));

  //Bulk Send the tokens
  await bulkSend(bulkSenderContract, receivers, amounts);

  //Log the balance of receivers after bulk send
  receivers.forEach(async (receiver) =>
    console.log(await viewBalance(tokenContract, receiver))
  );

  //Now we have successfuly transfered the rewards to users its time to update the record on db. So changes reflects on admin panel and on PermaCash app

  //Write your server/db code here.....
};

//----------------------------HELPER ROUTINES---------------------------------
/**
 * This function is responsible for bulk sending the rewards to users.
 *
 * _bulkSenderContract - The interface of the bulk sender contract to enable interaction with it.
 * _receivers - An array of users who are expected to receive the rewards
 * _amounts - An array of amounts, with each element representing the appropriate amount for the corresponding receiver
 *
 * Note:
 *
 * Both arrays should have elements correctly arranged.
 * For example, if user1 has a reward of 100 tokens , it should be arranged as follows:
 * _receivers = [user1]
 * _amounts [100]
 *
 * Both arrays should be equal in length
 * Neither array should exceed a length of 175
 * Caller should enough balance to cover this transaction
 * Caller should have approved this contract already
 */
const bulkSend = async (_bulkSenderContract, _receivers, _amounts) => {
  try {
    const tx = await _bulkSenderContract.bulksendToken(
      TOKEN_ADDRESS,
      _receivers,
      _amounts
    );

    await tx.wait();

    console.log("Bulk Send Successful :)");
  } catch (err) {
    console.log("Bulk Send Failed :(");
    console.log(err);
  }
};

//Function to approve
const approve = async (_tokenContract, _spender, _amount) => {
  try {
    const tx = await _tokenContract.approve(_spender, _amount);
    await tx.wait();
    console.log("Approve Successful :)");
  } catch (err) {
    console.log("Approve Failed :(");
  }
};
//Function to check balance of receivers
const viewBalance = async (_tokenContract, _account) => {
  try {
    return formatEther(await _tokenContract.balanceOf(_account));
  } catch (err) {
    console.log(err);
  }
};

main().catch((err) => console.log(err));
