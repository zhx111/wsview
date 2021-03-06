
var catalogId=[];

var util = {
	formatValue: function(value){
		if (value === null) return;
		var valueArray;
		if(value.indexOf('\n')!=-1){
			valueArray = value.split('\n');
		}else {
			valueArray = value.split(" ");
		}
		if (valueArray[0]==="") {
			valueArray.splice(0,1);
		}
		valueArray = valueArray.map(function(item,index,array){
			 return "<p>"+item+"</p>";
		});
		value = valueArray.reduce(function(perv,cur){
			return perv+cur;
		});
		return value;
	},
	previousAll: function(node){
		if (node === undefined) return;
		var prevSibling = [];
		while((node=node.previousSibling)!==null){
			prevSibling.push(node);
		}
		return prevSibling;
	},
	nextAll: function(node){
		if (node === undefined) return;
		var nextSibling = [];
		while((node=node.nextSibling)!==null){
			nextSibling.push(node);
		}
		return nextSibling;
	},
	replaceNone: function(value){
		if (value ==='none' || value === 'undefined') {
			value = '>'
		}
		return value;
	},
	getComputedWidth: function(node){
		if (node === undefined) return;
		var width = document.defaultView.getComputedStyle(node,null).width;
		width = parseInt(width);
		return width;
	},
	matches: function(elem,selector){
		return elem.matchesSelector(selector);
	},
	store: function(namespace,data) {
		if (arguments.length > 1) {
			return localStorage.setItem(namespace,data);
		} else {
			return localStorage.getItem(namespace) || [];
		}
	},
	addActive:function(node){
		if (node === undefined) return;
		var childs = node.parentNode.childNodes;
		childs.forEach(function(item,index){
			item.classList.remove('active');
		});
		node.classList.add('active');
	}
}

function sendMassage(url,filename,name){
	var url = url;
	url = addURLParam.apply(null,[url,'filename',filename]);
	url = addURLParam.apply(null,[url,'name',name]);

	return new Promise(function(resolve,reject){
		var xhr = new XMLHttpRequest();
		xhr.open('get',url,true);
		xhr.send(null);
		var xmlcontent = null;
		xhr.onreadystatechange = function(){
			if (xhr.readyState === 4) {
				if ((xhr.status>=200&&xhr.status<300)||xhr.status==304){
					resolve([xhr.response,name]);
				}else{
					reject(new Error(this.statusText));
				}
			}
		}
	});
}

function handleNav() {
	var navArray = document.querySelectorAll('.catalog li a');
	navArray.forEach(function(item,index){
		var id = item.id;
		var text = item.innerText;
		item.addEventListener('click',function(e){
			setTitle(text);
			var filename = $('.catalog>li').data('wsfilename');
			if (id === 'examine') {
				//将setExamine方法写在examine.js文件中
				sendMassage('/examine',filename,id).then(setExamine).catch(function(error){console.error(error)});
			}else {
				sendMassage('/ws',filename,id).then(setContent).catch(function(error){console.error(error)});
			}
		},false);
	});
	//单独处理全文节点
	var qw = document.querySelector('.catalog>li');
	var qwContent = document.querySelector('.content-body-main').innerHTML;
	util.store('QW',qwContent);
	qw.addEventListener('click',function(){
		 setTitle('全文');
		 $('.node-info').html('');
		 $('.content-body').removeClass('content-exam');
		 $('.content-body').height(722)
		 .html('<div class="content-body-main format-title">'+util.store('QW')+'</div><div class="items-list"></div>')
		 if (!document.querySelector('.node-info')) {
		 	$('.content-body').after('<div class="node-info"></div>');
		 }
		 $('.content-body-main').height(600);
	});
}

function setContent(args){
	xmlcontent = JSON.parse(args[0]);
	name=args[1];
	var partHtml = util.formatValue(xmlcontent.value);
	$('.content-body').removeClass('content-exam');
	$('.content-body').height(400)
	.html('<div class="content-body-main">'+partHtml+'</div><div class="items-list"></div>')
	 if (!document.querySelector('.node-info')) {
		 	$('.content-body').after('<div class="node-info"></div>');
	}

	$('.content-body-main').height(400);
	if (name === 'WS') {
		$('.content-body-main').addClass('format-title');
	}
	renderSecondLevel(xmlcontent);
}

function setTitle(text){
	var title = document.querySelector('.content-title');
	title.firstElementChild.innerText = text;
	return;
}

handleNav();

