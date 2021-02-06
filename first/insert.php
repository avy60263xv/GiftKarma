<?

include('db.php');
$db = mysqli_select_db($link, "giftkarma_data");
mysqli_query($link, "SET NAMES 'utf8'");
$qrcode = $_GET['qrcode'];
$HowYouGet = $_POST[HowYouGet];
$age = $_POST['age'];
$email = $_POST['email'];
$message = $_POST['message'];
$pic = $_POST['pic'];
$path="upload/";
date_default_timezone_set("Asia/Taipei");
$time = date("Y-m-d h:i:s");
$ip = $_SERVER['REMOTE_ADDR'];
if(count($_POST)>0){
	if($_FILES["pic"]["tmp_name"]!=""){
		$ext=explode(".",$_FILES["pic"]["name"]);
		$f=date("YmdHis").rand(0,99).".".$ext[1];
		move_uploaded_file($_FILES["pic"]["tmp_name"], $path.$f);  //将上传的文件移动到新位置
	}
	$sql ="INSERT INTO gk (pic,age,email,message,HowYouGet,qrcode,ip,time)  VALUES ('$f','$_POST[age]','$_POST[email]','$_POST[message]','$_POST[HowYouGet]','$qrcode','$ip','$time')";  //新增資料
	//mysqli_query($link,$sql)or die ("無法新增".mysql_error()); //執行sql語法	
	if(mysqli_query($link, $sql)){ //執行sql語法
			//header("Refresh:0; url=../story/JSON.php");
			//exit('<script> alert("送出成功!");location.href="http://www.imdr.yuntech.edu.tw/GiftKarma/first/index.php?qrcode='.$qrcode.'";</script>');
			
		} else{
			exit('<script> alert("送出失敗!請告知我們錯誤情況!");location.href="mailto:yuntechimdr@gmail.com";</script>');
		}
}
//mysql_close($link); //關閉資料庫連結
//header("location:index.php?qrcode=".$qrcode);  //回index.php
?>
<html>
<body>
	<?php echo $qrcode; ?>
</body>
</html>