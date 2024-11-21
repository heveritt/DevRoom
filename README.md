# DevRoom - a room for development

This project is to build a prototype browser based IDE for the Franca language.

## Getting started

This project builds on `node.js` and requires the following additional packages:
- `express`
- `react-scripts`

To get the project and dependecies:
1. Download and install `node.js`
2. Pull the code from this repository
3. Add the additional packages above (detailed in `package.json`) using `npm update`

To start the application (ideally in separate windows):
1. `npm run db` - To run the database, which contains example Franca source.
2. `npm run server` - To run the DevRoom server, which deals with the local fiesystem.
3. `npm run start` - To open a browser session containing the DevRoom client.

## File structure

Besides the usual `node.js` directories, we also have the following:
- `src/` - The DevRoom client source code.
- `server/` - The DevRoom server source code.
- `db/db.json` - The example Franca source.
- `franca/` - The saved Franca source in individual `json` files for source control.
- `generated/` - The generated (transpiled) Javascript code.
 
