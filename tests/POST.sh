echo 'Adding new directors using POST:\n\n\n'

echo 'Adding user id 13981351 (not a user yet):\n'

curl \
--request POST \
--header "Content-Type: application/json" \
--data '{"livestream_id":"13981351"}' \
http://localhost:3000/mikestream/directors

echo '\n\n\nTrying to add already existing user:\n'

curl \
--request POST \
--header "Content-Type: application/json" \
--data '{"livestream_id":"13981354"}' \
http://localhost:3000/mikestream/directors

echo '\n\n\nTrying to add user, body format is not json:\n'

curl \
--request POST \
--header "Content-Type: application/xml" \
--data '{"livestream_id":"13981354"}' \
http://localhost:3000/mikestream/directors

echo '\n\n\nAdding valid new user, with favorite camera and favorite movies\n'

curl \
--request POST \
--header "Content-Type: application/json" \
--data '{"livestream_id":"13981344","favorite_camera":"Sony F65","favorite_movies":"Entourage, F&F7"}' \
http://localhost:3000/mikestream/directors
