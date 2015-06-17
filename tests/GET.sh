echo 'GETting all directors:';
curl \
--request GET \
http://localhost:3000/mikestream/directors/
echo '\n\nGETting specific user:';

curl \
--request GET \
http://localhost:3000/mikestream/directors/13981354

