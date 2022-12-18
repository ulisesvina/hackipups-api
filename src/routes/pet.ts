import { Request, Response, Router } from "express";
import PetController from "../controllers/pet";
import { Pet } from "@prisma/client"
import CheckAuth from "../middlewares/checkAuth";

const router = Router();

router.get("/get-pet", CheckAuth, async (req: Request, res: Response) => {
    try {
      const pet = await PetController.getPet({ id: req.locals.id });
      res.send(pet);
    } catch (e: any) {
      res.status(500).send({ success: false, error: e.message ?? "Unknown error" });
    }
  });
  

export default router;
