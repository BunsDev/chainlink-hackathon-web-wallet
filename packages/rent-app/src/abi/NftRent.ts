export const nftRentAbi = [
  {
    inputs: [
      { internalType: 'address', name: '_smartWalletFactory', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'AddressInsufficientBalance',
    type: 'error',
  },
  { inputs: [], name: 'FailedInnerCall', type: 'error' },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'listId',
        type: 'bytes32',
      },
    ],
    name: 'List',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'listId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'rentId',
        type: 'bytes32',
      },
    ],
    name: 'Rent',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'rentId',
        type: 'bytes32',
      },
    ],
    name: 'RentReturn',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'rentId',
        type: 'bytes32',
      },
    ],
    name: 'RentReturnForced',
    type: 'event',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'rentId', type: 'bytes32' }],
    name: 'autoExecuteCallback',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'blacklistedFunctionsERC721',
    outputs: [{ internalType: 'bytes4', name: '', type: 'bytes4' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'counter',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'tokenContract', type: 'address' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { internalType: 'uint256', name: 'rentDuration', type: 'uint256' },
      { internalType: 'uint256', name: 'ethFee', type: 'uint256' },
    ],
    name: 'list',
    outputs: [{ internalType: 'bytes32', name: 'id', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'listInfos',
    outputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'tokenContract', type: 'address' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { internalType: 'uint256', name: 'rentDuration', type: 'uint256' },
      { internalType: 'uint256', name: 'ethFee', type: 'uint256' },
      { internalType: 'bool', name: 'fulfilled', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'bytes', name: '', type: 'bytes' },
    ],
    name: 'onERC721Received',
    outputs: [{ internalType: 'bytes4', name: '', type: 'bytes4' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'id', type: 'bytes32' }],
    name: 'rent',
    outputs: [
      { internalType: 'address', name: 'smartWallet', type: 'address' },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'id', type: 'bytes32' }],
    name: 'rentExternal',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'rentInfos',
    outputs: [
      { internalType: 'address', name: 'renter', type: 'address' },
      { internalType: 'uint256', name: 'rentEndsAt', type: 'uint256' },
      { internalType: 'bytes32', name: 'listId', type: 'bytes32' },
      { internalType: 'bool', name: 'closed', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'rentId', type: 'bytes32' }],
    name: 'returnRented',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
