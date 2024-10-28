import { customType } from 'drizzle-orm/pg-core';
import { LOG_LEVEL } from '$env/static/private';

function logBuffer(label: string, data: Uint8Array | Buffer | unknown) {
    if (LOG_LEVEL !== 'debug') return;
    console.log(`\n=== ${label} ===`);
    console.log('Type:', Object.prototype.toString.call(data));
    console.log('Constructor:', data?.constructor.name);
    console.log('isBuffer:', Buffer.isBuffer(data));
    console.log('isUint8Array:', data instanceof Uint8Array);
    if (data instanceof Uint8Array || Buffer.isBuffer(data)) {
        console.log('First byte (hex):', data[0]?.toString(16));
        console.log('Length:', data.length);
        console.log('First 10 bytes:', Array.from(data.slice(0, 10)));
    } else {
        console.log('Value:', data);
    }
    console.log('=================\n');
}

export const bytea = customType<{
    data: Buffer | Uint8Array;
    driverData: Buffer | Uint8Array;
}>({
    dataType() {
        return 'bytea';
    },
    toDriver(value: Buffer | Uint8Array): Buffer {
        logBuffer('bytea.toDriver input', value);
        
        // If it's already a Buffer, use it directly
        if (Buffer.isBuffer(value)) {
            logBuffer('bytea.toDriver output (direct buffer)', value);
            return value;
        }
        
        // If it's a Uint8Array, create a Buffer sharing the same memory
        if (value instanceof Uint8Array) {
            const buffer = Buffer.from(value.buffer, value.byteOffset, value.length);
            logBuffer('bytea.toDriver output (from Uint8Array)', buffer);
            return buffer;
        }
        
        throw new Error('Invalid input type for bytea');
    },
    fromDriver(value: Buffer | Uint8Array): Uint8Array {
        logBuffer('bytea.fromDriver input', value);
        
        // If we somehow got a JSON string, try to extract the raw data
        if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
            if (value[0] === 0x7b) { // '{'
                try {
                    const str = value.toString('utf8');
                    const parsed = JSON.parse(str);
                    if (parsed && Array.isArray(parsed.data)) {
                        const rawData = new Uint8Array(parsed.data);
                        logBuffer('bytea.fromDriver output (extracted from JSON)', rawData);
                        return rawData;
                    }
                } catch (e) {
                    // If JSON parsing fails, continue with raw bytes
                }
            }
        }
        
        // Convert to Uint8Array, preserving the underlying buffer
        const result = new Uint8Array(
            value.buffer,
            value.byteOffset,
            value.length
        );
        
        logBuffer('bytea.fromDriver output', result);
        return result;
    }
});