function renderSecondLevel(xmlcontent) {
	//console.log(xmlcontent);
	//初始化第二层节点的展示按钮外层框架
	document.querySelector('.node-info').innerHTML='<div class="second-level"></div>';
	var rootHook = document.querySelector('.second-level');
	rootHook.innerHTML='<button class="prev"><</button><div class="list"><div class="track"></div></div><button class="next">></button>';
	var trackList = document.querySelector('.track'); 

	var secCatalogs = Object.keys(xmlcontent);
	if (secCatalogs === null) {
		return;
	}
	//console.log(secCatalogs);
	//初始化第二层节点的数目
	var listNum = 0 ;
	//初始化第二层节点的展示按钮
	for (var i = 2; i < secCatalogs.length; i++) {
		//console.log(xmlcontent[secCatalogs[i]] instanceof Array);
		var xmlSecContent = xmlcontent[secCatalogs[i]];
		//console.log(xmlSecContent);
		if (xmlSecContent instanceof Array) {
			//处理数组的情况
			for (var j = 0; j < xmlSecContent.length; j++) {
				xmlSecContent[j]["nameCN"]+=(j+1);
				var nameCN = xmlSecContent[j]["nameCN"];
				var value = xmlSecContent[j]["value"] || "none";
				var subDivItem=document.createElement('div');
				subDivItem.setAttribute("class","block-demo");
				subDivItem.setAttribute("data-nameCN",nameCN);
				subDivItem.setAttribute("data-value",value);
				subDivItem.setAttribute("data-keyname",secCatalogs[i]);
				var subSpanItem = document.createElement('span');
				subSpanItem.setAttribute("class","block-demo-content");
				subSpanItem.innerHTML=nameCN;
				subDivItem.appendChild(subSpanItem);
				trackList.appendChild(subDivItem);
				listNum++;
			}	
		} else{
			//处理非数组的情况
			var nameCN= xmlSecContent["nameCN"];
			var value = xmlSecContent["value"];
			var subDivItem=document.createElement('div');
			subDivItem.setAttribute("class","block-demo");
			subDivItem.setAttribute("data-nameCN",nameCN);
			subDivItem.setAttribute("data-value",value);
			subDivItem.setAttribute("data-keyname",secCatalogs[i]);
			var subSpanItem = document.createElement('span');
			subSpanItem.setAttribute("class","block-demo-content");
			subSpanItem.innerHTML=nameCN;
			subDivItem.appendChild(subSpanItem);
			trackList.appendChild(subDivItem);
			listNum++;
		}
	}
	//track的宽度为其子块div的宽度*数量
	var trackWidth = listNum>0 ? listNum*140 : 0 ;
	trackList.style.width=trackWidth+"px";
	listNum = listNum>2 ? listNum : 0 ;
	//计算可见的子块div的数量,130为padding值
	var secWidth = util.getComputedWidth(rootHook)-130;
	var viewNum = (secWidth/140).toFixed(0);
	movebuttonListener(listNum,140,viewNum);
	secLevelListener(xmlcontent);
}

function addURLParam(url,name,value) {
	// body...
	url += (url.indexOf('?')===-1 ? "?" : "&");
	url += encodeURIComponent(name) + "=" + encodeURIComponent(value);
	return url;
}

function secLevelListener(xmlcontent){
	$('.block-demo').on('click',function(){
		//给按钮增加active属性
		util.addActive(this);
		//生成侧边弹出框
		var keyName = this.getAttribute("data-keyname");
		var nameCN = this.getAttribute("data-namecn");
		var value = this.getAttribute("data-value");
		renderNodeContent(nameCN,value,2);
		//如果有子节点就生成
		if (hasSub(xmlcontent[keyName])) {
			if (!document.querySelector('.sub-level')) {
				var sub = document.createElement('div');
				sub.setAttribute("class","sub-level");
				document.querySelector('.node-info').appendChild(sub);
			} else{
				var sub = document.querySelector('.sub-level');
				sub.innerHTML = "";
			}
			renderGrandChild(xmlcontent[keyName],3,nameCN);
			subLevelListener();
			//给second-level加入has-next属性
			var secLevel = document.querySelector('.second-level');
			secLevel.classList.add('has-next');
		}
		//把三级以下的所有节点display设为none
		if (document.querySelector('.sub-level')) {
			var childNodes = document.querySelector('.sub-level').childNodes;
			for (var i = 0; i < childNodes.length; i++) {
				childNodes[i].style.display="none";
			}
		}
		var thirdLevel=document.querySelector('#level-3');
		if (thirdLevel) {
			hasSub(xmlcontent[keyName])?thirdLevel.style.display="block":thirdLevel.style.display="none";
		}
		

	});
}

