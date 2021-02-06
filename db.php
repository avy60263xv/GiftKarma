<?php
	$servername = "localhost";
	$username = "root";
	$password = "gift123456";
	 
	$link = @mysqli_connect("$servername", "$username", "$password");
	if( !$link ) {
		echo "MySQL 連線失敗";
		return;
	}
  
  $link->set_charset("utf8");

?>