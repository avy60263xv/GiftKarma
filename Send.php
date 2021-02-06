<?
	include('db.php');
	$db = mysqli_select_db($link, "giftkarma_data");
	mysqli_query($link, "SET NAMES 'utf8'");
	$path="";
	$qrcode = $_GET["qrcode"];
	$language = $_GET["language"];
	if(empty($qrcode)){
		exit('<script> alert("您必須透過代幣才能傳送資訊!");location.href="first/index.php?language='.$language.'";</script>');
	}
	if(count($_POST)>0){
		$lat = $_POST['lat'];
		$lng = $_POST['lng'];
		$age = $_POST['age'];
		$email = $_POST['email'];
		$message = $_POST['message'];
		$state = $_POST['state'];
		$time = date("Y-m-d h:i:s");
		$ip = $_SERVER['REMOTE_ADDR'];
		if($_FILES["pic"]["tmp_name"]!=""){
		  $ext=explode(".",$_FILES["pic"]["name"]);
		  $f=date("YmdHis").rand(0,99).".".$ext[1];
			move_uploaded_file($_FILES["pic"]["tmp_name"], $path.$f); 
		}
		$sql = "INSERT INTO gk (lat, lng, age, email, message, pic,time,language,state,ip,qrcode) VALUES ('$lat','$lng','$age','$email','$message','$f','$time','$language','$state','$ip','$qrcode')";
		if(mysqli_query($link, $sql)){
			exit('<script> alert("送出成功!");location.href="Result/index.php?qrcode='.$qrcode.'&language='.$language.'";</script>');
		} else{
			exit('<script> alert("送出失敗!請告知我們錯誤情況!");location.href="mailto:yuntechimdr@gmail.com";</script>');
		}
	}
	if(empty($language)){?>
	<script>
	function language_choose() {
		$('#language_choose').modal('show'); 
	}
	</script>
<?}?>

<!DOCTYPE html>
<html lang="tc">
<head>
		<meta name="robots" content="noindex">
		<meta name="googlebot" content="noindex">
		<?php
			if($language=="TW"){?>
				<title>Gift Karma-中文</title>
			<?}else if($language=="EN"){?>
				<title>Gift Karma - English</title>
			<?}else if($language=="ES"){?>
				<title>Gift Karma-Español</title>
		<?}?>
		
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

		<meta name="author" content="http://facebook.com/giftkarmaplan">
		<meta property="article:publisher" content="http://facebook.com/giftkarmaplan"/>
		<meta property="article:author" content="http://facebook.com/giftkarmaplan"/>

		<link rel="shortcut icon" href="/white/images/GK/favicon.ico">

		<meta name="keywords" itemprop="keywords" content="Yuntech,Yun,Tech,國立,雲林,科技,大學,NYUST,雲科大,雲科,National,Yunlin,University,of,Science,and,Technology,數位,媒體,設計,研究,研究所,碩士,博士,創新,媒體,實驗,實驗室,Gift,Karma,Give,Come,On,Com'On,傳善,代幣,Token,台灣,西班牙,荷蘭,傳遞,善意,分享,Share,幫助,Help,影響,Yoga,Karmaner,吳則賢,鄭蕙心,李翊駿,林宇涵,柯雅羚,周玟慧,薛會宇,鄭伊婷,玉部瑋,柯政佑,葉淳禎,吳宗憲,imdr,giftkarma,計畫,IMDR,Innovative,Media,Design,Research"/>

		<meta name="description" content="我們邀請你停下腳步，分享你所經歷的友善緣分，用一顆小小的代幣，發揮你的社會影響力，啟動友善的正循環，讓代幣形成不斷延續的故事鏈吧。"/>
		<meta property="og:description" content="我們邀請你停下腳步，分享你所經歷的友善緣分，用一顆小小的代幣，發揮你的社會影響力，啟動友善的正循環，讓代幣形成不斷延續的故事鏈吧。"/>

		<link rel="profile" href="http://gmpg.org/xfn/11">

		<script>
		  window.dataLayer = window.dataLayer || [];
		  function gtag(){dataLayer.push(arguments);}
		  gtag('js', new Date());

		  gtag('config', 'UA-114836232-1');
		</script>

		<script type="text/javascript">
		  var _paq = _paq || [];
		  _paq.push(["setCookieDomain", "*.imdr.yuntech.edu.tw"]);
		  _paq.push(["setDomains", ["*.imdr.yuntech.edu.tw","*.imdr.yuntech.edu.tw","*.imdr.yuntech.edu.tw","*.imdr.yuntech.edu.tw"]]);
		  _paq.push(['trackPageView']);
		  _paq.push(['enableLinkTracking']);
		  (function() {
			var u="//giftkarma.com/piwik/";
			_paq.push(['setTrackerUrl', u+'piwik.php']);
			_paq.push(['setSiteId', '2']);
			var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
			g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
		  })();
		</script>
		<noscript><p><img src="//giftkarma.com/piwik/piwik.php?idsite=2&rec=1" style="border:0;" alt="" /></p></noscript>

