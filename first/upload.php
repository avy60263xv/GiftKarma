<?php

error_reporting(E_ALL);

// we first include the upload class, as we will need it here to deal with the uploaded file
include('class.upload.php');

// set variables
$dir_dest = (isset($_GET['dir']) ? $_GET['dir'] : 'tmp');
$dir_pics = (isset($_GET['pics']) ? $_GET['pics'] : $dir_dest);



include('db.php');
$db = mysqli_select_db($link, "giftkarma_data");
mysqli_query($link, "SET NAMES 'utf8'");
$time = date("Y-m-d h:i:s");
$ip = $_SERVER['REMOTE_ADDR'];
if(count($_POST)>0){
	if($_FILES["pic"]["tmp_name"]!=""){
		$ext=explode(".",$_FILES["pic"]["name"]);
		$f=date("YmdHis").rand(0,99).".".$ext[1];
	}
	$sql ="INSERT INTO gk (pic,age,email,message,HowYouGet,qrcode,ip,time)  VALUES ('$f','$_POST[age]','$_POST[email]','$_POST[message]','$_POST[HowYouGet]','$qrcode','$ip','$time')";  //新增資料
	//mysqli_query($link,$sql)or die ("無法新增".mysql_error()); //執行sql語法	
	if(mysqli_query($link, $sql)){ //執行sql語法	
			header("Refresh:0; url=../story/JSON.php");
			//exit('<script> alert("送出成功!");location.href="http://www.imdr.yuntech.edu.tw/GiftKarma/story/index.php?qrcode='.$qrcode.'";</script>');
			exit('<script> alert("送出成功!");location.href="http://www.imdr.yuntech.edu.tw/GiftKarma/first/index.php?qrcode='.$qrcode.'";</script>');
			
		} else{
			exit('<script> alert("送出失敗!請告知我們錯誤情況!");location.href="mailto:yuntechimdr@gmail.com";</script>');
		}
}
//mysql_close($link); //關閉資料庫連結
//header("location:index.php?qrcode=".$qrcode);  //回index.php

?>


<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<meta http-equiv=content-type content="text/html; charset=UTF-8">
<head>

<body>


<?php

$handle = new upload($_FILES['pic']);
if ($handle->uploaded) {
  $handle->file_new_name_body   = $f;
  $handle->image_resize         = true;
  $handle->image_x              = 600;
  $handle->image_ratio_y        = true;
  $handle->process('../../upload/');
  if ($handle->processed) {
    echo 'image resized';
    $handle->clean();
  } else {
    echo 'error : ' . $handle->error;
  }
}
?>
</body>

</html>
