export const PolusContractAbi = [
      {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
      },
      {
            "anonymous": false,
            "inputs": [
                  {
                        "indexed": true,
                        "internalType": "bytes16",
                        "name": "uuid",
                        "type": "bytes16"
                  },
                  {
                        "indexed": true,
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                  },
                  {
                        "indexed": true,
                        "internalType": "address",
                        "name": "sender",
                        "type": "address"
                  },
                  {
                        "indexed": false,
                        "internalType": "address",
                        "name": "feerecvr",
                        "type": "address"
                  },
                  {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "feevalue",
                        "type": "uint256"
                  },
                  {
                        "indexed": false,
                        "internalType": "address",
                        "name": "mrhrecvr",
                        "type": "address"
                  },
                  {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "mrhvalue",
                        "type": "uint256"
                  }
            ],
            "name": "ERC20Payment",
            "type": "event"
      },
      {
            "anonymous": false,
            "inputs": [
                  {
                        "indexed": true,
                        "internalType": "bytes16",
                        "name": "uuid",
                        "type": "bytes16"
                  },
                  {
                        "indexed": true,
                        "internalType": "address",
                        "name": "sender",
                        "type": "address"
                  },
                  {
                        "indexed": false,
                        "internalType": "address",
                        "name": "feerecvr",
                        "type": "address"
                  },
                  {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "feevalue",
                        "type": "uint256"
                  },
                  {
                        "indexed": false,
                        "internalType": "address",
                        "name": "mrhrecvr",
                        "type": "address"
                  },
                  {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "mrhvalue",
                        "type": "uint256"
                  }
            ],
            "name": "ETHPayment",
            "type": "event"
      },
      {
            "inputs": [
                  {
                        "internalType": "bytes16",
                        "name": "uuid",
                        "type": "bytes16"
                  },
                  {
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                  },
                  {
                        "internalType": "address",
                        "name": "feerecvr",
                        "type": "address"
                  },
                  {
                        "internalType": "uint256",
                        "name": "feevalue",
                        "type": "uint256"
                  },
                  {
                        "internalType": "address",
                        "name": "mrhrecvr",
                        "type": "address"
                  },
                  {
                        "internalType": "uint256",
                        "name": "mrhvalue",
                        "type": "uint256"
                  }
            ],
            "name": "DoERC20Payment",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
      },
      {
            "inputs": [
                  {
                        "internalType": "bytes16",
                        "name": "uuid",
                        "type": "bytes16"
                  },
                  {
                        "internalType": "address",
                        "name": "feerecvr",
                        "type": "address"
                  },
                  {
                        "internalType": "uint256",
                        "name": "feevalue",
                        "type": "uint256"
                  },
                  {
                        "internalType": "address",
                        "name": "mrhrecvr",
                        "type": "address"
                  },
                  {
                        "internalType": "uint256",
                        "name": "mrhvalue",
                        "type": "uint256"
                  }
            ],
            "name": "DoETHPayment",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
      }
];

export const PolusContractAddress = {
      1: "0x25adcda8324c7081b0f7eaa052df04e076694d62",
      56: "0x25aDCDA8324C7081B0f7Eaa052DF04E076694d62",
      137: "0x377F05e398E14f2d2Efd9332cdB17B27048AB266",
      42161: "0x25adcda8324c7081b0f7eaa052df04e076694d62",
};
