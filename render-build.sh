#!/usr/bin/env bash
# Install Chromium
mkdir -p .render/chrome
curl -SL https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -o chrome.deb
dpkg -x chrome.deb .render/chrome/
