import express from 'express';
import nftRoutes from './nftRoutes';

const router = express.Router();

router.use('/nft', nftRoutes);

export default router;