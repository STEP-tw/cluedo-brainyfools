#!/usr/bin/env sh

cp .github/.git_pre_push .git/hooks/pre-push
chmod +x .git/hooks/pre-push
git config --local commit.template '.github/.git_commit_template'
npm install
