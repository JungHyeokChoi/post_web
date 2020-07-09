set -x

./startFabric.sh
npm install
node enrollAdmin.js
node registerUser.js