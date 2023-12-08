export const bulkSenderAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_tokenAddress",
        type: "address",
      },
      {
        internalType: "address[]",
        name: "_to",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "_value",
        type: "uint256[]",
      },
    ],
    name: "bulksendToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "LogTokenBulkSent",
    type: "event",
  },
];
