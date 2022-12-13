import { Request, Response, Router } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
    req.app.get("socket").emit("message", "Hello World!");
    res.send("1")
});

export default router;
