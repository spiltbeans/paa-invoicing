# PAA INVOICING

> The main goal of this project to visualize invoicing data from an xlsx file for auditing purposes.

> There were two functional achievements
> 1. Parse xlsx files and create data structures for graph data.
> 2. Utilize graphing libraries to visualize the data.
- - -

## Table of Contents
- [Summary](#summary)
- [Deployment](#deployment)
- [Project Challanges](https://github.com/spiltbeans/paa-invoicing/wiki/Project-Challenges)
- [References](https://github.com/spiltbeans/paa-invoicing/wiki/References)
- [Notes](https://github.com/spiltbeans/paa-invoicing/wiki/Notes)

## SUMMARY
- Technology: NextJS, MaterialUI, Tailwind, Formidable, Recharts, xlsx/SheetsJS

## DEPLOYMENT (Docker/Ubuntu method)
TODO: automate more of the deployment in the Dockerfile

1. Clone git repo
```
https://github.com/spiltbeans/paa-invoicing
```

2. Add enviroment variables
```
touch .env && nano .env
```
The following environment variables are required:
```
# config for server
SERVER_MODE=<prod | test>
BYPASS_AUTH=<Bool>
TEST_ORIGIN=<TESTING_URL>
PROD_ORIGIN=<PRODUCTION_URL>
DATA_ORIGIN=<RELATIVE PATH_DATA_PATH>
BASIC_AUTH_USERNAME=<AUTH_USERNAME>
BASIC_AUTH_PASSWORD=<AUTH_PASSWORD
```
3. Build the Next.js project
```
npm run build
```
4. Build and run the Docker container
```
docker-compose build && docker-compose up -d
```
