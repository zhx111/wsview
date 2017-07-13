function setExamine(args){
	$('.content').html(args[0]);
	//生成各个饼图
	var chartOptions = [['normal-request-chart',6,4],['facts-chart',2,2],['evidence-chart',2,3],['reason-chart',4,0],['result-chart',3,6]];
	for (var i = 0; i < chartOptions.length; i++) {
		drawChart([document.getElementById(chartOptions[i][0]),chartOptions[i][1],chartOptions[i][2]]);
	}
    handleEvaluatBtn();
}

//args为表格配置，args:[node,correct，wrong]
function drawChart(args){
	var options={
		series: [
        {
            name:'一般事实',
            type:'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            hoverAnimation:false,
            labelLine:{
            	normal:{
            		show:false
            	}
            },
            data:[
                {
                	value:args[1], 
                	name:'正确',
                	label:{
                		normal:{
                			position:'center',
                			show:true,
                			textStyle: {
	                            fontSize: '10',
	                            fontWeight: 'normal',
	                            color: '#2B82BE'
                        	},
                        	formatter:'{d}%'
                		}
                	},
                	itemStyle:{
                		normal:{
                			color:'#2B82BE'
                		}
                	}
            	},
                {
                	value:args[2], 
                	name:'错误',
                	itemStyle:{
                		normal:{
                			color:'#DBECF8'
                		}
                	},
                	label:{
                		normal:{
                			show:false
                		}
                	}
                }
            ]
        }
    	]
	}
	var Chart = echarts.init(args[0]);
	Chart.setOption(options);
}

// var selectfun = function(){
//     var selectbutton=document.querySelector('#ljpj');
//     selectbutton.addEventListener('click',select); 
//     function select(e){
//         var childs=e.target.parentNode.previousElementSibling.previousElementSibling.childNodes;
//         console.log(childs);
//         childs[0].classList.add('hide');
//         childs[1].classList.remove('hide');
//     }
// }

class Evaluation{
    constructor(node){
        this.container = node;
        this.childs = node.childNodes;
    }
    getShowElement(){
        let showEle = this.container.querySelector('.show');
        return showEle;
    }
    getWaitingElement(){
        let waitingEle = this.container.querySelector('.waiting');
        return waitingEle;
    }
    getWritingElement(){
        let writingEle = this.container.querySelector('.writing');
        return writingEle;
    }
    getWroteElement(){
        let wroteEle = this.container.querySelector('.wrote');
        return wroteEle;
    }
    getWarningElement(){
        let warningEle = this.container.querySelector('.warning');
        return warningEle;
    }
    turnToWriting(){
        let show = this.getShowElement();
        let writing = this.getWritingElement();
        if (show !== writing) {
            this.show(writing);
            this.hide(show);
        }
    }
    turnToWrote(){
        //input框没有输入
        let writing = this.getWritingElement();
        let wrote = this.getWroteElement();
        let show = this.getShowElement();
        let warning = this.getWarningElement();
        let input = writing.firstElementChild;
        let text = input.value;
        if (text.length === 0) {
            warning.innerText = '请输入值！';
            this.show(warning);
            this.addError(writing);
            return false;
        }//input框有输入
        else {
            this.removeError(writing);
            this.hide(warning);
            wrote.innerHTML = text;
            if (show !== wrote) {
                this.show(wrote);
                this.hide(show);
            }
            return true;
        }

    }
    turnToWaiting(){
        let show = this.getShowElement();
        let waiting = this.getWaitingElement();
        if (show !== waiting) {
            this.show(waiting);
            this.hide(show);
        }
    }
    show(node){
        if (node.classList.contains('hide')) {
            node.classList.remove('hide');
            node.classList.add('show');
        }
    }
    hide(node){
        if (node.classList.contains('show')) {
            node.classList.remove('show');
            node.classList.add('hide');
        }
    }
    addError(node){
        if (!node.classList.contains('error')) {
            node.classList.add('error');
        }
    }
    removeError(node){
        if (node.classList.contains('error')) {
            node.classList.remove('error');
        }
    }
    hideAll(nodeList){
        var nodeList = Array.from(nodeList);
        nodeList.forEach((item)=>{
            if (item.classList.contains('show')) {
                item.classList.remove('show');
                item.classList.add('hide');
            }
        });
    }
}

function handleEvaluatBtn(){
    let facts = document.querySelector('.facts');
    facts.addEventListener('click',function(e){
        if (e.target.nodeName === 'BUTTON') {
            let container = e.target.parentNode.previousElementSibling.previousElementSibling;
            let evaluation = new Evaluation(container);
            if (e.target.innerText === '立即评价') {
                evaluation.turnToWriting();
                e.target.innerText = '完成评价';
            }else if (e.target.innerText === '完成评价') {
                let hasWrote = evaluation.turnToWrote();
                if (hasWrote) {
                    e.target.innerText = '修改评价';
                }
            }else if (e.target.innerText === '修改评价') {
                evaluation.turnToWriting();
                e.target.innerText = '完成评价';
            }
        }
    });
}
