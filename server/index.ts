import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { db } from "./db";

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const time = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} in ${time}ms`);
    return originalJson(body);
  };
  next();
});

(async () => {
  await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  });

  const port = Number(process.env.PORT) || 5000;
  app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
  });
})();
