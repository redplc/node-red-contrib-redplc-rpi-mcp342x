/**
 * Copyright 2021 Ocean (iot.redplc@gmail.com).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use node file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

"use strict";

const fs = require('fs');

/**
 * Outputs error on status and error log.
 */
module.exports.outError = function (node, errShort, errLong) {
	if (node.save_txt === errShort)
		return true;

	node.save_txt = errShort;
	node.status({ fill: "red", shape: "ring", text: errShort });
	node.error(errLong);

	return true;
}

/**
 * Sets node status.
 */
module.exports.setStatus = function (node, txt) {
	if (node.save_txt === txt)
		return;

	node.save_txt = txt;

	node.status({ fill: "blue", shape: "ring", text: txt });
}

const AI_MODE_DISABLED = 99;

/**
 * Sets adc mode.
 */
module.exports.setAdcMode = function (node) {
	switch (node.devtype) {
		case "5": // mcp3425 only 16bit
		case "6": // mcp3426 only 16bit
		case "7": // mcp3427 only 16bit
		case "8": // mcp3428 only 16bit
			if (node.mode0 === 3)
				node.mode0 = 2;
			if (node.mode1 === 3)
				node.mode1 = 2;
			if (node.mode2 === 3)
				node.mode2 = 2;
			if (node.mode3 === 3)
				node.mode3 = 2;
	}

	switch (node.devtype) {
		case "1": // mcp3421 1ch 68H
		case "5": // mcp3425 1ch 68H
			node.mode1 = AI_MODE_DISABLED
			node.mode2 = AI_MODE_DISABLED
			node.mode3 = AI_MODE_DISABLED
			node.devadr = 0;
			break;

		case "2": // mcp3422 2ch 68H
		case "6": // mcp3426 2ch 68H
			node.devadr = 0;
		case "3": // mcp3423 2ch adr
		case "7": // mcp3427 2ch adr
			node.mode2 = AI_MODE_DISABLED
			node.mode3 = AI_MODE_DISABLED
			break;

		case "4": // mcp3424 4ch adr
		case "8": // mcp3428 4ch adr
	}

	node.name = "@" + (0x68 + node.devadr).toString(16).toUpperCase() + "H";
}

/**
 * calc adc value.
 */
module.exports.calcAdcValue = function (node, aival) {
	var aivalret = [];

	switch (node.devtype) {
		case "1": // mcp3421 1ch 68H
		case "5": // mcp3425 1ch 68H
			aivalret.push(Number(aival[0].toFixed(0)) * node.factor0 + node.offset0);
			break;

		case "2": // mcp3422 2ch 68H
		case "3": // mcp3423 2ch adr
		case "6": // mcp3426 2ch 68H
		case "7": // mcp3427 2ch adr
			aivalret.push(Number(aival[0].toFixed(0)) * node.factor0 + node.offset0);
			aivalret.push(Number(aival[1].toFixed(0)) * node.factor1 + node.offset1);
			break;

		case "4": // mcp3424 4ch adr
		case "8": // mcp3428 4ch adr
			aivalret.push(Number(aival[0].toFixed(0)) * node.factor0 + node.offset0);
			aivalret.push(Number(aival[1].toFixed(0)) * node.factor1 + node.offset1);
			aivalret.push(Number(aival[2].toFixed(0)) * node.factor2 + node.offset2);
			aivalret.push(Number(aival[3].toFixed(0)) * node.factor3 + node.offset3);
	}

	return aivalret;
}

/**
 * Check if runs on Raspberry Pi.
 */
function isRaspberryPi()
{
	if (process.platform !== 'linux')
		return false;

	var cpuinfo = fs.readFileSync("/proc/cpuinfo").toString();

	if (cpuinfo.indexOf(": BCM") === -1)
		return false;

	return true;
}

/**
 * Check for Raspberry Pi, if matchs loads hardware driver module.
 */
module.exports.LoadModule = function (module) {
	try {
		if (!isRaspberryPi())
			return;
		return require("./" + module);
	}
	catch (e) { console.log(e); }
	return undefined;
}
