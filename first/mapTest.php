<!DOCTYPE html>

<html>

<head>
    <title>Gift Karma</title>
    <link rel="Shortcut Icon" type="image/x-icon" href="../icon.ico" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta charset="utf-8">
    <link rel="stylesheet" type="text/css" href="first.css" charset="utf-8" />
    <link rel="stylesheet" href="../css/font-awesome-4.7.0/css/font-awesome.min.css" />
    <script src="../vendor/jquery/jquery-3.2.1.min.js"></script>
    <script src="../vendor/jRange-master/jquery.range.js"></script>
    <link rel="stylesheet" href="../vendor/jRange-master/jquery.range.css" />

    <link rel="stylesheet" href="//apps.bdimg.com/libs/jqueryui/1.10.4/css/jquery-ui.min.css">
    <script src="//apps.bdimg.com/libs/jquery/1.10.2/jquery.min.js"></script>
    <script src="//apps.bdimg.com/libs/jqueryui/1.10.4/jquery-ui.min.js"></script>
    <script src="main.js"></script>
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no">
    <style>
        #map {
            height: 100%;
        }

        html,
        body {
            height: 90%;
            margin: 0;
            padding: 0;
        }
    </style>
</head>

<?php
function array2csv(array &$array)
{
    if (count($array) == 0) {
        return null;
    }
    ob_start();
    $df = fopen("output.csv", 'w');
    fputcsv($df, array_keys(reset($array)));
    foreach ($array as $row) {
        fputcsv($df, $row);
    }
    fclose($df);
    return ob_get_clean();
}
include('db.php');
$db = mysqli_select_db($link, "giftkarma_data");
mysqli_query($link, "SET NAMES 'utf8'");
$query = "SELECT * FROM gk";
$result = mysqli_query($link, $query);
$num = mysqli_num_rows($result);
$output_array = array();
$output_array_index = 0;
for ($i = 0; $i < $num; $i++) {
    $row[$i] = mysqli_fetch_array($result);
    if ($row[$i][1] != "0.000000") {
        #echo $row[$i][11] . " " . $row[$i][1] . " " . $row[$i][2] . "<br/>";
        $output_array[$output_array_index][0] = $row[$i][11];
        $output_array[$output_array_index][1] = $row[$i][1];
        $output_array[$output_array_index][2] = $row[$i][2];
        $output_array[$output_array_index][3] = $row[$i][0];
        $output_array_index += 1;
    }
}
array2csv($output_array)
?>

<body>
    <div id="map"></div>

    <script>
        function processData(allText) {
            var allTextLines = allText.split(/\r\n|\n/);
            var headers = allTextLines[0].split(',');
            var lines = [];

            for (var i = 1; i < allTextLines.length; i++) {
                var data = allTextLines[i].split(',');
                if (data.length == headers.length) {
                    var tarr = [];
                    for (var j = 0; j < headers.length; j++) {
                        if (j == 0)
                            tarr.push(data[j]);
                        else
                            tarr.push((parseFloat(data[j])));
                    }
                    lines.push(tarr);
                }
            }
            return lines
        }
        var map

        function initMap() {
            map = new google.maps.Map(document.getElementById('map'), {
                zoom: 15,
                center: {
                    lat: 23.69,
                    lng: 120.53
                }
            });
            $.ajax({
                type: "GET",
                url: "output.csv",
                dataType: "text",
                success: function(data) {
                    let lines
                    lines = processData(data);
                    call_map(lines)
                }
            });

        }

        function call_map(lines) {
            qrcode = []
            for (var i = 0; i < lines.length; i++) {
                qrcode[i] = lines[i][0]
            }
            qrcode = [...new Set(qrcode)]
            process_lines = []
            qrcode.forEach(element => {
                let mark_size = 1
                var temp_array = [0, 0, 0, 0, 0]
                for (var i = 0; i < lines.length; i++) {
                    if (lines[i][0] == element) {
                        mark_size += 1
                        if (lines[i][3] > temp_array[3])
                            temp_array = lines[i]
                    }
                }
                temp_array[4] = mark_size
                process_lines.push(temp_array)
            });


            function setMarkers(map, lines) {
                /*MAP地圖圖標位置*/
                var image = {
                    url: 'img/pin.png',
                    scaledSize: new google.maps.Size(50, 50),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(0, 32)
                };
                var shape = {
                    coords: [1, 1, 1, 20, 18, 20, 18, 1],
                    type: 'poly'
                };
				console.log(lines)
                for (var i = 0; i < lines.length; i++) {
                    var beach = lines[i];
					
					var icon_size = 5+beach[4]*9
					if(icon_size>50)
						icon_size = 50
                    var image = {
                        url: 'icon2.png',
                        scaledSize: new google.maps.Size(icon_size, icon_size),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(0, 32)
                    };
                    
                    var marker = new google.maps.Marker({
                        position: {
                            lat: beach[1],
                            lng: beach[2]
                        },
                        map: map,
                        icon: image,
                        shape: shape,
                        title: beach[0],
                        zIndex: beach[3],
                        url: `https://www.imdr.yuntech.edu.tw/GiftKarma/story/index.php?qrcode=${beach[0]}`
                    });
                    google.maps.event.addListener(marker, 'click', function() {
                        window.location.href = this.url;
                    });
                }

            }
            setMarkers(map, process_lines)
        }
    </script>
    <script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAHiBEZZQAHHovO1pmQxYOoDnFIF5tco6Y&callback=initMap">
    </script>

</body>

</html>