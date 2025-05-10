// Starting date
const EPOCH = 1746858713449; 

let sequence = 0;
let lastTimestamp = 0;

// Generate integer incrementing id
export function snowflakeId(workerId = 1, datacenterId = 1) {
  let timestamp = Date.now() - EPOCH;
  
  if (timestamp === lastTimestamp) {
    // 12 bit for sequence (0-4095)
    sequence = (sequence + 1) & 4095; 
    if (sequence === 0) {
      // Wait next ms, sequence overflow
      while (Date.now() - EPOCH <= timestamp) {}
    }
  } else {
    sequence = 0;
  }
  
  lastTimestamp = timestamp;
  
  return Number(
    (BigInt(timestamp) << 22n) |
    (BigInt(datacenterId) << 17n) |
    (BigInt(workerId) << 12n) |
    BigInt(sequence)
  );
}



