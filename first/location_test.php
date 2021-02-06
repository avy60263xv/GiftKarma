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
            height: 90%;
        }

        html,
        body {
            height: 90%;
            margin: 0;
            padding: 0;
        }
    </style>
</head>

<body>

    <p id="demo"></p>
    <script>
        var x = document.getElementById("demo");
        getLocation();
        function createCookie(name, value, days) {
            var expires;

            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toGMTString();
            } else {
                expires = "";
            }

            document.cookie = escape(name) + "=" +
                escape(value) + expires + "; path=/";
        }

        function getLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition);
            } else {
                x.innerHTML = "Geolocation is not supported by this browser.";
            }
        }

        function showPosition(position) {
            x.innerHTML = "Latitude: " + position.coords.latitude +
                "<br>Longitude: " + position.coords.longitude;
            createCookie("Latitude", position.coords.latitude);
            createCookie("Longitude", position.coords.longitude);

        }

        function getCookie(name) {
            var value = "; " + document.cookie;
            var parts = value.split("; " + name + "=");
            if (parts.length == 2) return parts.pop().split(";").shift();
        }

        var Latitude1 = getCookie("Latitude")
        var Longitude1 = getCookie("Longitude")
    </script>
    <?php
    echo $_COOKIE["Latitude"];
    echo $_COOKIE["Longitude"];
    ?>

</body>

</html>