function movebuttonListener(itemNum,moveDis,viewNum){
	$('.next').on('click',function(){
	var track = document.querySelector('.track');
	var initDis = track.style.transform.substring(11,track.style.transform.indexOf("p")) || 0;
	var currentDis=initDis-moveDis;
	//itemNum-viewNum得到隐藏的块的数量
	if (initDis>(-moveDis*(itemNum-viewNum))) {
		//track.style.cssText = "transform:translateX("+currentDis+"px);transition:transform 500ms";
		track.style.webkitTransform = "translateX("+currentDis+"px)";
		track.style.webkitTransition = "transform 500ms";
	}
	});

	$('.prev').on('click',function(){
		var track = document.querySelector('.track');
		var initDis = track.style.transform.substring(11,track.style.transform.indexOf("p")) || 0;
		var currentDis=initDis-(-moveDis);
		if (initDis<0) {
			//track.style.cssText = "transform:translateX("+currentDis+"px);transition:transform 500ms";
			track.style.webkitTransform = "translateX("+currentDis+"px)";
			track.style.webkitTransition = "transform 500ms";
		}
	});
}

function subLevelListener(){
	var subLevel = document.querySelector('.sub-level');
	subLevel.addEventListener("click",subLevelClick
	,false);
}

var subLevelClick=function(event){
	var subLevel = document.querySelector('.sub-level');
	var subLevelChild = subLevel.childNodes;
	if (event.target.nodeName==="SPAN") {
			//拿到现有点击对象
			var clickNode = event.target;
			util.addActive(clickNode);
			//获得该点击对象同一层级的所有节点
			var clickNodeList = event.target.parentNode.parentNode.getElementsByTagName('span');
			clickNodeList = Array.prototype.slice.call(clickNodeList);
			//同名节点，即name属性相同
			var synonymNode = [];
			var clickNodeIndex = 0;
			for (var i = 0; i < clickNodeList.length; i++) {
				if(clickNodeList[i].getAttribute("name")===clickNode.getAttribute("name")){
					synonymNode.push(clickNodeList[i]);
				}
			}
			for (var i = 0; i < synonymNode.length; i++) {
				if(synonymNode[i]===clickNode){
					clickNodeIndex = i;
				}
			}
			//生成侧边弹出框
			var clickName = event.target.getAttribute("name");
			var clickLevel = event.target.parentNode.parentNode.getAttribute("data-level");
			var value = event.target.getAttribute("value");
			renderNodeContent(clickName,value,clickLevel);
			//找到下一层节点
			var clickSubLevel = parseInt(clickLevel)+1;
			var subLevelDiv = document.querySelector('#level-'+clickSubLevel);
			//判断点击对象是否有下一层节点
			//console.log(subLevel.childNodes);
			if(subLevelDiv) {
				//将点击节点所有以下节点都隐藏
				for (var j = clickLevel-2; j < subLevelChild.length; j++) {
					subLevelChild[j].style.display = 'none';
				}
				var count=0;
				for (var i = 0; i < subLevelDiv.childNodes.length; i++) {
					subLevelDiv.childNodes[i].style.display='none';
					subLevelDiv.childNodes[i].firstElementChild.classList.remove('active');
					var fatherName = subLevelDiv.childNodes[i].getAttribute('data-fathername');
					if (fatherName === clickName) {
						if (count++ === clickNodeIndex) {
							subLevelDiv.style.display = 'block';
							subLevelDiv.childNodes[i].style.display='block';
							//生成缩略内容
							if(collapse(subLevelDiv.childNodes[i])) i++;
							
						}
					}
				}
			}
		}
}
function collapse(node){
		if(node === undefined) return false;
		var height = document.defaultView.getComputedStyle(node,null).height;
		if (parseInt(height)>110 && !node.nextElementSibling.getAttribute('class')) {
			node.style.maxHeight = 104+'px';
			node.style.overflow = 'hidden';

			//生成显示隐藏
			var collapse = document.createElement('div');
			collapse.setAttribute('class','collapse');
			collapse.innerHTML = '<a href="#0" id="show">展开全部</a><a href="#0" id="hide">隐藏全部</a>';
			node.nextElementSibling !== null ? node.parentNode.insertBefore(collapse,node.nextElementSibling) : node.parentNode.appendChild(collapse);
			collapse.addEventListener('click',toggle,false);
			return true;
		}else if (node.nextElementSibling && node.nextElementSibling.getAttribute('class')) {
			node.nextElementSibling.style.display = 'block';
			return true;
		}
		else {
			return false;
		}

		function toggle(e){
			if (e.target.nodeName=== 'A') {
				if (e.target.id==='show') {
					e.currentTarget.previousSibling.style.maxHeight = '';
					e.currentTarget.setAttribute('class','uncollapse');
				} else {
					e.currentTarget.previousElementSibling.style.maxHeight = 104+'px';
					e.currentTarget.setAttribute('class','collapse');
				}
			}
		}
}

