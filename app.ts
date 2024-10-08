import express, { ErrorRequestHandler } from "express";


import myMoviesRouter from "./routes/films";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let counter = 0;

app.use((req, _res, next) => {  
  if (req.method === "GET") {
    counter++;
    console.log(`Request number ${counter}`);
  }
  next();
});

app.use("/films", myMoviesRouter);



const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err.stack);
    return res.status(500).send("Something broke!");
  };
  
  app.use(errorHandler);
  
export default app;
