import { Request, Response, NextFunction } from 'express';
import * as NFTService from '../services/nftService';
import { verifyMessage } from 'ethers';
import { transferNFT } from '../services/web3Service';

export const checkServer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await NFTService.ping();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createNFTRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nftData = req.body;
    const result = await NFTService.createNFT(nftData);
    res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(400).json({
      status: 'error',
      message: errorMessage
    });
  }
};

export const getNFTDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tokenId } = req.params;
    const result = await NFTService.getNFTByToken(Number(tokenId));

    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: 'NFT not found'
      });
    }

    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getNFTByAuthToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { claimAuthToken } = req.params;
    const result = await NFTService.getNFTByAuthToken(claimAuthToken);

    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: 'NFT not found'
      });
    }

    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const verifyAndClaimNFT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { claimAuthToken } = req.params;
    const { signature, message, walletAddress, contractAddress } = req.body;

    // Verify the signature
    const recoveredAddress = verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new Error('Invalid signature');
    }

    // Parse the signed message
    const messageData = JSON.parse(message);

    // Verify the claim token matches
    if (messageData.claimAuthToken !== claimAuthToken) {
      throw new Error('Invalid claim token');
    }

    // First attempt the NFT transfer
    const txHash = await transferNFT(messageData.tokenId, walletAddress, contractAddress);

    // If NFT transfer is successful, update the database
    const nftRecord = await NFTService.updateClaimStatus(
      claimAuthToken,
      walletAddress,
    );

    if (!nftRecord) {
      // If database update fails, we need to handle this edge case
      throw new Error('NFT found but failed to update claim status');
    }

    res.json({
      status: 'success',
      data: {
        ...nftRecord.toObject(),
        transactionHash: txHash
      }
    });

  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(400).json({
      status: 'error',
      message: errorMessage
    });
  }
};