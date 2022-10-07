# SlashGo Server

## How to run

```
// Install dependencies
$ npm i

// Edit `config/example-config.json` and save it to `config/config.json`
$ cp config/example-config.json config.json
$ vim config/config.json

// Run migrations
$ npx sequelize-cli db:migrate
$ npx sequelize-cli db:seed:all

// Run Dev Server
$ npm run dev

// Create access token for seed user
$ curl -k -XPOST http://localhost:3000/auth/login -d'{"email": "root@slashgo.link", "password": "admin"}' -H"content-type:application/json"

// Now you can use the accessToken to call other APIs
```
