echo 'Beginning deployment...'
git stash
git fetch
git checkout master
git pull
npm install
cd client
npm install
npm run build
cd ..
NODE_ENV=production nodemon server.js