# hejpanel-departures
The public transport departures backend component for [K0stka/HejPanel](https://github.com/K0stka/HejPanel)

## Consuming the API
A public instance is hosted on [hejpanel-departures.102.nedomovi.net](https://hejpanel-departures.102.nedomovi.net).

## Self-hosting
Using node and pm2:
```sh
git clone https://github.com/ondrejnedoma/hejpanel-departures
cd hejpanel-departures
npm i
npm i -g pm2
pm2 start index.js --name hejpanel-departures -- -p 3000 # The port is optional and defaults to 42069 if unspecified
pm2 startup # Ensure that processes start again after a system reboot
```