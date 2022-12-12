import { Router } from 'express';
import { Server } from 'socket.io';

const router = Router(),
    io = new Server(8000);

router.get('/', (req, res) => {
    res.send('Hello World!');
});

export default router;