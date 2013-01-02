/**
 * PlotJS is a very simple and minimalistic library to plot simple data as
 * line-graphs.
 */
var PlotJS = function() {
	var id,
		series = [],
		data = [],
		title = null,
		colors = ['#F00', '#0F0', '#00F', '#FF0', '#0FF', '#F0F'],
		canvas,
		c,
		width,
		height,
		plotWidth,
		plotHeight;
	
	function getItemCount() {
		var max = 0,
			i;
		
		for (i = 0; i < data.length; i++) {
			if (data[i].items.length > max) {
				max = data[i].items.length;
			}
		}
	
		return max;
	};
	
	function getExtVal(cmp) {
		var min = null,
			i,
			j;
		
		for (i = 0; i < data.length; i++) {
			for (j = 0; j < data[i].items.length; j++) {
				if (min === null || cmp(data[i].items[j], min)) {
					min = data[i].items[j];
				}
			}
		}
	
		return min;
	};
	
	function getMinVal() {
		return getExtVal(function(a, b) { return a < b; });
	};

	function getMaxVal() {
		return getExtVal(function(a, b) { return a > b; });
	};

	function getRange(minVal, maxVal) {
		var rangeMin = minVal,
			rangeMax = maxVal;

		if (rangeMax > 10 && rangeMin > 0 && rangeMin < 2) {
			rangeMin = 0;
		}

		return {
			min: rangeMin,
			max: rangeMax
		};
	}

	function round(number, decimals) {
		if (typeof(number) !== 'number') {
			return number;
		}

		return number.toFixed(decimals);
	};

	function map(x, inMin, inMax, outMin, outMax) {
		return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
	}
		
	var PlotJS = function() {

	};

	PlotJS.prototype.setSeries = function(items) {
		series = items;
		
		return this;
	};

	PlotJS.prototype.getSeries = function() {
		return series;
	};

	PlotJS.prototype.addData = function(items, name, color) {
		if (typeof(items) !== 'object' || items === null) {
			return this;
		}
	
		if (typeof(items.length) !== 'number') {
			var series = [],
				realItems = [],
				seriesKey;
		
			for (seriesKey in items) {
				if (parseFloat(seriesKey) + '' === seriesKey) {
					seriesKey = parseFloat(seriesKey);
				}
				
				series.push(seriesKey);
				realItems.push(items[seriesKey]);
			}
			
			this.setSeries(series);
			items = realItems;
		}
		
		data.push({
			items: items,
			name: name || 'Series ' + (data.length + 1),
			color: color || colors[data.length % colors.length]
		});
		
		return this;
	};

	PlotJS.prototype.clearData = function() {
		data = [];
		
		return this;
	};

	PlotJS.prototype.setData = function(items, name, color) {
		this.clearData().addData(items, name, color);
		
		return this;
	};

	PlotJS.prototype.getData = function() {
		return data;
	};

	PlotJS.prototype.getCanvas = function() {
		return canvas;
	};

	PlotJS.prototype.getContext = function() {
		return c;
	};

	PlotJS.prototype.setTitle = function(newTitle) {
		title = newTitle;
		
		return this;
	};

	PlotJS.prototype.getTitle = function() {
		return title;
	};

	PlotJS.prototype.draw = function(canvasId, options) {
		var baseOptions = {
				paddingLeft: 40,
				paddingBottom: 40,
				paddingRight: 10,
				paddingTop: 10,
				textPaddingX: 4,
				textPaddingY: 4,
				xMinStep: 60,
				seriesDecimals: 0,
				valueDecimals: 0,
				titleTop: 20,
				legendLineWidth: 20,
				legendLineHeight: 20,
				legendTop: 60,
				rangeMin: null,
				rangeMax: null,
				axisStyle: '#333',
				axisWidth: 1,
				axisFont: '12px Arial',
				titleFont: '20px Arial',
				legendFont: '16px Arial',
				titleStyle: '#333',
				bgStyle: 'rgba(255, 255, 255, 255)',
				plotStyle: '#FFF',
				axisTextStyle: '#333',
				zeroLineStyle: '#EEE',
				stepWidth: 4,
				stepHeight: 4,
				ySteps: 5,
				drawZeroLine: true,
				drawLegend: false,
				showPoints: true,
				animate: false,
				animationDuration: 1000
			},
			optionKey;
		
		if (options === null || typeof(options) !== 'object') {
			options = {};
		}
	
		for (optionKey in baseOptions) {
			if (typeof(options[optionKey]) === 'undefined') {
				options[optionKey] = baseOptions[optionKey];
			}
		}
	
		id = canvasId || 'plot';
		canvas = document.getElementById(id);
		c = canvas.getContext('2d');
		width = canvas.width = canvas.offsetWidth;
		height = canvas.height = canvas.offsetHeight;
		plotWidth = width - options.paddingLeft - options.paddingRight;
		plotHeight = height - options.paddingTop - options.paddingBottom;
		
		var itemCount = getItemCount(),
			displayLimit = itemCount;
		
		if (options.animate) {
			if (arguments.length > 2) {
				displayLimit = arguments[2];
			} else {
				displayLimit = 1;
			}
		}
	
		// transform so that plot zero is the image origin and y is flipped
		c.setTransform(
			1,
			0,
			0,
			-1,
			options.paddingLeft + 0.5,
			height - options.paddingBottom + 0.5
		);
		
		// draw entire background
		c.fillStyle = options.bgStyle;
		c.fillRect(-options.paddingLeft, -options.paddingBottom, width, height);
		
		// draw plot background
		c.fillStyle = options.plotStyle;
		c.fillRect(0, 0, plotWidth, plotHeight);
		
		// draw ticks
		var xVal,
			xPos,
			yVal,
			yPos,
			lastDrawnX = null,
			minVal = getMinVal(),
			maxVal = getMaxVal(),
			range = getRange(minVal, maxVal);
	
		if (options.rangeMin !== null) {
			range.min = options.rangeMin;
		}
	
		if (options.rangeMax !== null) {
			range.max = options.rangeMax;
		}
	
		var valDiff = range.max - range.min,
			xStep = plotWidth / (itemCount - 1),
			yStep = valDiff / options.ySteps,
			itemToX = function(item) {
				return item * xStep;
			},
			valToY = function(value) {
				// minVal = 0
				// maxVal = plotHeight
				
				//var calcVal = value - minVal;
				
				//return calcVal * plotHeight / maxVal;
				
				return map(value, range.min, range.max, 0, plotHeight);
		
				/*var negOffset = 0;
				
				if (minVal < 0) {
					negOffset = -minVal * plotHeight / valDiff;
				}
		
				return value * plotHeight / valDiff + negOffset;*/
			},
			drawText = function(text, x, y, align, baseline, font) {
				c.save();
				c.textAlign = align || 'left';
				c.textBaseline = baseline || 'middle';
				c.font = font || '13px Arial';
				c.setTransform(
					1,
					0,
					0,
					1,
					options.paddingLeft + 0.5,
					height - options.paddingBottom + 0.5
				);
				c.fillStyle = options.axisTextStyle;
				c.fillText(text, x, -y);
				c.restore();
			};
		
		// draw zero line if requested
		c.strokeStyle = options.zeroLineStyle;
		c.beginPath();
		c.moveTo(0, valToY(0));
		c.lineTo(plotWidth, valToY(0));
		c.closePath();
		c.stroke();
		
		// horizontal ticks and labels
		c.strokeStyle = options.axisStyle;
		c.lineWidth = options.axisWidth;
		
		for (xVal = 0; xVal < itemCount; xVal++) {
			xPos = itemToX(xVal);
			
			if (lastDrawnX !== null && xPos - lastDrawnX < options.xMinStep) {
				continue;
			}
			
			c.beginPath();
			c.moveTo(xPos, 0);
			c.lineTo(xPos, options.stepHeight);
			c.closePath();
			c.stroke();
			
			drawText(
				typeof(series[xVal]) !== 'undefined'
					? round(series[xVal], options.seriesDecimals)
					: round(xVal, options.seriesDecimals),
				xPos,
				-options.textPaddingY,
				'center',
				'top',
				options.axisFont
			);
			
			lastDrawnX = xPos;
		}
	
		// vertical ticks and labels
		for (yVal = range.min; yVal <= range.max; yVal += yStep) {
			yPos = valToY(yVal);
			
			c.beginPath();
			c.moveTo(0, yPos);
			c.lineTo(options.stepWidth, yPos);
			c.closePath();
			c.stroke();
			
			drawText(
				round(yVal, options.valueDecimals),
				-options.textPaddingX,
				yPos,
				'right',
				'middle',
				options.axisFont
			);
		}
	
		// draw axis lines
		c.strokeStyle = options.axisStyle;
		c.lineWidth = options.axisWidth;
		
		c.beginPath();
		c.moveTo(0, 0);
		c.lineTo(plotWidth, 0);
		c.closePath();
		c.stroke();
		
		c.beginPath();
		c.moveTo(0, 0);
		c.lineTo(0, plotHeight);
		c.closePath();
		c.stroke();
	
		// draw data
		var i,
			j;
	
		for (i = 0; i < data.length; i++) {
			if (data[i].items.length === 0) {
				continue;
			}
		
			//xPos = itemToX(0);
			//yPos = valToY(data[0].items[0]);
			
			c.strokeStyle = data[i].color;
			c.fillStyle = data[i].color;
			c.beginPath();
			//c.moveTo(xPos, yPos);
			
			for (j = 0; j < Math.min(data[i].items.length, displayLimit); j++) {
				xPos = itemToX(j);
				yPos = valToY(data[i].items[j]);
				
				c.lineTo(xPos, yPos);
				
				if (options.showPoints) {
					c.fillRect(xPos - 1, yPos - 1, 3, 3);
				}
			}
			
			c.stroke();
		}
	
		// draw legent if requested
		if (options.drawLegend) {
			for (i = 0; i < data.length; i++) {
				if (data[i].items.length === 0) {
					continue;
				}
			
				xPos = plotWidth - plotWidth / 4;
				yPos = plotHeight - options.legendTop + options.legendLineHeight * i;
			
				c.strokeStyle = data[i].color;
				c.beginPath();
				c.moveTo(xPos, yPos);
				c.lineTo(xPos + options.legendLineWidth, yPos);
				c.stroke();
				
				drawText(
					data[i].name,
					xPos + options.legendLineWidth * 1.25,
					yPos,
					'left',
					'middle',
					options.legendFont
				);
			}
		}
	
		// draw title if available
		if (title !== null) {
			drawText(
				title,
				plotWidth / 2,
				height - options.paddingBottom - options.titleTop,
				'center',
				'top',
				options.titleFont
			);
		}
	
		if (options.animate && displayLimit < itemCount) {
			var self = this;
			
			window.setTimeout(function() {
				self.draw(canvasId, options, displayLimit + 1);
			}, options.animationDuration / itemCount);
		}
		
		return this;
	};

	return new PlotJS;
};