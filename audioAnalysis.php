<?php
$trackId=@$_GET['trackId'];
if(empty($trackId) || !@preg_match("/^[0-9a-zA-Z]+$/",$trackId) || !isset($_SERVER['HTTP_AUTHORIZATION'])) {
	@header_remove("Cache-Control");
	@header("HTTP/1.1 404 Not Found");
	die();
}

$dataFilename = "cachedAnalysis/".$trackId.".json";
if(@file_exists($dataFilename)) {
	die( @file_get_contents($dataFilename) );
}

$process = curl_init("https://api.spotify.com/v1/audio-analysis/".$trackId);
curl_setopt($process, CURLOPT_HTTPHEADER, array("Authorization: ".$_SERVER['HTTP_AUTHORIZATION']));
curl_setopt($process, CURLOPT_TIMEOUT, 30);
curl_setopt($process, CURLOPT_RETURNTRANSFER, TRUE);
curl_setopt($process, CURLOPT_CONNECTTIMEOUT, 30); 
$return = curl_exec($process);
curl_close($process);

try{
		$json = json_decode($return, true);
		if(@$json['track']) {
			$file = fopen($dataFilename, "w");
			fwrite($file, $return);
			fclose($file);
		} else {
			@header("HTTP/1.1 504 Gateway Timeout");
		}
		die($return);
}catch(Exception $e) {
	die($return);
}