<!--===============================================================================================-->
	<link rel="icon" type="image/png" href="/white/images/GK/favicon.ico"/>
<!--===============================================================================================-->
	<link rel="stylesheet" type="text/css" href="vendor/bootstrap/css/bootstrap.min.css">
<!--===============================================================================================-->
	<link rel="stylesheet" type="text/css" href="fonts/font-awesome-4.7.0/css/font-awesome.min.css">
<!--===============================================================================================-->
	<link rel="stylesheet" type="text/css" href="vendor/animate/animate.css">
<!--===============================================================================================-->
	<link rel="stylesheet" type="text/css" href="vendor/css-hamburgers/hamburgers.min.css">
<!--===============================================================================================-->
	<link rel="stylesheet" type="text/css" href="vendor/select2/select2.min.css">
<!--===============================================================================================-->
	<link rel="stylesheet" type="text/css" href="css/util.css">
	<link rel="stylesheet" type="text/css" href="css/main-form.css">
<!--===============================================================================================-->    

	<style>
       #map {
        height: 300px;
        width: 300px;
		border-radius: 20px;
       }
	</style>
	<script async defer
    src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBfawlpnAEy_uWo7s0TQN4ZoVMIwJFSefw&callback=getLocation">
    </script>
	<style>
	   html,body{
		font-family: 'Times New Roman', '微軟正黑體';
		background-color: : #ffffff;
	   }
	  form{
		font-family: 'Times New Roman', '微軟正黑體';
	  }
      .contact1-pic{
		color: #666666;
	  } 
	  .contact1-pic h3{
		font-size: 2.5vm;
		padding-bottom: 15px;
	  }
	  span.contact1-form-title {
		color: #669933;
	  }
	  span.contact1-form-title h6{
		font-size: 1.5vm;
	  }

	   .map-word h3{
		color: #669933;
		font-size: 2vw;
	   }
	   .Logo{
		width: 50px;
		height: auto;
	   }
       }
	   .contact1-form-title{
		color: #669933;
	   }
	   .contact1-form-title h1{
		   font-family: 'Times New Roman', '微軟正黑體';
		   font-size: 25px;
		   margin-bottom:10px;
	   }
	   .contact1-form-title h6{
		   font-size: 12px;
	   }
	   
	   form{
		color: rgba(102,153,51,0.7);
		font-size: 1.5vw;	
	   }
	   .language-btn{
		margin-bottom: 20px; 
		margin-right:10px;
		background-color: rgba(102,153,51,0.7);
		border: none;
		border-radius: 10px;
		box-shadow:2px 2px 3px  rgba(102,102,102,0.5); 
		padding: 5px;
	   }
	   .language-btn:hover{
		background-color: rgba(102,153,51,1);
	   }
	   .but_En_border{
		border: none;
		border-radius: 10px;
	   }
	   .but_Es_border{
		border: none;
		border-radius: 10px;
	   }
	   .but_Ch_border{
		border: none;
		border-radius: 10px;
	   }
	   .container-contact1-form-btn{
		justify-content:flex-end;
	   }
	   .contact1-form-btn{
		min-width:100px;
	   }
	   .submit-btn{
		margin-top: 20px; 
		background-color: rgba(102,153,51,0.7);
		border: none;
		border-radius: 10px;
		box-shadow:2px 2px 3px  rgba(102,102,102,0.5); 
		padding: 5px;
	   }
	   .submit-btn:hover{
		background-color: rgba(102,153,51,1);
	   }
	   
	   .select_place{
		  cursor: pointer;
		  appearance:none; /*移除箭頭標示*/
		  -moz-appearance:none;
		  -webkit-appearance:none;
		  box-shadow:0px 0px 3px 1px  rgba(102,102,102,0.5); 
		  background: url("white/images/GK/arrow-d.png") no-repeat right center transparent; /*箭頭標示圖案*/
		  border:0px;
		  width:100%;
		  height:30px;
		  margin-top: 10px;
		  padding-left:30px;
		  background-color:#F6F7F7;
		  color:gray;
		  border-radius: 5px;
		  font-size: 18px;
	   }
	   .input1{
		background-color: white;
		radius: 10px;
		box-shadow:0px 0px 3px 1px  rgba(102,102,102,0.5); 
		border: solid 1px rgba(102,153,51,1);
	   }
	   .btn-info{
		background-color:rgba(255,255,255,1);
		border-color:rgba(102,153,51,1);
		color: rgba(102,153,51,1);
	   }
	   .btn-info:hover{
		background-color:rgba(102,153,51,1);
		border-color:rgba(102,153,51,1);
		color: white;
		cursor: pointer;
	   }
	   @media only screen and (max-width: 600px){
		/*   .submit-btn{
				position:absoulate;
				transform: translateX(-100%);
		   }
		   .btn-info{
				position:relative;
				transform: translateX(70%);
		   }*/
	   }
    </style>
