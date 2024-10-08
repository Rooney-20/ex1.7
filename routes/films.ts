import { Router } from "express";
import path from "node:path";

import { Film, NewFilm } from "../types";
import { parse, serialize } from "../utils/json";
const jsonDbPath = path.join(__dirname, "/../data/drinks.json");

const router = Router();

const defaultFilms : Film[] = [
    {
        id: 1,
        title: "Inception",
        director: "Christopher Nolan",
        duration: 148
    },
    {
        id: 2,
        title: "The Matrix",
        director: "Lana Wachowski, Lilly Wachowski",
        duration: 136,
        description: "A computer hacker learns from mysterious rebels about the true nature of his reality...",
        imageUrl: "https://example.com/matrix.jpg"
    },
    {
        id: 3,
        title: "Interstellar",
        director: "Christopher Nolan",
        duration: 169,
        description : "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival...",
        imageUrl: "https://example.com/interstellar.jpg"
    }
];

//router to filter films by minimum duration
router.get("/", (req, res) => {
    const films = parse(jsonDbPath, defaultFilms);
    if(!req.query["minimum-duration"]) {
        return res.json(films);
    }
    const minimumDuration = Number(req.query["minimum-duration"]);
    if(isNaN(minimumDuration) || minimumDuration <= 0) {
        return res.sendStatus(400);
    }
    const filteredFilms = films.filter((film) => {
        return film.duration >= minimumDuration;
    });
    return res.json(filteredFilms);
    
});

//router to get a specific film
router.get("/:id", (req, res) => {
    const id = Number(req.params.id);
    const films = parse(jsonDbPath, defaultFilms);
    const film = films.find((film) => film.id === id);
    if(!film) {
        return res.sendStatus(404);
    } else {
        return res.json(film);
    }
});

//router to add a new film
router.post("/", (req, res) => {
    const body: unknown = req.body;
    if (
        !body ||
        typeof body !== "object" ||
        !("title" in body) ||
        !("director" in body) ||
        !("duration" in body) ||
        typeof body.title !== "string" ||
        typeof body.director !== "string" ||
        typeof body.duration !== "number" ||
        !body.title.trim() ||
        !body.director.trim() ||
        body.duration <= 0 ||

        ("budget" in body && (typeof body.budget !== "number" || body.budget <= 0)) ||
        ("description" in body && (typeof body.description !== "string" || !body.description.trim()))
    ) {
        return res.sendStatus(400);
    }

    const { title, director, duration} = body as NewFilm;

    const films = parse(jsonDbPath, defaultFilms);

    const nextId = films.reduce((maxId, film) => (film.id > maxId ? film.id : maxId), 0) + 1;

    const newFilm: Film = {
        id: nextId,
        title,
        director,
        duration
    };

    films.push(newFilm);
    serialize(jsonDbPath, films);
    return res.status(201).json(newFilm);
});

//router to delete a film using his id
router.delete("/:id", (req, res) => {
    const id = Number(req.params.id);
    const films = parse(jsonDbPath, defaultFilms);
    const index = films.findIndex((film) => film.id === id);
     if(index === -1) {
        return res.sendStatus(404);
    }
    const deletedFilms = films.splice(index, 1);
    serialize(jsonDbPath, films);
    return res.json(deletedFilms[0]); 
});

//router to UPDATE a film
router.patch("/:id", (req, res) => {
    const id = Number(req.params.id);
    const films = parse(jsonDbPath, defaultFilms);
    const film = films.find((film) => film.id === id);
    if(!film) {
        return res.sendStatus(404);
    }

    const body : unknown = req.body;

    if (
        !body ||
        typeof body !== "object" ||
        ("title" in body &&
            (typeof body.title !== "string" || !body.title.trim())) ||
        ("director" in body &&
            (typeof body.director !== "string" || !body.director.trim())) ||
        ("duration" in body &&
            (typeof body.duration !== "number" || body.duration <= 0 )) ||
        ("budget" in body && (typeof body.budget !== "number" || body.budget <= 0)) ||
        ("description" in body && (typeof body.description !== "string" || !body.description.trim()))
    ) {
        return res.sendStatus(400);
    }

    const { title, director, duration}: Partial<NewFilm> = body;

    if (title) {
        film.title = title;
    }
    if(director) {
        film.director = director;
    }
    if(duration) {
        film.duration = duration;
    }
    serialize(jsonDbPath, films);

    return res.json(film);
});

//router to put
router.put("/:id", (req, res) => {
    const body: unknown = req.body;

    //this if is to verify that all the parameters are given
    if (
        !body ||
        typeof body !== "object" ||
        !("title" in body) ||
        !("director" in body) ||
        !("duration" in body) ||
        typeof body.title !== "string" ||
        typeof body.director !== "string" ||
        typeof body.duration !== "number" ||
        !body.title.trim() ||
        !body.director.trim() ||
        body.duration <= 0 ||

        ("budget" in body && (typeof body.budget !== "number" || body.budget <= 0)) ||
        ("description" in body && (typeof body.description !== "string" || !body.description.trim()))
    ) {
        return res.sendStatus(400);
    }

    const id = Number(req.params.id);
    const films = parse(jsonDbPath, defaultFilms);

    const index = films.findIndex((film) => film.id === id);
    if(index === -1) {
        const { title, director, duration} = body as NewFilm;


        const nextId = films.reduce((maxId, film) => (film.id > maxId ? film.id : maxId), 0) + 1;

        const newFilm: Film = {
           id: nextId,
           title,
           director,
           duration
        };
        films.push(newFilm);
        serialize(jsonDbPath, films);
        return res.json(newFilm);
    } else {
        const film = films.find((film) => film.id === id);
        if(!film) {
            return res.sendStatus(400);
        }

        const { title, director, duration} = body as Partial<NewFilm>;

       if (title) {
           film.title = title;
        }
       if(director) {
           film.director = director;
        }
        if(duration) {
           film.duration = duration;
        }
        serialize(jsonDbPath, films);

        return res.json(film);
    }

});

export default router;