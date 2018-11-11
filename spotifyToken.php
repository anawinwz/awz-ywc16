<?php
$passkey=@$_POST['passkey'];
if($passkey!="LOCALSPOTIFYAPI") {
    die();
}

$clientId = 'YOUR_CLIENT_ID';
$clientSecret = 'YOUR_CLIENT_SECRET';

$process = curl_init("https://accounts.spotify.com/api/token");
curl_setopt($process, CURLOPT_HTTPHEADER, array("Authorization: Basic ".base64_encode($clientId.":".$clientSecret)));
curl_setopt($process, CURLOPT_TIMEOUT, 30);
curl_setopt($process, CURLOPT_POST, 1);
curl_setopt($process, CURLOPT_POSTFIELDS, 'grant_type=client_credentials');
curl_setopt($process, CURLOPT_RETURNTRANSFER, TRUE);
$return = curl_exec($process);
curl_close($process);

die($return);