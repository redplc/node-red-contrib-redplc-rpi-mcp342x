/**
 * Copyright 2021 Ocean (iot.redplc@gmail.com).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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

module.exports = function(RED) {
	"use strict";

	const syslib = require('./lib/syslib.js');
	const sysmodule = syslib.LoadModule("rpi_mcp342x.node");

    RED.nodes.registerType("mcp342x", function(n) {
		var node = this;
		RED.nodes.createNode(node, n);

		node.devtype = n.devtype;
		node.devadr = parseInt(n.devadr);

		node.mode0 = parseInt(n.mode0);
		node.mode1 = parseInt(n.mode1);
		node.mode2 = parseInt(n.mode2);
		node.mode3 = parseInt(n.mode3);

		node.gain0 = parseInt(n.gain0);
		node.gain1 = parseInt(n.gain1);
		node.gain2 = parseInt(n.gain2);
		node.gain3 = parseInt(n.gain3);

		node.factor0 = Number(n.factor0);
		node.factor1 = Number(n.factor1);
		node.factor2 = Number(n.factor2);
		node.factor3 = Number(n.factor3);

		node.offset0 = Number(n.offset0);
		node.offset1 = Number(n.offset1);
		node.offset2 = Number(n.offset2);
		node.offset3 = Number(n.offset3);

		node.tagnameai = "IA" + n.addressai;
		
		syslib.setAdcMode(node);
		
		node.iserror = false;
		node.setai = false;

		node.store = node.context().global;

		node.statustxt = "";

		if (!node.iserror) {
			if (typeof node.store.keys().find(key => key == node.tagnameai) !== "undefined")
				node.iserror = syslib.outError(node, "duplicate " + node.tagnameai, "duplicate address " + node.tagnameai);
			else {
				node.store.set(node.tagnameai, [0, 0, 0, 0]);
				node.statustxt = node.tagnameai;
				node.setai = true;
			}
		}

		if (!node.iserror)
			if (sysmodule.inuse(node.devadr))
				node.iserror = syslib.outError(node, "in use", "node in use " + node.name);

		if (!node.iserror) {
			sysmodule.setmodeAI(node.devadr, node.mode0, node.mode1, node.mode2, node.mode3);
			sysmodule.setgainAI(node.devadr, node.gain0, node.gain1, node.gain2, node.gain3);

			if (!sysmodule.initAI(node.devadr))
				node.iserror = syslib.outError(node, "init", "error on init");
		}

		if (!node.iserror) {
			node.statustxt = node.statustxt.trim();
			syslib.setStatus(node, node.statustxt);
		}

		node.on("input", function (msg) {
			if (!node.iserror) {
				if (msg.payload === "input") {
					var aival = sysmodule.updateAI(node.devadr);
						
					if (aival === undefined)
						syslib.outError(node, "update", "error on update");
					else
					{
						node.store.set(node.tagnameai, syslib.calcAdcValue(node, aival));
						syslib.setStatus(node, node.statustxt);
					}
				}
			}

			node.send(msg);
		});

		node.on('close', function () {
			sysmodule.inuseClear();

			if (node.setai)
				node.store.set(node.tagnameai, undefined);
		});
	});
}
