import { ethers } from 'ethers';
import NFT_ABI from '../web3/nft_abi.json';

const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS as string;
const WEBSITE_WALLET_PRIVATE_KEY = process.env.WEBSITE_WALLET_PRIVATE_KEY as string;

// Initialize provider (using Sepolia testnet)
const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/7a58d8e1fcf04896867367c1e2ee7b05');

// Create wallet instance
const wallet = new ethers.Wallet(WEBSITE_WALLET_PRIVATE_KEY, provider);

// Create contract instance

export const transferNFT = async (tokenId: number, recipientAddress: string, contractAddress: string): Promise<string> => {
    try {
        const nftContract = new ethers.Contract(contractAddress, NFT_ABI, wallet);
        const tx = await nftContract.transferFrom(
            wallet.address,
            recipientAddress,
            tokenId
        );
        
        // Wait for transaction to be mined
        const receipt = await tx.wait();
        return receipt.hash;
    } catch (error: any) {
        console.error('NFT transfer error:', error);
        throw new Error(`Failed to transfer NFT: ${error.message}`);
    }
};