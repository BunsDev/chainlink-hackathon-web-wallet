# ABOUT PROXY WALLET

Proxy Wallet is a solution designed to allow users to:

1. Rent Accounts, NFTs, and Ownable smart-contracts
2. Blacklist actions of your wallet (useful for transparency)
3. Schedule transactions for the future

Let's go step by step and see how each of these would be useful to the modern EVM infrastructure.

## 1. Renting Accounts, NFTs, Ownable Smart-contracts

It is useful to rent an NFT if it has some utility. For instance, a character in a game, or a car in a metaverse.

An owner of an NFT might not care about it or not need it all the time, but if you can gain some short-term profit from simply holding an NFT, then it is profitable for both parties to enter into a loan agreement, where the initial owner gets some money from borrowing that NFT, and the lender receives whatever interest they make from holding that NFT or performing some actions on it. 

The same applies to Ownable smart-contracts, where you can temporarily receive an ownership.

Also, please note, that a smart-account / smart-wallet could be represented in the form of an Ownable contract, so you could potentially even transfer/rent accounts.

### How is this achieved? 

This is achieved using the combination of #2 and #3.

We have two problems in the modern infrastructure:
1. How do we guarantee, that the Ownership or NFT will not be transferred to somebody other than the previous owner?
2. How do we guarantee, that it will be transferred back to the original owner when the time comes?

These two problems are solved using:
1. Blacklisting transactions inside the smart-contract wallet. Wallet owner gets blacklisted from executing the "transfer" function.
2. Scheduling transactions inside the smart-contract wallet. Wallet owner specifies that the transaction of transferring the NFT back to the owner will be executed automatically, when the rental period ends.

In the next two sections we will explore how this is achieved technically.

## Blacklisting actions of your wallet

As mentioned above, the blacklisting transactions' calldata is an essential part to guarantee that you wouldn't execute a malicious transaction, such as transferring an NFT to an EOA address, which cannot guarantee an NFT return.

In the smart-contracts code, there are a few essential lines like this one:

> mapping(address => mapping(bytes4 => bool)) public blacklistedFunctions;

This mapping is used to blacklist wallet transactions. 

And the following line validates that a transaction that a user wants to execute is not blacklisted:

> require(!blacklistedFunctions[to][selector], "CW: func is blaclisted");

## Scheduling transactions for the future

This is where the Chainlink Automation kicks in.

If there is a case where a user should guarantee to a counterparty, that they would execute some transaction but only in the future, they should use the scheduling of transactions.

It works in the following way:

1. Owner of the smart-contract wallet chooses the transaction calldata that will be sent to the blockchain
2. Then, they choose when it will be executed.
3. After that, they provide the estimated fees multiplied by a safe coefficient to ensure that the transaction will go through.

In the end, the transaction gets auto executed by the chainlink automation.

To ensure fault-tolerancy, the auto-execute functions have been made available to anybody. So, if for example, an owner of an NFT sees that the automation transaction failed (for whatever reason), they could execute it themselves.

# USP / Unique Selling Proposition

1. Allowing more trustless transactions
Currently, users cannot guarantee that a specific wallet will NOT execute an already ALLOWED for them transaction.
To fix this, the transaction should be DISALLOWED inside their very wallet.

2. Liquid Wallets.
By allowing to sell or rent a wallet, we create a new liquidity in the market in the form of wallets.

Positions in DeFi protocols, accounts in GameFi products, all of these are now tokenized using this approach.

3. Recurring payments, Scheduled transactions

4. Atomic batches of transactions.

When it's required to execute multiple transactions at the same time, you don't need to write any scripts and smart-contracts anymore, a smart contract wallet can handle that.

# Gas-Efficiency

Wallets work using the minimal proxy contract standard, which allows for a better gas efficiency when creating a new wallet.

Besides, a smart-contract can potentially optimize your transactions if you execute them in a batch using the smart-contract wallet.