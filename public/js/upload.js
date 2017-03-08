jQuery(function() {
		var $ = jQuery, $list = $('#thelist'), $btn = $('#ctlBtn'), state = 'pending', uploader , wsnr;

		uploader = WebUploader.create({

			// 不压缩image
			resize : false,

			// swf文件路径
			swf : 'resources/webuploader/Uploader.swf',

			// 文件接收服务端。
			server : 'http://localhost:3000/upload',

			// 选择文件的按钮。可选。
			// 内部根据当前运行是创建，可能是input元素，也可能是flash.
			pick : '#picker'
		});

		// 当有文件添加进来的时候
		uploader.on('fileQueued', function(file) {
			// $list.append('<div id="' + file.id + '" class="item">'
			// 		+ '<h4 class="info">' + file.name + '</h4>'
			// 		+ '<p class="state">等待上传...</p>' + '</div>');
			if(file.ext!=="xml"){
				//alert("您上传的格式不正确！");
				uploader.removeFile(file,true);
				showErrorType("formatError");
			}else{
				uploader.upload();
				$("#filename").val(file.name);
			}
			//console.log(file);
		});

		uploader.on('uploadSuccess', function(file, response) {
			//$('#' + file.id).find('p.state').text('已上传');
			wsnr=response;
			console.log(wsnr);
			$("#jx").submit();
		});

		uploader.on('uploadError', function(file, reason) {
			//$('#' + file.id).find('p.state').text('上传出错');
			showErrorType('uploadError');
		});

		uploader.on('uploadComplete', function(file) {
			//$('#' + file.id).find('.progress').fadeOut();
		});

		uploader.on('all', function(type) {
			if (type === 'startUpload') {
				state = 'uploading';
			} else if (type === 'stopUpload') {
				state = 'paused';
			} else if (type === 'uploadFinished') {
				state = 'done';
			}

			if (state === 'uploading') {
				$btn.text('暂停上传');
			} else {
				$btn.text('开始上传');
			}
		});

		$btn.on('click', function() {
			if (state === 'uploading') {
				uploader.stop();
			} else {
				uploader.upload();
			}
		});
		var showErrorType = function(type){
			if (type==='formatError') {
				var text = '文件格式不支持，请选择有效的xml文件';
				showError(text);
			}else if(type === 'uploadError'){
				showError('上传出错……请重试');
			}

		}
		var showError = function(text){
			var errorInfo = document.querySelector('.error-info');
			var errorInfoText =document.querySelector('.error-info-text');
			var button = errorInfo.childNodes[1];
			errorInfoText.innerHTML = text;
			errorInfo.style.display = "block";
			button.addEventListener('click',function(event){
				errorInfo.style.display = "none";
			});
		}

		var haloContainer = document.getElementById('haloContainer');
		function start(haloContainer,stateList){
			var currentIndex = 0;

			var intervalID = window.setInterval(function(){
				var state = stateList[currentIndex];
				haloContainer.className = state;
				currentIndex = (currentIndex + 1) % stateList.length;
			},600);
			return intervalID;
		}
		var uploadButton = document.querySelector('.upload-button');
		uploadButton.addEventListener('mouseenter',function(){
			this.intervalID = start(haloContainer,['start','wait','stop']);
		});
		uploadButton.addEventListener('mouseleave',function(){
			window.clearInterval(this.intervalID);
			haloContainer.className = 'stop';
		});
	});



