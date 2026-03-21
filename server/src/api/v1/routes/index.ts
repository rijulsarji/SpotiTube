import express from 'express';
const router = express.Router();
import demoRouter from './demo/router';
import spotitubeRouter from './spotitube';

router.use('/demo', demoRouter);
router.use('/spotitube', spotitubeRouter);

export default router;
