# Lushwood Haven API
## Backend for [Lushwood Haven App](https://github.com/333Nikita333/lushwood-haven)

## Project Description
This project is the backend for a hotel room booking application. It provides an API for registering and authenticating users, as well as viewing, managing and booking rooms.


## Table of Contents

- [API Endpoints](#api-endpoints)
- [Project structure](#project-structure)
- [Installation](#installation)
- [Used Libraries](#used-libraries)

## API Endpoints
### Routing for working with users
**@ POST /api/auth/register**
<br>User registration. Accepts an object with name, email, phone (optional field) and password. Returns a user object with name, phone (if specified during registration) and email, as well as a JWT token required for authentication on other endpoints.
<br>**@ POST /api/auth/login**
<br>User authorization. Accepts an object with email and password fields. Returns a user object with the user's name, email address, an array of the user's new and old room booking, and the JWT token needed for authentication with other endpoints.
<br>**@ GET /api/auth/current**
<br>Retrieving user data by his token. Returns a user object with the user's name, email address, and an array of the user's new and old room booking.
### Routing for working with a collection of rooms
**@ GET /api/services/rooms/**
<br>Get information about all existing rooms. Authorization using JWT token in authorization header is not required.
<br>**@ GET /api/services/rooms/:name**
<br>Get information about one room by its name. Authorization using the JWT token in the authorization header is not required.
### Routing for working with room booking (requires a JWT token in the authorization header)
**@ POST /api/booking/reserve**
<br>Booking room. Accepts an object with the fields name, email address, phone number, name and type of room being booked, and check-in and check-out dates.
<br>**@DELETE /api/booking/cancel/:orderId**
<br>Deleting a user's current room booking using his ID
<br>**@GET /api/booking/neworders**
<br>Receiving information about a user's new room bookings.
<br>**@GET /api/booking/oldorders**
<br>Receiving information about a user's old room bookings.

## Project structure
├── src
│   ├── app
│   │   ├── domain
│   │   ├── middlewares
│   │   ├── models
│   ├── helpers
│   ├── infra
│   ├── types
│   ├── main.ts
├── .env
├── .gitignore
├── nodemon.json
├── package.json
├── tsconfig.json
└── README.md

- app: main application directory
- domain: domain models and logic
- middlewares: intermediate processors
- models: data models for MongoDB
- helpers: helper functions and utilities
- infra: infrastructure modules (a service that works with TCP)
- types: general application types
- main.ts: application entry point

## Installation
1. Клонируйте репозиторий:
```bash
git clone https://github.com/333Nikita333/lushwood-haven-api.git
```
2. Перейдите в директорию проекта:
```bash
cd lushwood-haven-api
```
3. Для установки зависимостей используйте: `npm install` or `yarn install`
4. Создайте файл .env в корне проекта и добавьте необходимые переменные окружения. Пример:
```bash
DB_HOST=mongodb://myDatabaseUser:D1fficultP%40ssw0rd@db1.example.net:27017,db2.example.net:2500/?replicaSet=test&connectTimeoutMS=300000
PORT=4000
SECRET_KEY=YOUR_SECRET_KEY
```
5. Для запуска проекта в режиме разработки используйте команду: `npm run dev` or `yarn dev`

## Used Libraries
- class-transformer: for transforming class objects
- class-validator: for validating class objects
- cloudinary: for working with cloud image storage
- cors: for setting up CORS
- dotenv: for working with environment variables
- express: framework for creating servers
- jsonwebtoken: for working with JWT tokens
- mongoose: for working with the MongoDB database
- multer: for processing file downloads
- reflect-metadata: for using decorators in TypeScript
- routing-controllers: for creating routes using decorators
- bcryptjs: for password hashing
- nodemon: to automatically restart the server when changes occur
- ts-node: for executing TypeScript code without preliminary compilation
- tsconfig-paths: to support paths from tsconfig
- typescript: for development in TypeScript
