# NFT Datafeed - NodeJS + Websocket + MongoDB

This backend application is a robust solution combining NodeJS, Websockets, and MongoDB to deliver real-time data feeds for NFTs (Non-Fungible Tokens). In addition to the WebSocket functionality, the repository includes REST APIs for the same endpoints, thereby providing multiple options for interacting with the server.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Environment Variables](#env)
- [API Documentation](#api-documentation)
- [API Endpoints](#api-endpoints)
- [FAQ](#faq)
- [Screenshots](#screenshots)
- [Contact](#contact)

## Features

- **Real-time Data Feed**: Utilize Websockets to receive real-time updates on NFT metrics such as market cap, assets, and floor price.

- **RESTful APIs**: Alongside Websockets, RESTful APIs provide alternative methods for fetching NFT data, ensuring flexibility in integration..

- **MongoDB Integration**: Store and retrieve NFT data efficiently using MongoDB, enabling seamless scalability and data management.

- **Secure**: Both the servers requires `x-api-key` to access the database.

- **Safe**: The Websocket server has two types of endpoint. One is public, and whatever events took place in public room will be emitted to every other connected sockets. Whereas, in private room you can ask any one to join your room-id and only the sockets joined will received or emit messages.

- **Generic error handling**: A generic/central error handler and converter for REST apis.

## Requirements

- NodeJs
- MongoDB Community (locally installed) / MongoDB Atlas URL
- Postman Application / Web

## Installation

To run the application locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/iamvishal-x/nft-datafeed.git
   ```

2. Navigate to the project directory:

   ```bash
   cd nft-datafeed
   ```

3. Install the required npm packages:
   ```bash
   npm install --include=dev
   ```
4. Copy .env.example as .env:
   ```bash
   cp .env.example .env
   ```
5. Configure your environment variables by updating the .env with the necessary values. This step is important as it can affect the app behaviour.

6. Run the backend/server application

   ```bash
   npm run dev
   ```

7. The server should now be running locally. You can access it by navigating to `http://localhost:3000` or the port your provided in your `.env`.

8. I've tried to commented the code thoroughly so most of the things may make sense just by reading the comments.

## Environment Variables

The app needs to be configured before running. \
 **<span style="color:red">Please go through the variables carefully as it affects the behaviour and functionality of the app</span>**. I've also included a .env.example file in the application.

#### Backend

- `MONGO_URI` : Your MongoDB URI. For eg: `mongodb://localhost:27017/bitsCrunch`
- `PORT` : The port you want to run the application on. For eg: `3000`
- `API_KEY` : This allows user the access to the server and database. For eg: `bitsCrunch`
- `SHOULD_MIGRATE_AUTOMATICALLY` : This gives flexibility to the developer if he/she wants to migrate the local raw nft data to the database automatically. Without the data the app won't return anything. Recommended to set this to true. For eg: `false`

## API Documentation

#### REST APIs

The API documentation contains list of available API endpoints and their respective purposes. It has all the required details to execute the API's. The API documentation is published online [here](https://documenter.getpostman.com/view/28011531/2sA3Bj9uSU). You may switch the POSTMAN environment to `No environment` if variables aren't loading.

#### Websocket APIs

Websocket APIs cannot be hosted live via postman so I'm adding a invite link to the postman collection. It has all the messages/body saved in the "saved messages" tab. You just need to pass a value for baseUrl and apiToken variables. [Invite Link](https://www.postman.com/trufflesone/workspace/bitscrunch-assignment/collection/661e2783a2cfb7b123d99b66?action=share&creator=28011531)

Postman collection link: []()

## API Endpoints

Some example endpoints

### REST Endpoints:

#### \*\* Health Check

```http
  HTTP GET /api/health-check
```

```http
Response:

  OK
```

#### \*\* Find by chain id and ethereum address

```http
  HTTP GET /api/v1/:chain_id/:address
```

| Param      | Type     | Description                            | Example Value                                |
| :--------- | :------- | :------------------------------------- | :------------------------------------------- |
| `chain_id` | `string` | Search in a specific chain id          | `1`                                          |
| `address`  | `string` | Search for a specific ethereum address | `0x8d04a8c79ceb0889bdd12acdf3fa9d207ed3ff63` |
|            |

| Headers     | Type     | Description                | Example Value |
| :---------- | :------- | :------------------------- | :------------ |
| `x-api-key` | `string` | Api key for server access. | `bitsCrunch`  |

```http
  Response - JSON:
    {
        "name": "Mothership",
        "image_url": "https://lh3.googleusercontent.com/_gEHk-GA9z9luEiM67WEoUDbf0B89MH7uNY7aN_ReKQu9lbomgiFHotzEvWVq4XGNAU85xsMHEwO_JKg-VVnUSiv=s120",
        "description": "Where there are rivers  there are cities"
    }
```

### Websocket Api:

#### \*\* Find by chain id and ethereum address - PUBLIC

```http
  WS  ws://{server}
```

```http
  Message - JSON:
    {
        "chain_id": "1",
        "address": "0xd654f5d80d8953fee7d0028cd663eb8295f93941"
    }
```

```http
  Response - JSON:
    {
        "name": "Mothership",
        "image_url": "https://lh3.googleusercontent.com/_gEHk-GA9z9luEiM67WEoUDbf0B89MH7uNY7aN_ReKQu9lbomgiFHotzEvWVq4XGNAU85xsMHEwO_JKg-VVnUSiv=s120",
        "description": "Where there are rivers  there are cities"
    }
```

| Headers     | Type     | Description                | Example Value |
| :---------- | :------- | :------------------------- | :------------ |
| `x-api-key` | `string` | Api key for server access. | `bitsCrunch`  |

#### \*\* Get Metrics By Metrics Name - PRIVATE

```http
  WS  ws://{server}/room/:id
```

```http
  Message - JSON:
    {
        "chain_id": "1",
        "address": "0xd654f5d80d8953fee7d0028cd663eb8295f93941",
        "metric_name": "assets"

    }
```

```http
  Response - JSON:
    {
        "metric_name": "assets",
        "value": 3
    }
```

| Headers     | Type     | Description                | Example Value |
| :---------- | :------- | :------------------------- | :------------ |
| `x-api-key` | `string` | Api key for server access. | `bitsCrunch`  |

| Params        | Type            | Description                   | Example Value |
| :------------ | :-------------- | :---------------------------- | :------------ |
| `metric_name` | `string - enum` | Metrics to fetch for the nft. | `assets`      |

## FAQ

1. **Which external libraries I've used?** \
   To speed up development and make the application more user-friendly, I used a few external packages. \
   `Joi`: I've used **JOI** to _validate the data_ coming from the users end. \
   `Express Validation`: I've used **Express Validation** to ensure the data coming from users end validates well. \
    `CORS`: To allow cors.

2. **Have you missed any development point?**\
   No, I instead went ahead and added two additional features - REST Apis and API Key Validation middleware.

## Screenshots

Attaching few screenshots of the postman collection, just for an overview.

- HTTP - Health Check \
  ![homepage](https://github.com/iamvishal-x/nft-datafeed/blob/main/screenshots/http-health-check.png)

- HTTP - Find by chain_id and address \
  ![homepage](https://github.com/iamvishal-x/nft-datafeed/blob/main/screenshots/http-find-by-chain.png)

- HTTP - Forbidden \
  ![homepage](https://github.com/iamvishal-x/nft-datafeed/blob/main/screenshots/http-forbidden.png)

---

- WebSocket - Handshake \
  ![homepage](https://github.com/iamvishal-x/nft-datafeed/blob/main/screenshots/ws-handshake-public.png)
- WebSocket - Get by metric name \
  ![homepage](https://github.com/iamvishal-x/nft-datafeed/blob/main/screenshots/ws-get-by-metric.png)
- WebSocket - Forbidden \
  ![homepage](https://github.com/iamvishal-x/nft-datafeed/blob/main/screenshots/ws-forbidden.png)

## Contact

- [LinkedIn](https://www.linkedin.com/in/vishal-sinha-1044871b8/)
- [Gmail](mailto:vishalsinha37@gmail.com)
- [Resume](https://d383au3bye3rv1.cloudfront.net/media/public/users/2097b676-4bda-46a9-be91-68a52e9b3b7a/resume/2a5ef5e4-3a90-487f-b9d6-e6631e54c6d0.pdf)
