# About

Given an Anki deck and some options, this app uses AI to generate a short story that makes use of a random selection of the vocab the user is learning in a foreign language.

This is a frontend-only, SPA version of my previous CLI tool `anki-story-writer`.

# Website

You can access this app at [https://ankistorywriter.fordesoft.com/](https://ankistorywriter.fordesoft.com/)

# Usage
Export an Anki deck's cards into a text file. You can do this in the desktop version of Anki (not AnkiWeb) by clicking `Browse`, then (from the menu) Notes -> Export Notes.  Set the export format to `Notes in Plain Text (.txt)`, and uncheck the box that says `Include HTML and media references`.

That resulting text file should have one card per line, with a tab separating the question and answer.

Then, copy and paste the entire file contents into the vocabulary word section.

# Installation

This is a React app.  To run it locally, run `npm install`, then `npm start`
