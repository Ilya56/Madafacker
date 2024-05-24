# Madafacker

## Description

Social network with sarcasm and irony

## Installation

```bash
# install dependencies
$ npm install

# run migrations
$ npm run migrate 

# run seeding
$ npm run seed
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Overview

The Basic principle is to use [The Clean architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### Entities

`core` folder contains entities, abstractions and core errors. This is the heart of the system.
This is a domain and business-only layer. 

### Use cases

`use-cases` folder contains use cases for entities. It contains a logic of the business actions. 
Use case can be Command (change system state) or Query (don't change system state)

### Controllers

`controllers` and `listeners` are folder that contains triggers of the system
- controllers are an HTTP interface between an external world and system. In many cases, it's an entry point in the system flow.
- listeners are created to listen to any events, for example, events from other replicas

### Frameworks

`frameworks` folder contains all external lib adapters. It is a chain between framework and abstract system service.
`services` folder is created to match one of the implemented frameworks to the internal abstraction, nothing more
