<!DOCTYPE html>
<?php
$link = @mysqli_connect("localhost","root","gift123456");
$db = mysqli_select_db($link,"giftkarma_data");
if (mysqli_connect_errno())
{
echo "Failed to connect to MySQL: " . mysqli_connect_error();
}
header("Content-Type:text/html; charset=utf-8");

$sql="select count('id') from gk";
$result=mysqli_query($link,$sql);
$row=mysqli_fetch_array($result);
$qrcode = $_GET["qrcode"];
$lat[] = $row['lat'];
$lng[] = $row['lng'];
$num[] = $row['id'];
$rs = "select lat,lng from gk where qrcode ='$qrcode' and qrcode is not null and lat != 0 and lng != 0 ";

$result2=mysqli_query($link,$rs);
while($row2=mysqli_fetch_assoc($result2)){
	$lat2[]= $row2['lat'];
	$lng2[]= $row2['lng'];
}

?>
<html>
  <head>
	<meta name="robots" content="noindex">
	<meta name="googlebot" content="noindex">
    <title>硬幣路徑</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta charset="utf-8">
    <style>
      /* Always set the map height explicitly to define the size of the div
       * element that contains the map. */
      #map {
        height: 100%;
      }
      /* Optional: Makes the sample page fill the window. */
      html, body {
        height: 100%;
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
	var map;
	var sqlLat =<?=json_encode($lat2)?>;
	var sqlLng =<?=json_encode($lng2)?>;
	var firlat = sqlLat[0];
	var firlng = sqlLng[0];
	
	var llat = sqlLat.length;
	var llng = sqlLat.length;
	var laslat = sqlLat[llat-1];
	var laslng = sqlLng[llng-1];
	console.log(firlat);
	console.log(firlng);
	console.log(llat);
	console.log(llng);
	console.log(laslat);
	console.log(laslng);
	
	var uluru =  {lat:  position.coords.latitude, lng:position.coords.longitude};
      function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 10,
          center: {lat: parseFloat(laslat), lng: parseFloat(laslng)},
          mapTypeId: 'roadmap'
        });

        var iconBase = 'https://imdr.yuntech.edu.tw/white/images/GK/';
        var iconBase2 = 'https://imdr.yuntech.edu.tw/white/images/GK/Start06.png';
        var iconBase3 = 'https://imdr.yuntech.edu.tw/white/images/GK/New05.png';
        var icons = {
          gk: {
            icon: iconBase + 'gk_location.png'
          },
        };

        var features = [];
        for (var i = 1; i < sqlLat.length-1; i++) {
			features.push({
				position: new google.maps.LatLng(parseFloat(sqlLat[i]), parseFloat(sqlLng[i])),
				type: 'gk'
		});
		};
		
		console.log(features);

        // Create markers.
        features.forEach(function(feature) {
          var marker = new google.maps.Marker({
            position: feature.position,
            icon: icons[feature.type].icon,
            map: map
          });
		   var marker2 = new google.maps.Marker({
			position: {lat: parseFloat(firlat), lng: parseFloat(firlng)},
            icon: iconBase2,
            map: map
          });
		   var marker3 = new google.maps.Marker({
			position: {lat: parseFloat(laslat), lng: parseFloat(laslng)},
            icon: iconBase3,
            map: map
          });
        });
      }
    </script>
    <script async defer
    src="https://maps.googleapis.com">
    </script>
  </body>
</html>