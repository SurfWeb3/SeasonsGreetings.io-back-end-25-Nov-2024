import NFT, { INFT } from '../models/nfts.scheam';
import { v4 as uuidv4 } from 'uuid';
import { sendNFTClaimEmail } from './emailService';
import { seasonsgreetings_nft } from '../common/nfts';

/**
 * Simple health check function
 */
export const healthCheck = async (): Promise<{ status: string, message: string }> => {
    try {
        return {
            status: 'success',
            message: 'NFT Service is running'
        };
    } catch (error) {
        throw new Error('NFT Service health check failed');
    }
};

/**
 * Ping-pong test function with timestamp
 */
export const ping = async (): Promise<{ status: string, message: string, timestamp: string }> => {
    try {
        return {
            status: 'success',
            message: 'pong',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        throw new Error('Ping request failed');
    }
};

export const createNFT = async (nftData: Partial<INFT>): Promise<INFT> => {
    try {
        // Generate a unique claim token
        const claimAuthToken = generateClaimToken();

        // Create new NFT with the generated token
        const nft = new NFT({
            ...nftData,
            claimAuthToken,
            isClaimed: false
        });

        const savedNFT = await nft.save();
        
        if (savedNFT.claimMethod === 'EMAIL' && savedNFT.email) {
            const isSeasonGreeting = seasonsgreetings_nft.includes(savedNFT.contractAddress);
            const emailResult = await sendNFTClaimEmail(savedNFT.email, savedNFT.claimAuthToken, nftData.message, savedNFT.contractAddress, isSeasonGreeting);
            
            if (!emailResult.success) {
                console.log('Failed to send claim email:', emailResult.error);
                // Optionally, you could throw an error here or handle it differently
                // throw new Error(`Failed to send claim email: ${emailResult.error}`);
            }
        }

        return savedNFT;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Failed to create NFT: ${errorMessage}`);
    }
};


export const getNFTByToken = async (tokenId: number): Promise<INFT | null> => {
    try {
        return await NFT.findOne({ tokenId });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Failed to fetch NFT: ${errorMessage}`);
    }
};

export const getNFTByAuthToken = async (claimAuthToken: string): Promise<INFT | null> => {
    try {
        return await NFT.findOne({ claimAuthToken });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Failed to fetch NFT: ${errorMessage}`);
    }
};

export const updateClaimStatus = async (
    claimAuthToken: string, 
    recipientAddress: string,
): Promise<INFT | null> => {
    try {
        const updateOptions = {
            new: true,
        };

        return await NFT.findOneAndUpdate(
            { 
                claimAuthToken,
                isClaimed: false // Only update if not already claimed
            },
            { 
                isClaimed: true,
                recipientAddress 
            },
            updateOptions
        );
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Failed to update claim status: ${errorMessage}`);
    }
};

/**
* Generates a unique claim token
* Format: prefix-uuid-timestamp
*/
const generateClaimToken = (): string => {
    const prefix = 'NFT';
    const uuid = uuidv4();
    const timestamp = Date.now() + Math.random();
    return `${prefix}-${uuid}-${timestamp}`;
};