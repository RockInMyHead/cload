#!/bin/bash

# Deployment script for Windexs Cloud

SERVER="root@92.51.38.132"
PASSWORD="x5dkf2Dvu2+G+K"

echo "Starting deployment..."

# Extract files
echo "Extracting deployment archive..."
echo "$PASSWORD" | ssh -o StrictHostKeyChecking=no -tt $SERVER "tar -xzf deploy.tar.gz && echo 'Files extracted successfully'"

# Install dependencies
echo "Installing dependencies..."
echo "$PASSWORD" | ssh -o StrictHostKeyChecking=no -tt $SERVER "cd server && npm install && echo 'Dependencies installed successfully'"

# Start the server
echo "Starting the server..."
echo "$PASSWORD" | ssh -o StrictHostKeyChecking=no -tt $SERVER "cd server && npm start" &
echo "Server started successfully"

echo "Deployment completed!"
