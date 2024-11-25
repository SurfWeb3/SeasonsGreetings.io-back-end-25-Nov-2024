import express from 'express';
import * as nftController from '../../controllers/nftsController';

const router = express.Router();
router.get('/ping', nftController.checkServer);
router.post('/', nftController.createNFTRecord);
router.get('/:tokenId', nftController.getNFTDetails);
router.get('/claim/:claimAuthToken', nftController.getNFTByAuthToken);
router.post('/claim/:claimAuthToken', nftController.verifyAndClaimNFT);

export default router;