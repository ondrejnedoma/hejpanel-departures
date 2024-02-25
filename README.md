# hejpanel-departures
The public transport departures backend component for [K0stka/HejPanel](https://github.com/K0stka/HejPanel)

## Consuming the API
A public instance is hosted on [hejpanel-departures.102.nedomovi.net](https://hejpanel-departures.102.nedomovi.net).

## Self-hosting
Using node and pm2:
```sh
npm i # Project dependencies
npm i -g pm2
pm2 start index.js --name hejpanel-departures
pm2 startup # Ensure that processes start again after a system reboot
```
You will now have a server running on port 42069. You may redirect it using a reverse proxy like nginx.