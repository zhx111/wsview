function setExamine(args){
	$('.content').html(args[0]);
	//生成各个饼图
	var chartOptions = [['normal-request-chart',6,4],['facts-chart',2,2],['evidence-chart',2,3],['reason-chart',4,0],['result-chart',3,6]];
	for (var i = 0; i < chartOptions.length; i++) {
		drawChart([document.getElementById(chartOptions[i][0]),chartOptions[i][1],chartOptions[i][2]]);
	}
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