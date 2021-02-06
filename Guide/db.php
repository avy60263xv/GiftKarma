<?php
	$servername = "localhost";
	$username = "root";
	$password = "";

	$link = @mysqli_connect("$servername", "$username", "$password");
	if( !$link ) {
		echo "MySQL 連線失敗";
		return;
	}

  $link->set_charset("utf8");

?>
