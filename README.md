# PAA INVOICING

> The main goal of this project is to visualize invoicing data from an xlsx file for auditing purposes.

> There were two functional achievements
> 1. Parse xlsx files and create data structures for graph data.
> 2. Utilize graphing libraries to visualize the data.
- - -

## Table of Contents
- [Summary](#summary)
- [Deployment](#deployment)
- [Project Challenges](https://github.com/spiltbeans/paa-invoicing/wiki/Project-Challenges)
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

2. Add environment variables
```
touch .env.local && nano .env.local
```
The following environment variables are required:
```
# config for server
DATA_ORIGIN=<RELATIVE PATH_DATA_PATH>
BASIC_AUTH_USERNAME=<AUTH_USERNAME>
BASIC_AUTH_PASSWORD=<AUTH_PASSWORD>
NEXTAUTH_SECRET=<SECRET_FOR_JWT>
NEXTAUTH_URL=<APPLICATION_URL>
```
3. Add the whitelist file
> the whitelist file is used to tell the system which entries are valid and should be represented on the graphs
```
mkdir src/config/ && touch src/config/whitelist.ts
```
The following exports are required:
```js
type WL = {
	[index: string]: Array<string>
}
export const whitelist: WL = {
	'FullUserName': [
		'FullUserName', 'NickName'
	]
}
export const known_errors: Array<string> = ['some_error']
```

4. Build and run the Docker container
```
docker-compose build && docker-compose up -d
```
