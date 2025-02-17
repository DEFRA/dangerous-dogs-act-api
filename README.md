# aphw-ddi-api

API to manage CRUD / query functions for dangerous dogs register.

## Prerequisites

- Docker
- Docker Compose

Optional:
- Kubernetes
- Helm

## Running the application

The application is designed to run in containerised environments, using Docker Compose in development and Kubernetes in production.

- A Helm chart is provided for production deployments to Kubernetes.

### Build container image

Container images are built using Docker Compose, with the same images used to run the service with either Docker Compose or Kubernetes.

When using the Docker Compose files in development the local `app` folder will
be mounted on top of the `app` folder within the Docker container, hiding the CSS files that were generated during the Docker build.  For the site to render correctly locally `npm run build` must be run on the host system.


By default, the start script will build (or rebuild) images so there will
rarely be a need to build images manually. However, this can be achieved
through the Docker Compose
[build](https://docs.docker.com/compose/reference/build/) command:

```
# Build container images
docker-compose build
```

### Start

Use Docker Compose to run service locally.

```
docker-compose up
```

## Authentication

You will need to add the base64 encoded public keys from portal and enforcement in `PORTAL_PUBLIC_KEY` and`ENFORCEMENT_PUBLIC_KEY` env variables

To make calls from api to itself (e.g. overnight jobs), you will need to add base64 encoded private and public keys in `API_PUBLIC_KEY` and`API_PRIVATE_KEY` env variables

To setup keys:

```
openssl genrsa -out private_key.pem 2048

openssl rsa -pubout -in private_key.pem -out public_key.pem

openssl base64 -in public_key.pem -out public_key.base64
openssl base64 -in private_key.pem -out private_key.base64
```

## Test structure

The tests have been structured into subfolders of `./test` as per the
[Microservice test approach and repository structure](https://eaflood.atlassian.net/wiki/spaces/FPS/pages/1845396477/Microservice+test+approach+and+repository+structure)

### Running tests

A convenience script is provided to run automated tests in a containerised
environment. This will rebuild images before running tests via docker-compose,
using a combination of `docker-compose.yaml` and `docker-compose.test.yaml`.
The command given to `docker-compose run` may be customised by passing
arguments to the test script.

Examples:

```
# Run all tests
scripts/test

# Run tests with file watch
scripts/test -w
```

# Running a subset of tests outside of Docker
In order to run a single test or group of tests, you can use
```
npm run test <path>/<filename>
```
e.g.
```
npm run test owner.test.js
``` 

However, you will need to copy these lines into your jest.setup.js temporarily, and do not check in any changes to jest.setup.js 

```
process.env.COOKIE_PASSWORD = 'cookiepasswordcookiepasswordcookiepassword'
process.env.AZURE_STORAGE_ACCOUNT_NAME = 'devstoreaccount1'
process.env.AZURE_STORAGE_CONNECTION_STRING = 'UseDevelopmentStorage=true'
process.env.DDI_API_BASE_URL = 'http://localhost/api'
process.env.OS_PLACES_API_BASE_URL = 'http://localhost/os-places'
process.env.OS_PLACES_API_KEY = 'some-api-key'
process.env.POLICE_API_BASE_URL = 'http://localhost/police'
process.env.ROBOT_SHEET_NAME = 'Passed'
process.env.ROBOT_IMPORT_POLICE_API_URL = 'http://localhost/force'
```
 
alternatively add `--setupFilesAfterEnv=<rootDir>/jest.setup.single.js` to your jest run script:

```
npm run test <path>/<filename> -- --setupFilesAfterEnv=<rootDir>/jest.setup.single.js
```

## Swagger 

When running locally, you can view swagger documentation on http://localhost:3001/documentation this is built automatically from the joi schema and Hapi endpoints using Swagger Hapi.

## Licence 

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.

