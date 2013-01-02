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
		plotHeight,
		lastFunctionRangeStart = null,
		lastFunctionRangeEnd = null,
		lastFunctionRangeStep = null;

	function getItemCount() {
		var max = 0,
			i;

		for (i = 0; i < data.length; i++) {
			if (data[i].values.length > max) {
				max = data[i].values.length;
			}
		}

		return max;
	}

	function getExtVal(src, cmp) {
		var min = null,
			i;

        for (i = 0; i < src.length; i++) {
            if (
                !isNaN(src[i])
                && (min === null || cmp(src[i], min))
            ) {
                min = src[i];
            }
        }

		return min;
	}

	function getMinVal() {
        var min = null,
            value,
            i;

        for (i = 0; i < data.length; i++) {
            value = getExtVal(data[i].values, function(a, b) { return a < b; });

            if (min === null || value < min) {
                min = value;
            }
        }

		return min;
	}

	function getMaxVal() {
        var max = null,
            value,
            i;

        for (i = 0; i < data.length; i++) {
            value = getExtVal(data[i].values, function(a, b) { return a > b; });

            if (max === null || value > max) {
                max = value;
            }
        }

        return max;
	}

	function getMinSeries() {
		var min = getExtVal(series, function(a, b) { return a < b; });

        if (min !== null) {
            return min;
        }

        return 0;
	}

	function getMaxSeries() {
		var max = getExtVal(series, function(a, b) { return a > b; });

        if (max !== null) {
            return max;
        }

        return data[0].values.length;
	}

	function getRange(minVal, maxVal) {
		var rangeMin = minVal;

		if (maxVal > 10 && rangeMin > 0 && rangeMin < 2) {
			rangeMin = 0;
		}

		return {
			min: rangeMin,
			max: maxVal
		};
	}

	function round(number, decimals) {
		if (typeof(number) !== 'number') {
			return number;
		}

		return number.toFixed(decimals);
	}

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

	PlotJS.prototype.addData = function(values, name, color) {
		if (typeof(values) !== 'object' || values === null) {
			return this;
		}

		if (typeof(values.length) !== 'number') {
			var series = [],
				realItems = [],
				seriesKey;

			for (seriesKey in values) {
				if (parseFloat(seriesKey) + '' === seriesKey) {
					seriesKey = parseFloat(seriesKey);
				}

				series.push(seriesKey);
				realItems.push(values[seriesKey]);
			}

			this.setSeries(series);
			values = realItems;
		}

		data.push({
			values: values,
			name: name || 'Series ' + (data.length + 1),
			color: color || colors[data.length % colors.length]
		});

		return this;
	};

	PlotJS.prototype.addFunction = function(
		fn,
		rangeStart,
		rangeEnd,
		step,
		name,
		color
	) {
		rangeStart = typeof(rangeStart) === 'number' ? rangeStart : lastFunctionRangeStart || 0;
		rangeEnd = typeof(rangeEnd) === 'number' ? rangeEnd : lastFunctionRangeEnd || 100;
		step = typeof(step) === 'number' ? step : lastFunctionRangeStep || 0.1;

		var series = [],
			values = [],
			value,
			x;

		for (x = rangeStart; x < rangeEnd; x += step) {
			value = fn(x);

			series.push(x);

			/*if (isNaN(value)) {
				continue;
			}*/

			values.push(value);
		}

		lastFunctionRangeStart = rangeStart;
		lastFunctionRangeEnd = rangeEnd;
		lastFunctionRangeStep = step;

		return this.setSeries(series).addData(values, name, color);
	};

	PlotJS.prototype.clearData = function() {
		data = [];

		return this;
	};

	PlotJS.prototype.setData = function(values, name, color) {
		this.clearData().addData(values, name, color);

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
                seriesSteps: 10,
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

		if (canvas === null) {
			throw new Error('Canvas element #' + id + ' not found');
		}

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
		var xPos,
			yVal,
			yPos,
			lastDrawnX = null,
			minVal = getMinVal(),
			maxVal = getMaxVal(),
            minSeries = getMinSeries(),
            maxSeries = getMaxSeries(),
			valueRange = getRange(minVal, maxVal),
			seriesRange = {
				min: minSeries,
				max: maxSeries,
				diff: maxSeries - minSeries
			};

		if (options.rangeMin !== null) {
			valueRange.min = options.rangeMin;
		}

		if (options.rangeMax !== null) {
			valueRange.max = options.rangeMax;
		}
        var valDiff = valueRange.max - valueRange.min,
            xStep = plotWidth / (itemCount - 1),
            yStep = valDiff / options.ySteps,
            itemToX = function(item) {
                return item * xStep;
            },
            seriesToX = function(value) {
                return map(
                    value,
                    seriesRange.min,
                    seriesRange.max,
                    0,
                    plotWidth
                );
            },
            valToY = function(value) {
                return map(
                    value,
                    valueRange.min,
                    valueRange.max,
                    0,
                    plotHeight
                );
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
        if (options.drawZeroLine) {
            var zeroLineY = valToY(0),
                zeroLineX = seriesToX(0);

            if (zeroLineY > 0) {
                c.strokeStyle = options.zeroLineStyle;
                c.beginPath();
                c.moveTo(0, zeroLineY);
                c.lineTo(plotWidth, zeroLineY);
                c.closePath();
                c.stroke();
            }

            if (zeroLineX > 0) {
                c.strokeStyle = options.zeroLineStyle;
                c.beginPath();
                c.moveTo(zeroLineX, 0);
                c.lineTo(zeroLineX, plotHeight);
                c.closePath();
                c.stroke();
            }
        }

		// horizontal ticks and labels
		c.strokeStyle = options.axisStyle;
		c.lineWidth = options.axisWidth;

		var seriesStep = seriesRange.diff / options.seriesSteps,
            seriesLabel,
            seriesAlign,
            seriesCounter = 0;

		for (i = seriesRange.min; i <= seriesRange.max; i += seriesStep) {
			xPos = seriesToX(i);

			/*if (
				(lastDrawnX !== null && xPos - lastDrawnX < options.xMinStep)
				&& xVal !== itemCount - 1
			) {
				continue;
			}*/

			c.beginPath();
			c.moveTo(xPos, 0);
			c.lineTo(xPos, options.stepHeight);
			c.closePath();
			c.stroke();

            if (series.length > 0) {
                var seriesVal = round(i, options.seriesDecimals);

                seriesLabel = typeof(series[seriesVal]) !== 'undefined'
                    ? round(series[seriesVal], options.seriesDecimals)
                    : seriesVal;
            } else {
                seriesLabel = i;
            }

            if (seriesCounter == 0) {
                seriesAlign = 'left';
            } else if (seriesCounter == options.seriesSteps) {
                seriesAlign = 'right';
            } else {
                seriesAlign = 'center';
            }

			drawText(
				seriesLabel,
				xPos,
				-options.textPaddingY,
                seriesAlign,
				'top',
				options.axisFont
			);

			lastDrawnX = xPos;
            seriesCounter++;
		}

		// vertical ticks and labels
		for (yVal = valueRange.min; yVal <= valueRange.max; yVal += yStep) {
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
		var xValue,
            yValue,
			i,
			j,
			lastNaN = false,
            lastItem = null;

		for (i = 0; i < data.length; i++) {
			if (data[i].values.length === 0) {
				continue;
			}

			c.strokeStyle = data[i].color;
			c.fillStyle = data[i].color;
			c.beginPath();

			for (j = 0; j < Math.min(data[i].values.length, displayLimit); j++) {
                xValue = series[j];
				yValue = data[i].values[j];

				if (isNaN(yValue)) {
					lastNaN = true;

					continue;
				}

                if (series.length == 0) {
                    xPos = itemToX(j);
                } else {
                    xPos = seriesToX(xValue);
                }

				yPos = valToY(yValue);

				if (lastNaN) {
					c.moveTo(xPos, yPos);
				} else {
					c.lineTo(xPos, yPos);
				}

				if (options.showPoints) {
					c.fillRect(xPos - 1, yPos - 1, 3, 3);
				}

				lastNaN = false;
                lastItem = yValue;
			}

			c.stroke();
		}

		// draw legent if requested
		if (options.drawLegend) {
			for (i = 0; i < data.length; i++) {
				if (data[i].values.length === 0) {
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