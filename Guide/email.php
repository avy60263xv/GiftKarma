<?php
$servername = "";
$username = "";
$password = "";
$dbname = "";
$qrcode = $_GET["qrcode"];

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
<script>
function copyToClipboard(element) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val($(element).text()).select();
  document.execCommand("copy");
  $temp.remove();
}
</script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<body>
<form action="email.php?value" method="get">
硬幣編號: <input type="text" name="qrcode"><br>
<input type="submit">
</form>
※此系統已過濾重複及空值信箱<br><br>
<button onclick="copyToClipboard('#p1')">複製信箱</button><br>

<?
$sql = "SELECT DISTINCT email FROM test where qrcode='$qrcode' and qrcode is not null ORDER BY time DESC";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // output data of each row
	echo "硬幣編號: ";
	echo $qrcode;
	echo "<br><br>E-mail:<br>";
	?><p id="p1"><?
    while($row = $result->fetch_assoc()) {
		if(!empty($row["email"])) {
        echo "" .$row["email"]. "";
        echo ",<br>";
		}
    }
} else {
    echo "0 results";
}
$conn->close();
?>
</p>