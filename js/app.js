(function() {
	'use strict';

	/*
	 * BEGIN CONFIG VARIABLES
	 */

	// Yahoo WOEID code
	// Find your WOEID code at http://zourbuth.com/tools/woeid/
	var woeid = 12774129;
	
	// Your temperature unit measurement
	// 'c' for Celcius, and 'f' for Fahrenheit
	var unit = 'f';

	// Yahoo! query interval (milliseconds)
	var waitBetweenWeatherQueries = 900000;

	// Bitcoin price query interval (milliseconds)
	var waitBetweenBitcoinPriceQueries = 300000;

	// Default zoom level. Transitions from 0.9 to 1.1 (90% to 110%)
	var zoom = 1.0;

	// Locale
	var systemLocale = 'pl';
	
	// Time format from moment library
	var timeFormat = 'LTS';
	
	// Date format from moment library
	var dateFormat = 'LL';
	
	// Should we show BTC
	var showBtc = false;

	/*
	 * END CONFIG VARIABLES
	 */

	moment.locale(systemLocale);

	function resolveTemp(temp) {
		if (unit === 'c' || unit === 'C')
			temp = '' + Math.round((parseInt(temp) - 32) / 1.8);

		return temp;
	}

	function populateCurrent(current) {
		var icon = $('#current .icon');
		var desc = $('#current .desc');
		var temp = $('#current .temp');

		if (icon.length)
			icon.html(icons[current.code]);

		if (desc.length)
			desc.html(current.text);

		if (temp.length)
			temp.html(resolveTemp(current.temp));
	}

	function populateForecast(day, forecast) {
		var forecastElem = '#forecast' + day + ' ';
		var day = $(forecastElem + '.day');
		var icon = $(forecastElem + '.icon');
		var desc = $(forecastElem + '.desc');
		var high = $(forecastElem + '.high');
		var low = $(forecastElem + '.low');

		if (day.length) {
			if (day === 1)
				day.html('Today');
			else
				day.html(forecast.day);
		}

		if (icon.length)
			icon.html(icons[forecast.code]);

		if (desc.length)
			desc.html(forecast.text);

		if (high.length)
			high.html(resolveTemp(forecast.high));

		if (low.length)
			low.html(resolveTemp(forecast.low));
	}

	function queryBtcPrice() {
		$.ajax({
			type: 'GET',
			url: 'https://api.bitcoinaverage.com/ticker/all',
			dataType: 'json'
		}).done(function (result) {
			$('#btcprice').html('BTC Price: $' + result.USD['24h_avg']);
		});
	}

	function queryWeather() {
		$.ajax({
			type: 'GET',
			url: 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%3D' + woeid + '&format=json',
			dataType: 'json'
		}).done(function (result) {
			result = result.query.results.channel.item;

			populateCurrent(result.condition);
			populateForecast(1, result.forecast[0]);
			populateForecast(2, result.forecast[1]);
			populateForecast(3, result.forecast[2]);
			populateForecast(4, result.forecast[3]);
			populateForecast(5, result.forecast[4]);
		});
	}

	$(window).load(function() {
		if ($('#time').length)
			$('#time').html(moment().format(timeFormat));

		if ($('#date').length)
			$('#date').html(moment().format(dateFormat));

		queryWeather();

		if (showBtc) {
			queryBtcPrice();
		}

		setInterval(function() {
			if ($('#time').length)
				$('#time').html(moment().format(timeFormat));

			if ($('#date').length)
				$('#date').html(moment().format(dateFormat));
		}, 1000);

		setInterval(function() {
			queryWeather();
		}, waitBetweenWeatherQueries);

		if (showBtc) {
			setInterval(function() {
				queryBtcPrice();
			}, waitBetweenBitcoinPriceQueries);
		}

		setInterval(function() {
			if (zoom == 1.0)
				zoom = 1.1;
			else if (zoom == 1.1)
				zoom = 0.9;
			else
				zoom = 1.0;
			$('#display').css('zoom', zoom);
		}, 300000);
	});
}());
