<p align="center">
<img src="https://user-images.githubusercontent.com/408863/195614525-f92a65ad-e380-407d-b6c0-4ecea8763b96.png" data-canonical-src="https://user-images.githubusercontent.com/408863/195614525-f92a65ad-e380-407d-b6c0-4ecea8763b96.png" width="300" height="100" />

---

<p align="center">Server Code for <b>SlashGo</b>
<br/>
The most seamless way to manage intra-organization knowledge through memorable shortlinks</p>
</p>

<p align="center">
<img alt="GitHub" src="https://img.shields.io/github/license/Slash-Go/SlashGoServer">
<img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/Slash-Go/SlashGoServer/Node.js%20CI">  
<img alt="GitHub issues" src="https://img.shields.io/github/issues/Slash-Go/SlashGoServer">
<img alt="Twitter Follow" src="https://img.shields.io/twitter/follow/SlashGoApp">
</p>

---

## How to build/run

```
// Install dependencies
$ npm i

// Edit `config/example-config.json` and save it to `config/config.json`
$ cp config/example-config.json config.json
$ vim config/config.json

// Run migrations
$ npx sequelize-cli db:migrate
$ ROOT_EMAIL=root@slashgo.link ROOT_PASSWORD=admin npx sequelize-cli db:seed:all

// Run Dev Server
$ npm run dev

// Create access token for seed user
$ curl -k -XPOST http://localhost:3000/auth/login -d'{"email": "root@slashgo.link", "password": "admin"}' -H"content-type:application/json"

// Now you can use the accessToken to call other APIs
```
