
	function reelLeft(){
		 clearInterval(startLeft);
	                    var currentLeftPosY = parseInt($('#reelLeft').css('background-position-y'));

	                    var adjastLeft = currentLeftPosY % coma;
	                    if (adjastLeft < 16 ) {
	                        var adjastPxLeft = coma - adjastLeft - 47 + currentLeftPosY;
	                    } else {
	                        var adjastPxLeft = coma - adjastLeft + 15 + currentLeftPosY;
	                    }
	                    $('#reelLeft').animate({backgroundPositionY:adjastPxLeft+"px"},40,'linear');
	                    leftCheckFlag = 1;
	                   if (centerCheckFlag == 1 && rightCheckFlag == 1) startFlag = 0;
	                    
	}

	function reelCenter(){
		 clearInterval(startCenter);
	                    var currentCenterPosY = parseInt($('#reelCenter').css('background-position-y'));
	                    var adjastCenter = currentCenterPosY % coma
	                    if (adjastCenter < 16 ) {
	                        var adjastPxCenter = coma - adjastCenter - 47 + currentCenterPosY;
	                    } else {
	                        var adjastPxCenter = coma - adjastCenter + 15 + currentCenterPosY;
	                    }
	                    $('#reelCenter').animate({backgroundPositionY:adjastPxCenter+"px"},40,'linear');
	                    centerCheckFlag = 1;
	                    if (leftCheckFlag == 1 && rightCheckFlag == 1) startFlag = 0;
	}

	function reelRight(){
		clearInterval(startRight);
	                    var currentRightPosY = parseInt($('#reelRight').css('background-position-y'));
	                    var adjastRight = currentRightPosY % coma
	                    if (adjastRight < 16 ) {
	                        var adjastPxRight = coma - adjastRight - 47 + currentRightPosY;
	                    } else {
	                        var adjastPxRight = coma - adjastRight + 15 + currentRightPosY;
	                    }
	                    $('#reelRight').animate({backgroundPositionY:adjastPxRight+"px"},40,'linear');
	                    rightCheckFlag = 1;
	                        if (leftCheckFlag == 1 && centerCheckFlag == 1) startFlag = 0;
	}

	function reelSpin(){
		$(function(){
		// アニメーションスピード(px/ミリ秒)
	        if (startFlag == 0) {
	            startFlag = 1;
	            leftCheckFlag = 0;
	            centerCheckFlag = 0;
	            rightCheckFlag = 0;
	            var scrollSpeed = 5;
	            // 画像サイズY軸(px)
	            var imgHeight = 1302;
	            // 画像の初期位置Y軸(px)
	            var leftPosY  = parseInt($('#reelLeft').css('background-position-y'));
	            var centPosY  = parseInt($('#reelCenter').css('background-position-y'));
	            var rightPosY = parseInt($('#reelRight').css('background-position-y'));

	           setTimeout(function(){
	            // ループ処理
	                startLeft = setInterval(function() {
	                // 画像サイズまで移動したら0に戻る
	                    if (leftPosY >= imgHeight) leftPosY = 0;
	                    //scrollSpeed分移動
	                    leftPosY += scrollSpeed;
	                    $('#reelLeft').css("background-position","0 "+leftPosY+"px");
	                }, 1);
	                startCenter = setInterval(function() {
	                    if (centPosY >= imgHeight) centPosY = 0;
	                    centPosY += scrollSpeed;
	                    $('#reelCenter').css("background-position","0 "+centPosY+"px");
	                }, 1);
	                startRight = setInterval(function() {
	                    if (rightPosY >= imgHeight) rightPosY = 0;
	                    rightPosY += scrollSpeed;
	                    $('#reelRight').css("background-position","0 "+rightPosY+"px");
	                }, 1);
	            },1500);
	        }
	    });
	}