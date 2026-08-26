import { Router } from "express";

import { store } from "../services/store.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    res.json(
      await store.alerts({
        activeOnly: true,
      }),
    );
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const {
      key,
      title,
      type,
      message,
      severity,
      source,
      location,
      recommendations = [],
    } = req.body;

    if (!key || !title || !type || !message) {
      return res.status(400).json({
        error:
          "key, title, type and message are required",
      });
    }

    const alert = await store.createAlert({
      key,
      title,
      type,
      message,
      severity,
      source,
      location,
      recommendations,
    });

    res.status(201).json(alert);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await store.deleteAlert(req.params.id);

    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;