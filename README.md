# Festivals Back - Jason MORET IG4

Ce répertoire contient tous les fichiers nécessaires à la partie Serveur du projet

## Technos

Le framework ExpressJs a été utilisé, avec les modules bcrypt, cors, dotenv, jsonwebtoken et pg
La base de données est PostgreSQL

## Organisation des fichiers

Toutes les routes se trouvent dans le dossier `/routes`
Le fichier principal est `index.js`, il contient tous les middlewares de l'API

Pour l'authentification utilisateur et la gestion de token d'identification, un dossier `/utils` est présent

le fichier `pg.js` gère la connexion à la bd

le fichier `database.sql` contient la structure de la bd

## Fonctionnalités

Les fonctionnalités demandées sont toutes implémentées, et certaines sont en bonus

1. Gestion des jeux, zones, bénévoles et créneaux
2. Gestion des affectations de jeux et bénévoles
3. Login et Register, impossible d'ajouter ou modifier un row de la bd sans être posséder un token administrateur
4. Gestion des inputs, validation de tous les body reçus, injections SQL et duplications impossibles
5. Bonne utilisation des codes HTTP dans les réponses, selon chaque situation

## Lancement du projet

Pour lancer le projet, il suffit de lancer le fichier `index.js` avec `node index.js` ou `nodemon index.js` une fois que vous avez toutes les dépendances installées (`npm install`)

L'API sera disponible sur le port 5000# Festivals-Back-IOS