function hasSub(object){
	var props = Object.keys(object);
	if (props.length > 2) {
		return true;
	}else if (object instanceof Array) {
		return true;
	}else if (props.length == 2 && props[1]!=='value' && props[0] === 'nameCN') {
	 	return true;
	 }else {
		return false;
	}
}

function renderGrandChild(object,layer,name){
	if (hasSub(object)) {
		if (!document.querySelector('#level-'+layer)) {
				var propdiv = document.createElement('div');
				propdiv.setAttribute('id','level-'+layer);
				propdiv.setAttribute('class','sub-level-item');
				propdiv.setAttribute('data-level',layer);
				propdiv.style.display='none';
			}else{
				var propdiv = document.querySelector('#level-'+layer);
			}
			var subdiv = document.createElement('div');
			propdiv.appendChild(subdiv);
		if (object instanceof Array) {
			//数组的情况
			for (var i = 0; i < object.length; i++) {
				var objectName=object[i]["nameCN"];
				if (objectName===name) {
					renderGrandChild(object[i],layer);
				}
			}
		}
		else{
			//对象的情况
			subdiv.setAttribute("data-fathername",object["nameCN"]);
			var props = Object.keys(object);
			var i = object["value"]===undefined ? 1 : 2;
			for ( i ; i < props.length; i++){
				var subObject = object[props[i]];
				if (subObject instanceof Array) {
					//处理数组的情况
					var nameEqual = subObject[0]["nameCN"]===subObject[1]["nameCN"];
					for (var j = 0; j < subObject.length; j++) {
						if (nameEqual) {
							subObject[j]["nameCN"]+=(j+1);
						}
						var value = subObject[j]["value"] || "none";
						var propText = document.createElement('span');
						propText.setAttribute("name",subObject[j]["nameCN"]);
						propText.setAttribute("value",value);
						propText.innerHTML=subObject[j]["nameCN"];
						subdiv.appendChild(propText);
						renderGrandChild(subObject[j],layer+1,subObject[j]["nameCN"]);
					}
				}else{
					var propText = document.createElement('span');
					var value = object[props[i]]["value"] || "none";
					propText.setAttribute("name",object[props[i]]["nameCN"]);
					propText.setAttribute("value",value);
					propText.innerHTML=object[props[i]]["nameCN"];
					subdiv.appendChild(propText);
					renderGrandChild(object[props[i]],layer+1);
				}
			}
			document.querySelector('.sub-level').insertBefore(propdiv,(document.querySelector('.sub-level').firstChild));
		}
	}
	else{
		return;
	}
}

function renderNodeContent(name,value,level){
	//取得已经生成的最高节点层级
	var itemsList=document.querySelector('.items-list');
	var itemsListChild = itemsList.childNodes;
	if (!itemsList.hasChildNodes()) {
		renderFirstNodeContent(name,value,level,itemsList);
	} else {
		var currentNode = itemsListChild[itemsListChild.length-1];
		var currentLevel = currentNode.getAttribute('data-level');
		if (parseInt(currentLevel)===parseInt(level)) {
			renderCurrentNodeContent(name,value,level,currentNode);
		} else if (parseInt(currentLevel) < parseInt(level)) {
			renderNextNodeContent(name,value,level,itemsList);
		} else {
			renderPrevNodeContent(name,value,level,itemsList);
		}
	}
	
}

function initializeNode(name,value,level,fatherNode) {
	var contentDiv=document.createElement('div');
	contentDiv.setAttribute("class","content-node map-item");
	contentDiv.setAttribute("data-level",level);
	value = util.replaceNone(value);
	var valueHtml = util.formatValue(value);
	contentDiv.innerHTML="<p>"+name+"</p>"+valueHtml;
	fatherNode.appendChild(contentDiv);
	onHover(contentDiv);
	return contentDiv;
}

function renderFirstNodeContent(name,value,level,itemsList){
	var contentBody = document.querySelector('.content-body');
	var contentBodyMain = document.querySelector('.content-body-main');
	//将bodymain的宽度缩小
	var contentBodyWidth = util.getComputedWidth(contentBody);
	contentBodyMain.style.width =contentBodyWidth * 0.5 || 400; 
	var contentDiv = initializeNode(name,value,level,itemsList);
	window.setTimeout(function(){
		contentDiv.style.left = contentBodyWidth * 0.5+160;
		contentDiv.style.width = contentBodyWidth*0.5-160-40;
	}.bind(null,contentDiv,contentBodyWidth),100);
	
}

