#!/bin/zsh

sudo chown -R vscode:vscode node_modules
bun install --frozen-lockfile
echo 'export PATH="/home/vscode/app/node_modules/.bin:$PATH"' >> ~/.zshrc
