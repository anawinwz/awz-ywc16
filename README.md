# Spotify Insights
My Homework Project for the Final Round audtion of YWC16 (Web Programmer track).  

It fetchs tracks from Spotify and give you an option to filter them based on their Features (`valence`, `danceablility`, `acousticness` and `instrumentalness`).  
From those tracks, you can select one to view its insights (a polar graph representing its Features, and some of interesting numbers/values) or to just listen the track right from the Insights page. 

## Installation Steps
1. Clone these files on a web server which runs PHP and has cURL enabled.
2. `yarn` to install Dev dependencies.
3. Put your credentials (Client ID and Secret) into `spotifyToken.php` (from [Spotify Developers](https://developer.spotify.com/dashboard/applications)).
4. Make a directory named `cachedAnalysis`.
5. Done!

## Disclaimer / Warning
This repo is **NOT** production-ready, here are some reasons:
  - All API connections should be done from Backend.
  - Codes may need refactoring.
 
