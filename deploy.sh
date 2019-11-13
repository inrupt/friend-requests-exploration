git checkout deploy
git fetch origin
git merge origin/master
npm run build
cd build
ln -s index.html 404.html
cd ..
git add build
git commit --no-verify -am"build"
git push 5apps deploy:master
git checkout -
