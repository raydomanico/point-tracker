# Roof Tracker

Built for EagleView roof measurement tracking.

## How to install

1. Open Chrome → Extensions → Developer Mode
2. Load unpacked → select this folder

## How to use

1. Copy a Job ID from EagleView
2. Click Add or just press Enter — it auto-fills from clipboard
   (Use Ctr + Shift. + Enter to directly open the reject job form)
3. Fill in points and status
4. Click Confirm — timer resets automatically.
   Click Reject - this will auto-generate your report for you to paste in MS Teams.
5. Use Copy button to paste history into Google Sheets

## Keyboard shortcuts

- Enter — submit job ID
- Click timer — pause/resume(Availabe on WebSite Only)
  -Ctrl + D to display hidden Download Button and Edit/Delete User Info Button
- Ctrl + M - directly opens Google Maps with copied Address
- Ctrl + K - directly opens Connect Explorer with copied Address
- CTrl + Shift + Enter on extension to directly open Reject Form
  -Ctrl + Shift + P to change all status to Passed for fater Editing

## Data storage

All data stored locally in your browser.
No data is sent to any server.

## Features

🗺️ Google Maps — Ctrl+M opens the address from your clipboard directly in Maps
🗺️ Connect Explorer Maps — Ctrl + K opens the address from your clipboard directly in Connect Explorer
📸 Reject flow — Captures a screenshot of the job and copies it with the rejection reason ready to paste in Teams Shortcut:(Ctrl+Shift+Enter)
📋 One-click job logging — copies your Job ID from clipboard automatically when you click Add or Enter.
⏱️ Auto Timer — starts automatically and resets after every job so you can track how long each roof takes(Can be viewed on Export CSV File)
📊 Work history table — logs every job with points, status, time taken, and date(Can be viewed on Export CSV File)
✅ Status tracking — mark jobs as Open, Passed, or Rework directly from the table. Shortcut(Ctrl+Shift+P) will change all status to Passed
📤 Export & Copy — paste your Updated Auto-Genrated TSC and Point History directly into Google Sheets with one click

## Built With

- Vanilla JavaScript
- HTML5 / CSS3
- localStorage API

## Live Demo

[raydomanico.github.io/point-tracker](https://raydomanico.github.io/point-tracker)

## Author

Raymond Domanico
