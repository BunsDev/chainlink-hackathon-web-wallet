export const smartWalletFactoryV1Abi = [
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'linkToken',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'clRegistrar',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'clRegistry',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'uniswapV3Router',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'wethToken',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'linkFeePerExecution',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'wethToLinkSwapPath',
            type: 'bytes',
          },
        ],
        internalType: 'struct SmartWalletFactoryV1.CommonDeployParams',
        name: '_commonDeployParams',
        type: 'tuple',
      },
      {
        internalType: 'address',
        name: '_implementation',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'ERC1167FailedCreateClone',
    type: 'error',
  },
  {
    inputs: [],
    name: 'commonDeployParams',
    outputs: [
      {
        internalType: 'address',
        name: 'linkToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'clRegistrar',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'clRegistry',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'uniswapV3Router',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'wethToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'linkFeePerExecution',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'wethToLinkSwapPath',
        type: 'bytes',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'counter',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'allowlistOperator',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'baseSalt',
        type: 'bytes32',
      },
    ],
    name: 'create2Wallet',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'allowlistOperator',
        type: 'address',
      },
    ],
    name: 'createWallet',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'deployedSalts',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'baseSalt',
        type: 'bytes32',
      },
    ],
    name: 'getSalt',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'implementation',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'baseSalt',
        type: 'bytes32',
      },
    ],
    name: 'predictCreate2Wallet',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'wallet',
        type: 'address',
      },
    ],
    name: 'validateWallet',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
