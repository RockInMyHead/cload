#!/bin/bash
echo 'x5dkf2Dvu2+G+K' | ssh -o StrictHostKeyChecking=no root@92.51.38.132 << 'REMOTE_EOF'
cd server
pkill -f node
sleep 2
tar -xzf ../build-update.tar.gz
node index.js &
echo "Server restarted"
REMOTE_EOF
