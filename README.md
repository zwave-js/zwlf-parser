# zwlf-parser

Parses .zwlf files created by PC Controller and converts them into serial data

## Usage

### Parse a .zwlf file and print the serial data to console

```
npx @zwave-js/zwlf-parser [--json] /path/to/file.zwlf
```

outputs

```
2021-05-25T16:14:37.177Z « 0104011301e8
2021-05-25T16:14:37.177Z » 06
```

You can optionally specify the `--json` flag to print the parsed data in JSON format. Each printed line will contain a JSON object:

```
{"ts":"2021-05-25T16:14:37.177Z","dir":"incoming","payload":"0104011301e8"}
{"ts":"2021-05-25T16:14:37.177Z","dir":"outgoing","payload":"06"}
```

## Changelog

<!--
	Placeholder for the next version (at the beginning of the line):
	### **WORK IN PROGRESS**
-->

### **WORK IN PROGRESS**

-   Initial release

## License

MIT License

Copyright (c) 2021 AlCalzone

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
