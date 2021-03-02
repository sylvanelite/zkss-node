Basic node server


non-html endpoints in main.js

html endpoints in ./html

add html by using submodles

init a submodle:

cd ./html
git submodule add https://github.com/ user / repo / 
git commit -am "adding a submodule"
git push heroku

update:

git submodule foreach git pull origin master
git commit -am "update submodules"
git push heroku

push to github:
git push github master

push to heroku:
git push heroku master

in submodule:
git push origin master

