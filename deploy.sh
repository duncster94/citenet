BRANCH=$1
if ["$BRANCH" = "production"]; then
    echo 'Beginning production deployment...'
    git stash
    git fetch
    git checkout master
    git pull
    npm install
    cd client
    npm install
    npm run build
    cd ..
    NODE_ENV=production pm2 restart app --update-env
else
    echo 'Beginning development deployment...'
    git stash
    git fetch
    git checkout development
    git pull
    npm install
    cd client
    npm install
    cd ..
    NODE_ENV=development npm start
fi