</head>
<body <?if(empty($language)){?>onload="language_choose()"<?}?>>
<!-- Modal -->


<div class="modal fade bd-example-modal-lg" id="language_choose" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
        <div class="modal-header">
			<h5 class="modal-title" id="myLargeModalLabel" style="color:#759352;font-size:18px;">Welcome Karmaner <?php echo $qrcode ?>, please choose your language!</h5>
        </div>
		  <div class="modal-body">
			  <div class="container-fluid">
				<div class="row">
					 <div class="row">
						<div style="width:100%">
							<a href="?qrcode=<?php echo $qrcode ?>&language=TW"><img src="/white/images/GK/Taiwan.png" style="width:32.5%;" /></a>
							<a href="?qrcode=<?php echo $qrcode ?>&language=EN"><img src="/white/images/GK/USA.png" style="width:32.5%;" /></a>
							<a href="?qrcode=<?php echo $qrcode ?>&language=ES"><img src="/white/images/GK/Spain.png" style="width:32.5%;" /></a>
						</div>
				  </div>
				</div>
			  </div>
			</div>
    </div>
  </div>
</div>
	<div class="contact1"style="background: -webkit-linear-gradient(left, #72932D, #72932dcc);">
		<div class="container-contact1">

					
			
			<div class="contact1-pic  data-tilt map-word" data-tilt style="text-align:center;">
			 <?php
					if($language=="TW"){?>
						<h3>Karmaner位置</h3>
					<?}else if($language=="EN"){?>
						<h3>Karmaner Location</h3>
					<?}else if($language=="ES"){?>
						<h3>Karmaner Ubicación</h3>
			<?}?>
			 <p id="demo" ></p>
			 <div id="map" ></div>
				<!--img src="images/img-01.png" alt="IMG"
				<button class="contact1-form-btn" onclick="location.href='SQL.php?qrcode=<?=$qrcode?>';" style="margin-left: 50px;">
			<?php
				if($language=="TW"){?>
					<span>
									歷史位置
									<i class="fa fa-long-arrow-right" aria-hidden="true"></i>
								</span>
				<?}else if($language=="EN"){?>
					<span>
									歷史位置
									<i class="fa fa-long-arrow-right" aria-hidden="true"></i>
								</span>
				<?}else if($language=="ES"){?>
					<span>
									歷史位置
									<i class="fa fa-long-arrow-right" aria-hidden="true"></i>
								</span>
			<?}?>
					</button>-->
			</div>
			
			<form class="contact1-form validate-form" enctype="multipart/form-data"  onSubmit="return formSubmit(this);" method="post" id="form1" name="form1">
				<input id="lat2" name="lat" type="hidden"/>
				<input id="lng2" name="lng" type="hidden"/>
			<?php
				if($language=="TW"){?>
				<span class="contact1-form-title">
					<h1><i class="contact1-form-L" style="font-weight:900;">Gift Karma</i> - 傳善計畫</br></h1>
					<h6>以代幣傳遞引發友善的實踐，並創造有溫度的社會連結。</h6>
				</span>
				<?}else if($language=="EN"){?>
					<span class="contact1-form-title">
			<h1 style ="color:#72932D;font-size:20px;">Pay Kindness Forward,<i class="contact1-form-L" style="font-weight:900;"> Gift Karma</i> Project </br></h1>
					<h6 style="font-weight:100;">Making everyday kindness in the world visible. Create
warmth and connection.
</h6>
				</span>
				<?}else if($language=="ES"){?>
					<span class="contact1-form-title">
			<h1 style ="color:#72932D"><i class="contact1-form-L" style="font-weight:900;">Gift Karma</i> - Proyecto</br></h1>
					<h6>Haciendo que la bondad esté más presente en el mundo.</h6>
				</span>
			<?}?>
			
			<?php
				if($language=="TW"){?>
					<button type="button" class="btn btn-primary language-btn" >
					  <a href="/send.php?qrcode=<?php echo $qrcode ?>&language=EN"><font color="#FFFFFF"><div class=" but_En_border"><b style=" padding: 10px; ">English</b></div></font></a>
					</button>
					<button type="button" class="btn btn-primary language-btn" >
					  <a href="/send.php?qrcode=<?php echo $qrcode ?>&language=ES"><font color="#FFFFFF"><div class=" but_Es_border"><b style=" padding: 10px;">Español</b></div></font></a>
					</button>
					
				<?}else if($language=="EN"){?>
					<button type="button" class="btn btn-primary language-btn">
					  <a href="/send.php?qrcode=<?php echo $qrcode ?>&language=ES"><font color="#FFFFFF"><div class=" but_Es_border"><b style=" padding: 10px;">Español</b></div></font></a>
					</button>
					<button type="button" class="btn btn-primary language-btn">
					  <a href="/send.php?qrcode=<?php echo $qrcode ?>&language=TW"><font color="#FFFFFF"><div class=" but_Ch_border"><b style=" padding: 10px;">中文</b></div></font></a>
					</button>
					
				<?}else if($language=="ES"){?>
					<button type="button" class="btn btn-primary language-btn">
					  <a href="/send.php?qrcode=<?php echo $qrcode ?>&language=EN"><font color="#FFFFFF"><div class=" but_En_border"><b style=" padding: 10px;">English</b></div></font></a>
					</button>
					<button type="button" class="btn btn-primary language-btn">
					  <a href="/send.php?qrcode=<?php echo $qrcode ?>&language=TW"><font color="#FFFFFF"><div class=" but_Ch_border"><b style=" padding: 10px;">中文</b></div></a>
					</button>
					
					<?}?>
					<br>
				<!--<?php
					if($language=="TW"){
						echo "現在時間: " . date("h:i:sa");
					}else if($language=="EN"){
						echo "The time is: " . date("h:i:sa");
					}else if($language=="ES"){
						echo "現在時間: " . date("h:i:sa");
				}?>-->
				<h5 style="color:grey; margin-top:10px;">
				<?php
				if($language=="TW"){?>
					您的國籍：
					
				<?}else if($language=="EN"){?>
					What country are you from?
					
				<?}else if($language=="ES"){?>
					¿Cuál es tu país?	
					<?}?>
				</h5>
				<select name="state" class="select_place">
					<option value="AF">Afghanistan</option>
					<option value="AX">Åland Islands</option>
					<option value="AL">Albania</option>
					<option value="DZ">Algeria</option>
					<option value="AS">American Samoa</option>
					<option value="AD">Andorra</option>
					<option value="AO">Angola</option>
					<option value="AI">Anguilla</option>
					<option value="AQ">Antarctica</option>
					<option value="AG">Antigua and Barbuda</option>
					<option value="AR">Argentina</option>
					<option value="AM">Armenia</option>
					<option value="AW">Aruba</option>
					<option value="AU">Australia</option>
					<option value="AT">Austria</option>
					<option value="AZ">Azerbaijan</option>
					<option value="BS">Bahamas</option>
					<option value="BH">Bahrain</option>
					<option value="BD">Bangladesh</option>
					<option value="BB">Barbados</option>
					<option value="BY">Belarus</option>
					<option value="BE">Belgium</option>
					<option value="BZ">Belize</option>
					<option value="BJ">Benin</option>
					<option value="BM">Bermuda</option>
					<option value="BT">Bhutan</option>
					<option value="BO">Bolivia, Plurinational State of</option>
					<option value="BQ">Bonaire, Sint Eustatius and Saba</option>
					<option value="BA">Bosnia and Herzegovina</option>
					<option value="BW">Botswana</option>
					<option value="BV">Bouvet Island</option>
					<option value="BR">Brazil</option>
					<option value="IO">British Indian Ocean Territory</option>
					<option value="BN">Brunei Darussalam</option>
					<option value="BG">Bulgaria</option>
					<option value="BF">Burkina Faso</option>
					<option value="BI">Burundi</option>
					<option value="KH">Cambodia</option>
					<option value="CM">Cameroon</option>
					<option value="CA">Canada</option>
					<option value="CV">Cape Verde</option>
					<option value="KY">Cayman Islands</option>
					<option value="CF">Central African Republic</option>
					<option value="TD">Chad</option>
					<option value="CL">Chile</option>
					<option value="CN">China</option>
					<option value="CX">Christmas Island</option>
					<option value="CC">Cocos (Keeling) Islands</option>
					<option value="CO">Colombia</option>
					<option value="KM">Comoros</option>
					<option value="CG">Congo</option>
					<option value="CD">Congo, the Democratic Republic of the</option>
					<option value="CK">Cook Islands</option>
					<option value="CR">Costa Rica</option>
					<option value="CI">Côte d'Ivoire</option>
					<option value="HR">Croatia</option>
					<option value="CU">Cuba</option>
					<option value="CW">Curaçao</option>
					<option value="CY">Cyprus</option>
					<option value="CZ">Czech Republic</option>
					<option value="DK">Denmark</option>
					<option value="DJ">Djibouti</option>
					<option value="DM">Dominica</option>
					<option value="DO">Dominican Republic</option>
					<option value="EC">Ecuador</option>
					<option value="EG">Egypt</option>
					<option value="SV">El Salvador</option>
					<option value="GQ">Equatorial Guinea</option>
					<option value="ER">Eritrea</option>
					<option value="EE">Estonia</option>
					<option value="ET">Ethiopia</option>
					<option value="FK">Falkland Islands (Malvinas)</option>
					<option value="FO">Faroe Islands</option>
					<option value="FJ">Fiji</option>
					<option value="FI">Finland</option>
					<option value="FR">France</option>
					<option value="GF">French Guiana</option>
					<option value="PF">French Polynesia</option>
					<option value="TF">French Southern Territories</option>
					<option value="GA">Gabon</option>
					<option value="GM">Gambia</option>
					<option value="GE">Georgia</option>
					<option value="DE">Germany</option>
					<option value="GH">Ghana</option>
					<option value="GI">Gibraltar</option>
					<option value="GR">Greece</option>
					<option value="GL">Greenland</option>
					<option value="GD">Grenada</option>
					<option value="GP">Guadeloupe</option>
					<option value="GU">Guam</option>
					<option value="GT">Guatemala</option>
					<option value="GG">Guernsey</option>
					<option value="GN">Guinea</option>
					<option value="GW">Guinea-Bissau</option>
					<option value="GY">Guyana</option>
					<option value="HT">Haiti</option>
					<option value="HM">Heard Island and McDonald Islands</option>
					<option value="VA">Holy See (Vatican City State)</option>
					<option value="HN">Honduras</option>
					<option value="HK">Hong Kong</option>
					<option value="HU">Hungary</option>
					<option value="IS">Iceland</option>
					<option value="IN">India</option>
					<option value="ID">Indonesia</option>
					<option value="IR">Iran, Islamic Republic of</option>
					<option value="IQ">Iraq</option>
					<option value="IE">Ireland</option>
					<option value="IM">Isle of Man</option>
					<option value="IL">Israel</option>
					<option value="IT">Italy</option>
					<option value="JM">Jamaica</option>
					<option value="JP">Japan</option>
					<option value="JE">Jersey</option>
					<option value="JO">Jordan</option>
					<option value="KZ">Kazakhstan</option>
					<option value="KE">Kenya</option>
					<option value="KI">Kiribati</option>
					<option value="KP">Korea, Democratic People's Republic of</option>
					<option value="KR">Korea, Republic of</option>
					<option value="KW">Kuwait</option>
					<option value="KG">Kyrgyzstan</option>
					<option value="LA">Lao People's Democratic Republic</option>
					<option value="LV">Latvia</option>
					<option value="LB">Lebanon</option>
					<option value="LS">Lesotho</option>
					<option value="LR">Liberia</option>
					<option value="LY">Libya</option>
					<option value="LI">Liechtenstein</option>
					<option value="LT">Lithuania</option>
					<option value="LU">Luxembourg</option>
					<option value="MO">Macao</option>
					<option value="MK">Macedonia, the former Yugoslav Republic of</option>
					<option value="MG">Madagascar</option>
					<option value="MW">Malawi</option>
					<option value="MY">Malaysia</option>
					<option value="MV">Maldives</option>
					<option value="ML">Mali</option>
					<option value="MT">Malta</option>
					<option value="MH">Marshall Islands</option>
					<option value="MQ">Martinique</option>
					<option value="MR">Mauritania</option>
					<option value="MU">Mauritius</option>
					<option value="YT">Mayotte</option>
					<option value="MX">Mexico</option>
					<option value="FM">Micronesia, Federated States of</option>
					<option value="MD">Moldova, Republic of</option>
					<option value="MC">Monaco</option>
					<option value="MN">Mongolia</option>
					<option value="ME">Montenegro</option>
					<option value="MS">Montserrat</option>
					<option value="MA">Morocco</option>
					<option value="MZ">Mozambique</option>
					<option value="MM">Myanmar</option>
					<option value="NA">Namibia</option>
					<option value="NR">Nauru</option>
					<option value="NP">Nepal</option>
					<option value="NL">Netherlands</option>
					<option value="NC">New Caledonia</option>
					<option value="NZ">New Zealand</option>
					<option value="NI">Nicaragua</option>
					<option value="NE">Niger</option>
					<option value="NG">Nigeria</option>
					<option value="NU">Niue</option>
					<option value="NF">Norfolk Island</option>
					<option value="MP">Northern Mariana Islands</option>
					<option value="NO">Norway</option>
					<option value="OM">Oman</option>
					<option value="PK">Pakistan</option>
					<option value="PW">Palau</option>
					<option value="PS">Palestinian Territory, Occupied</option>
					<option value="PA">Panama</option>
					<option value="PG">Papua New Guinea</option>
					<option value="PY">Paraguay</option>
					<option value="PE">Peru</option>
					<option value="PH">Philippines</option>
					<option value="PN">Pitcairn</option>
					<option value="PL">Poland</option>
					<option value="PT">Portugal</option>
					<option value="PR">Puerto Rico</option>
					<option value="QA">Qatar</option>
					<option value="RE">Réunion</option>
					<option value="RO">Romania</option>
					<option value="RU">Russian Federation</option>
					<option value="RW">Rwanda</option>
					<option value="BL">Saint Barthélemy</option>
					<option value="SH">Saint Helena, Ascension and Tristan da Cunha</option>
					<option value="KN">Saint Kitts and Nevis</option>
					<option value="LC">Saint Lucia</option>
					<option value="MF">Saint Martin (French part)</option>
					<option value="PM">Saint Pierre and Miquelon</option>
					<option value="VC">Saint Vincent and the Grenadines</option>
					<option value="WS">Samoa</option>
					<option value="SM">San Marino</option>
					<option value="ST">Sao Tome and Principe</option>
					<option value="SA">Saudi Arabia</option>
					<option value="SN">Senegal</option>
					<option value="RS">Serbia</option>
					<option value="SC">Seychelles</option>
					<option value="SL">Sierra Leone</option>
					<option value="SG">Singapore</option>
					<option value="SX">Sint Maarten (Dutch part)</option>
					<option value="SK">Slovakia</option>
					<option value="SI">Slovenia</option>
					<option value="SB">Solomon Islands</option>
					<option value="SO">Somalia</option>
					<option value="ZA">South Africa</option>
					<option value="GS">South Georgia and the South Sandwich Islands</option>
					<option value="SS">South Sudan</option>
					<option value="ES">Spain</option>
					<option value="LK">Sri Lanka</option>
					<option value="SD">Sudan</option>
					<option value="SR">Suriname</option>
					<option value="SJ">Svalbard and Jan Mayen</option>
					<option value="SZ">Swaziland</option>
					<option value="SE">Sweden</option>
					<option value="CH">Switzerland</option>
					<option value="SY">Syrian Arab Republic</option>
					<option value="TW">Taiwan</option>
					<option value="TJ">Tajikistan</option>
					<option value="TZ">Tanzania, United Republic of</option>
					<option value="TH">Thailand</option>
					<option value="TL">Timor-Leste</option>
					<option value="TG">Togo</option>
					<option value="TK">Tokelau</option>
					<option value="TO">Tonga</option>
					<option value="TT">Trinidad and Tobago</option>
					<option value="TN">Tunisia</option>
					<option value="TR">Turkey</option>
					<option value="TM">Turkmenistan</option>
					<option value="TC">Turks and Caicos Islands</option>
					<option value="TV">Tuvalu</option>
					<option value="UG">Uganda</option>
					<option value="UA">Ukraine</option>
					<option value="AE">United Arab Emirates</option>
					<option value="GB">United Kingdom</option>
					<option value="US">United States</option>
					<option value="UM">United States Minor Outlying Islands</option>
					<option value="UY">Uruguay</option>
					<option value="UZ">Uzbekistan</option>
					<option value="VU">Vanuatu</option>
					<option value="VE">Venezuela, Bolivarian Republic of</option>
					<option value="VN">Viet Nam</option>
					<option value="VG">Virgin Islands, British</option>
					<option value="VI">Virgin Islands, U.S.</option>
					<option value="WF">Wallis and Futuna</option>
					<option value="EH">Western Sahara</option>
					<option value="YE">Yemen</option>
					<option value="ZM">Zambia</option>
					<option value="ZW">Zimbabwe</option>
				</select>
				</br></br>
				<div class="wrap-input1 validate-input" data-validate = "Age is required">
					<? if($language=="TW"){?>
						<input class="input1" type="text" name="age" placeholder="年齡">
					<?}else if($language=="EN"){?>
						<input class="input1" type="text" name="age" placeholder="Age"><span style="font-size:16px;color:rgba(102,102,102,0.7);">(approximate - for the sake of our research.Thanks!)</span>
					<?}else if($language=="ES"){?>
						<input class="input1" type="text" name="age" placeholder="Edad">
					<?}?>
					<span class="shadow-input1"></span>
				</div>

				<div class="wrap-input1 validate-input" data-validate = "Valid email is required: ex@abc.xyz">
					<? if($language=="TW"){?>
						<input class="input1" type="text" name="email" id="email" placeholder="信箱">
					<?}else if($language=="EN"){?>
						<input class="input1" type="text" name="email" id="email" placeholder="Email "><span style="font-size:16px;color:rgba(102,102,102,0.7);">(so we can send you a URL to follow the coin’s progress)</span>
					<?}else if($language=="ES"){?>
						<input class="input1" type="text" name="email" id="email" placeholder="Correo electrónico">
					<?}?>
					<span class="shadow-input1"></span>
				</div>


				<div class="wrap-input1 validate-input" data-validate = "Message is required">
					<? if($language=="TW"){?>
						<textarea class="input1" name="message" placeholder="你如何得到這顆代幣？
例如...
今天我的小孩一直哭，怕吵到其他人，這時服務員拿出一本繪本，小朋友就馬上安靜了！真感謝她!"></textarea>
					<?}else if($language=="EN"){?>
						<textarea style="font-size:12px;" class="input1" name="message" placeholder="How did this coin come to you? 
For example … I  was  in difficulty (describe it a bit) and  a  person helped me. Afterward we were chatting and she told me of the project and asked if I’d like to join.
"></textarea>
					<?}else if($language=="ES"){?>
						<textarea style="font-size:12px;" class="input1" name="message" placeholder="¿Cómo ha llegado la moneda hasta ti? 
Por ejemplo…
Me encontraba en una situación difícil (descríbela brevemente) y una persona me ayudó. Después estuvimos hablando, me enseñó el proyecto y me preguntó si me gustaría unirme."></textarea>
					<?}?>
					<span class="shadow-input1"></span>
				</div>
				

				   <label class="btn btn-info upload_btn">
						<input style="display:none; " name="pic" type="file" onchange="readURL(this)" accept="image/*" targetID="preview_progressbarTW_img"/>
						
						<? if($language=="TW"){?>
							<span>
								<i class="fa fa-photo"></i> 選擇照片
							</span>
						<?}else if($language=="EN"){?>
							<span>
								<i class="fa fa-photo"></i> Upload an image
							</span>
						<?}else if($language=="ES"){?>
							<span>
								<i class="fa fa-photo"></i> Sube una imagen
							</span>
						<?}?>
				    </label>

				   <img id="preview_progressbarTW_img" src=" " />

				
				
				<div class="container-contact1-form-btn">
					<button class="submit-btn contact1-form-btn " onclick="formSubmit()";>
					<? if($language=="TW"){?>
						<span>
							送出
							<i class="fa fa-long-arrow-right" aria-hidden="true"></i>
						</span>
					<?}else if($language=="EN"){?>
						<span>
							Send
							<i class="fa fa-long-arrow-right" aria-hidden="true"></i>
						</span>
					<?}else if($language=="ES"){?>
						<span>
							Entregar
							<i class="fa fa-long-arrow-right" aria-hidden="true"></i>
						</span>
					<?}?>
					</button>
								

				</div>
				</form>	

		</div>
	</div>




				<script>
				function formSubmit(){
				var frm = document.forms["form1"];
				var strEmail = document.getElementById("email");

				
					if(frm.age.value == "")
					{
						<? if($language=="TW"){?>
							alert("錯誤: 請填寫年齡!");
						<?}else if($language=="EN"){?>
							alert("Error: Age is null!");
						<?}else if($language=="ES"){?>
							alert("錯誤: 請填寫年齡!");
						<?}?>
						return false;
					}else if(isNaN(frm.age.value)){
						<? if($language=="TW"){?>
							alert("錯誤: 年齡請填半形數字!");
						<?}else if($language=="EN"){?>
							alert("Error: Age is not integer!");
						<?}else if($language=="ES"){?>
							alert("錯誤: 年齡請填半形數字!");
						<?}?>
						return false;
					}
					if(frm.email.value == "")
					{
						<? if($language=="TW"){?>
							alert("錯誤: 請填寫信箱!");
						<?}else if($language=="EN"){?>
							alert("Error: Email is null!");
						<?}else if($language=="ES"){?>
							alert("錯誤: 請填寫信箱!");
						<?}?>
						return false;
					}else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.gk(	frm.email.value))
						  {
							<? if($language=="TW"){?>
							alert("錯誤: 信箱格式錯誤!");
						<?}else if($language=="EN"){?>
							alert("You have entered an invalid email address!");
						<?}else if($language=="ES"){?>
							alert("錯誤: 信箱格式錯誤!");
						<?}?>
							return (false)
						  }
							
					if(frm.message.value == "")
					{
						<? if($language=="TW"){?>
							alert("錯誤: 請填寫建議!");
						<?}else if($language=="EN"){?>
							alert("Error: Message is null!");
						<?}else if($language=="ES"){?>
							alert("Error: please write your advance!");
						<?}?>
						return false;
					}
					if(frm.file.value == "")
					{
						<? if($language=="TW"){?>
							alert("錯誤: 請上傳您眼前的景象(圖片)!");
						<?}else if($language=="EN"){?>
							alert("Error: Image is null!");
						<?}else if($language=="ES"){?>
							alert("錯誤: 請上傳您眼前的景象(圖片)!");
						<?}?>
						return false;
					}
					else{
						document.getElementById("form1").submit();
					}
					
					
				}
				var x = document.getElementById("demo");
				function readURL(input){

				  if(input.files && input.files[0]){
					
					var imageTagID = input.getAttribute("targetID");

					var reader = new FileReader();

					reader.onload = function (e) {

					   var img = document.getElementById(imageTagID);

					   img.setAttribute("src", e.target.result)
					   $("#preview_progressbarTW_img").css({'height':100,'width':100});

					}

					reader.readAsDataURL(input.files[0]);

				  }

				}
				function initMap(position) {
					var LAT =  position.coords.latitude ;
					var LNG =  position.coords.longitude ;
					<? if($language=="TW"){?>
						x.innerHTML="經度: " + LAT.toFixed(3) + " , 緯度: " + LNG.toFixed(3);
					<?}else if($language=="EN"){?>
							x.innerHTML="Lat: " + LAT.toFixed(3) + " , Lng: " + LNG.toFixed(3);
					<?}else if($language=="ES"){?>
							x.innerHTML="Lat: " + LAT.toFixed(3) + " , Lng: " + LNG.toFixed(3);
					<?}?>
						console.log(LAT)
					var uluru =  {lat:  position.coords.latitude, lng:position.coords.longitude};
					var map = new google.maps.Map(document.getElementById('map'), {
					  zoom: 15,
					  center: uluru
					});
					var iconBase = 'https://imdr.yuntech.edu.tw/white/images/GK/gk_location.png';
					var marker = new google.maps.Marker({
					  position: uluru,
					  map: map,
					  icon: iconBase,
					});
					document.getElementById("lat2").value=position.coords.latitude;
					document.getElementById("lng2").value=position.coords.longitude;
				}		
				getLocation(); 
				function getLocation() {
					if (navigator.geolocation) {
						navigator.geolocation.getCurrentPosition(initMap);
					} else { 
						x.innerHTML = "Geolocation is not supported by this browser.";
					}
				}

				</script>
<!--===============================================================================================-->
	<script src="vendor/jquery/jquery-3.2.1.min.js"></script>
<!--===============================================================================================-->
	<script src="vendor/bootstrap/js/popper.js"></script>
	<script src="vendor/bootstrap/js/bootstrap.min.js"></script>
<!--===============================================================================================-->
	<script src="vendor/select2/select2.min.js"></script>
<!--===============================================================================================-->
	<script src="vendor/tilt/tilt.jquery.min.js"></script>
	<!-- Bootstrap core JavaScript -->
    <script src="guide/vendor/jquery/jquery.min.js"></script>
    <script src="guide/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
	
	<script >
	/*	$('.js-tilt').tilt({
			scale: 1.1
		})*/
	</script>

<script async src=""></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '');
</script>


<!--===============================================================================================-->
	<script src="js/main.js"></script>

</body>
</html>
