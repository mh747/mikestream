echo 'Changing user 13981354\n\n\n'

echo 'Not including auth key in header\n'

curl \
--request PUT \
--header "Content-Type: application/json" \
--data '{"favorite_camera":"iphone camera","favorite_movies":"trailer park boys"}' \
http://localhost:3000/mikestream/directors/13981354 

echo '\n\n\nIncluding wrong auth key in header:\n'

curl \
--request PUT \
--header "Content-Type: application/json" \
--header "Authorization: test" \
--data '{"favorite_camera":"iphone camera","favorite_movies":"trailer park boys"}' \
http://localhost:3000/mikestream/directors/13981354

echo '\n\n\nValid request:\n'

curl \
--request PUT \
--header "Content-Type: application/json" \
--header "Authorization: Bearer 869c276ceb6c5adf1cb78bf8e31f9ed0" \
--data '{"favorite_camera":"iphone camera","favorite_movies":"trailer park boys"}' \
http://localhost:3000/mikestream/directors/13981354

