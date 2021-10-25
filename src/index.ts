import * as fs from "fs-extra";
import { Transform, TransformCallback } from "stream";

/**
 * Checks if there's enough data in the buffer to deserialize a complete message
 */
function containsCompleteMessage(data?: Buffer): boolean {
	// Each chunk contains 8 bytes timestamp, 1 byte direction/sessid,
	// 4 bytes buffer length, n bytes data, 1 byte whatever
	return !!data && data.length >= 14 && data.length >= getMessageLength(data);
}

function getMessageLength(data: Buffer): number {
	return 14 + data.readUInt32LE(9);
}

function toDate(ticks: bigint): Date {
	return new Date(Number((ticks - 621355968000000000n) / 10000n));
}

interface Chunk {
	timestamp: Date;
	direction: "outgoing" | "incoming";
	sessionId: number;
	payload: Buffer;
	end: number;
}

function toJSON(chunk: Chunk): string {
	return JSON.stringify({
		ts: chunk.timestamp.toISOString(),
		dir: chunk.direction,
		payload: chunk.payload.toString("hex"),
	});
}

const HEADER_LENGTH = 2048;

export class ZWLFParser extends Transform {
	constructor() {
		// We read byte streams but emit messages
		super({ readableObjectMode: true });
	}

	private receiveBuffer = Buffer.allocUnsafe(0);
	private readHeader = false;

	_transform(chunk: any, encoding: string, callback: TransformCallback): void {
		this.receiveBuffer = Buffer.concat([this.receiveBuffer, chunk]);
		if (!this.readHeader) {
			if (this.receiveBuffer.length < HEADER_LENGTH) {
				callback();
				return;
			} else {
				this.receiveBuffer = skipBytes(this.receiveBuffer, HEADER_LENGTH);
				this.readHeader = true;
			}
		}

		while (this.receiveBuffer.length > 0) {
			if (!containsCompleteMessage(this.receiveBuffer)) {
				// The buffer contains no complete message, we're done here for now
				break;
			} else {
				// We have at least one complete message
				const msgLength = getMessageLength(this.receiveBuffer);
				// emit it and slice the read bytes from the buffer
				const msg = this.receiveBuffer.slice(0, msgLength);
				this.receiveBuffer = skipBytes(this.receiveBuffer, msgLength);

				// Some .net time format, have fun parsing that
				const timestamp = toDate(msg.readBigUInt64LE(0) & BigInt(`0b00${"1".repeat(62)}`));
				const ctrl = msg[8];
				const direction = !!(ctrl & 0b1000_0000) ? "outgoing" : "incoming";
				const sessionId = ctrl & 0b0111_1111;
				const end = msg[msg.length - 1];
				const payload = msg.slice(13, -1);

				this.push({
					timestamp,
					direction,
					sessionId,
					payload,
					end,
				});
			}
		}
		callback();
	}
}

/** Skips the first n bytes of a buffer and returns the rest */
export function skipBytes(buf: Buffer, n: number): Buffer {
	return Buffer.from(buf.slice(n));
}

const args = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const filename = args[args.length - 1];
const json = process.argv.includes("--json");
const strm = fs.createReadStream(filename);

// const _header = strm.read(2048);
const reader = new ZWLFParser();
reader.on("data", (chunk: Chunk) => {
	if (json) {
		console.log(toJSON(chunk));
	} else {
		console.log(
			`${chunk.timestamp.toISOString()} ${chunk.direction === "incoming" ? "«" : "»"} ${chunk.payload.toString(
				"hex",
			)}`,
		);
	}
});
strm.pipe(reader);
