export const splitFareCIDRegistryAbi = [
  {
    type: "event",
    name: "CIDAchored",
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "groupId",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "string",
        name: "cid",
        type: "string"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "recordCount",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint64",
        name: "timestamp",
        type: "uint64"
      }
    ]
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "anchorGroupCID",
    inputs: [
      {
        internalType: "uint256",
        name: "groupId",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "cid",
        type: "string"
      },
      {
        internalType: "uint256",
        name: "recordCount",
        type: "uint256"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    stateMutability: "view",
    name: "getLatestAnchor",
    inputs: [
      {
        internalType: "uint256",
        name: "groupId",
        type: "uint256"
      }
    ],
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "cid",
            type: "string"
          },
          {
            internalType: "uint64",
            name: "timestamp",
            type: "uint64"
          },
          {
            internalType: "uint256",
            name: "recordCount",
            type: "uint256"
          }
        ],
        internalType: "struct SplitFareCIDRegistry.Anchor",
        name: "",
        type: "tuple"
      }
    ]
  },
  {
    type: "function",
    stateMutability: "view",
    name: "getAnchorHistory",
    inputs: [
      {
        internalType: "uint256",
        name: "groupId",
        type: "uint256"
      }
    ],
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "cid",
            type: "string"
          },
          {
            internalType: "uint64",
            name: "timestamp",
            type: "uint64"
          },
          {
            internalType: "uint256",
            name: "recordCount",
            type: "uint256"
          }
        ],
        internalType: "struct SplitFareCIDRegistry.Anchor[]",
        name: "",
        type: "tuple[]"
      }
    ]
  },
  {
    type: "function",
    stateMutability: "view",
    name: "verifyCID",
    inputs: [
      {
        internalType: "uint256",
        name: "groupId",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "cid",
        type: "string"
      }
    ],
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ]
  },
  {
    type: "function",
    stateMutability: "view",
    name: "getAnchorCount",
    inputs: [
      {
        internalType: "uint256",
        name: "groupId",
        type: "uint256"
      }
    ],
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ]
  }
] as const;

export type SplitFareCIDRegistryAbi = typeof splitFareCIDRegistryAbi;

