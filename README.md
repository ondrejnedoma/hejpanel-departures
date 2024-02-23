# hejpanel-departures
The public transport departures backend component for [K0stka/HejPanel](https://github.com/K0stka/HejPanel)

## Consuming the API
A public instance is hosted on [hejpanel-departures.nedomovi.net](hejpanel-departures.nedomovi.net).

## Self-hosting
Using node and pm2:
```sh
npm i # Project dependencies
npm i -g pm2
pm2 start index.js
pm2 startup # Ensure that processes start again after a system reboot
```