# node-red-contrib-redplc-mcp342x

Node-Red node for mcp3421 .. mcp3428 analog to digital converter<br>

## Node Features
- **mcp3421** 1-channel, 12bit-18bit, one I2C address
- **mcp3422** 2-channel, 12bit-18bit, one I2C address
- **mcp3423** 2-channel, 12bit-18bit, eight I2C addresses
- **mcp3424** 4-channel, 12bit-18bit, eight I2C addresses
- **mcp3425** 1-channel, 12bit-16bit, one I2C address
- **mcp3426** 2-channel, 12bit-16bit, one I2C address
- **mcp3427** 2-channel, 12bit-16bit, eight I2C addresses
- **mcp3428** 4-channel, 12bit-16bit, eight I2C addresses
- Each input can be selected 12bit-18bit* or Disabled
- 12bit conversion time 5ms/channel
- 14bit conversion time 25ms/channel
- 16bit conversion time 100ms/channel
- 18bit conversion time 300ms/channel
- Output value is in mV
- Input range +/- 2.048V, 1.024V, 0.512V or 0.256V
- Scaling with factor and offset

*If set to 18bit on 16bit device, it changed to 16bit 

## Install

For using with Ladder-Logic install
[redPlc](https://www.npmjs.com/package/node-red-contrib-redplc) nodes

For using with other nodes, install
[module](https://www.npmjs.com/package/node-red-contrib-redplc-module) nodes

Install with Node-Red Palette Manager or npm command:
```
cd ~/.node-red
npm install node-red-contrib-redplc-mcp342x
```

## Usage
This node writes to Node-Red global variables<br>
Update is triggered by redPlc cpu node<br>
or module-update node<br>
This node works only on Raspberry Pi with Raspberry Pi OS<br>
Enable I2C with raspi-config<br>
Consult datasheet for absolute maximum ratings<br>

### Analog Input (Variable IA):
*mcp3421, mcp3425*
|Input|Array-Index
|:----|:---:|
|CH1|0|

*mcp3422, mcp3423, mcp3426, mcp3427*
|Input|Array-Index
|:----|:---:|
|CH1|0|
|CH2|1|

*mcp3424, mcp3428*
|Input|Array-Index
|:----|:---:|
|CH1|0|
|CH2|1|
|CH3|2|
|CH4|3|

### Scaling with Factor and Offset:

```
Formula:

Factor = (OH - OL) / (IH - IL)
Offset = OL - (IL * Factor)

Output = Input * Factor + Offset

Where:

IL = Input Low (mV), IH = Input High (mV) 
OL = Output Low, OH = Output High
```
### Example:
Input:  0mV .. 2048mV, IL = 0, IH = 2048<br>
Output: -20°C .. 60°C, OL = -20, OH = 60<br>
**Factor** = (60 - (-20)) / (2048 - 0) = **0.04**<br>
**Offset** = (-20) - (0 * 0.04) = **-20**<br>

Input = 500mV<br>
Output = 500 * 0.04 + (-20) = 0°C<br>

## Donate
If you like my work please support it with donate:

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=ZDRCZBQFWV3A6)