function renderCurrentNodeContent(name,value,level,currentNode){
	value = util.replaceNone(value);
	var valueHtml = util.formatValue(value);
	currentNode.innerHTML = "<p>"+name+"</p>"+valueHtml;

}

function renderNextNodeContent(name,value,level,itemsList){
	var contentBody = document.querySelector('.content-body');
	var contentBodyMain= document.querySelector('.content-body-main');
	var contentBodyWidth = util.getComputedWidth(contentBody);
	var contentDiv = initializeNode(name,value,level,itemsList);
	var defaultLeft = contentBodyWidth * 0.5+160;
	var defaultWidth = contentBodyWidth*0.5-160-40;
	window.setTimeout(function(){
		contentDiv.style.left = defaultLeft;
		contentDiv.style.width = defaultWidth;
	}.bind(null,contentDiv,defaultLeft,defaultWidth),100);


	var prevSibling = util.previousAll(contentDiv);
	for (var i = 0; i < prevSibling.length; i++) {
		length = prevSibling.length;
		var left = parseInt(prevSibling[i].style.left);
		prevSibling[i].style.left = setLeft(length+1,defaultLeft,160,i+1);
	}

	if (parseInt(level)===3) {
		contentBodyMain.style.width = contentBodyWidth * 0.5-80;
		contentBodyMain.style.left = 40;
	}else if (parseInt(level)>3) {
		contentBodyMain.style.width = contentBodyWidth * 0.5-100;
	}
}


function renderPrevNodeContent(name,value,level,itemsList){
	var itemsListChild = itemsList.childNodes;
	//console.log(itemsListChild);
	var contentBody = document.querySelector('.content-body');
	var contentBodyWidth = util.getComputedWidth(contentBody);
	var defaultLeft = contentBodyWidth* 0.5+160;

	for (var i = itemsListChild.length-1; i >=0 ; i--) {
		var length = itemsListChild.length;
		if (itemsListChild[i].getAttribute('data-level')>level) {
			itemsList.removeChild(itemsListChild[i]);
			length--;
		}else{
			itemsListChild[i].style.left = setLeft(length,defaultLeft,160,length-1-i);
			if (parseInt(itemsListChild[i].getAttribute('data-level'))===parseInt(level)) {
				value = util.replaceNone(value);
				var valueHtml = util.formatValue(value);
				itemsListChild[i].innerHTML = "<p>"+name+"</p>"+valueHtml;
			}
		}
	}
}

function setLeft(length,left,spaceWidth,position){
	var length = length;
	var positionArray = [left];
	for(var i = 1;i<length;i++){
		//var leftPos = left - spaceWidth*(i/length-(i-1)/(length-1));
		var leftPos = left - spaceWidth*(i/length);
		positionArray.push(leftPos);
	}
	return positionArray[position];
}

function onHover(node){
	node.addEventListener("mouseover",mainMouseenter,false);
	node.addEventListener("mouseout",mainMouseleave,false);
}

var mainMouseenter = function(event){
	var target = event.currentTarget;
	// console.log(util.nextAll(target));
	var nextSibling = util.nextAll(target);
	if (nextSibling.length>0) {
		var targetWidth = parseInt(nextSibling[0].offsetWidth);
		var length = nextSibling.length;
		var move = setHoverMove(targetWidth,160,length+1);
		for (var i = 0; i < nextSibling.length; i++) {
			var left = nextSibling[i].style.left;
			left = parseInt(left);
			nextSibling[i].style.left = left + (move-0);
		}
	}
}

var mainMouseleave = function(event){
	var target = event.currentTarget;
	//console.log(target);
	var nextSibling = util.nextAll(target);
	if (nextSibling.length>0) {
		var targetWidth = parseInt(nextSibling[0].offsetWidth);
		var length = nextSibling.length;
		var move = setHoverMove(targetWidth,160,length+1);
		for (var i = 0; i < nextSibling.length; i++) {
			var left = nextSibling[i].style.left;
			left = parseInt(left);
			nextSibling[i].style.left = left - move;
		}
	}
}

function setHoverMove(targetWidth,spaceWidth,length){
	var move;
	move = targetWidth - spaceWidth * (1/length);
	//取整
	move = move.toFixed(0);
	return move;

}

