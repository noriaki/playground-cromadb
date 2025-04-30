// src/utils/memory-monitor.ts

/**
 * Reports current memory usage with a label for identification
 * @param label Label to identify the measurement point
 */
export function reportMemoryUsage(label: string): void {
  const memoryUsage = process.memoryUsage();
  console.log(`Memory usage at ${label}:`);
  console.log(`  RSS: ${Math.round(memoryUsage.rss / 1024 / 1024)} MB`);
  console.log(`  Heap Total: ${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`);
  console.log(`  Heap Used: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`);
  console.log(`  External: ${Math.round(memoryUsage.external / 1024 / 1024)} MB`);
}

/**
 * Tracks memory usage over time with periodic reporting
 */
export class MemoryTracker {
  private startTime: number;
  private lastReportTime: number;
  private reportInterval: number;
  private measurements: Array<{
    timestamp: number;
    label: string;
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  }>;

  /**
   * Creates a new memory tracker
   * @param reportIntervalMs Interval between automatic reports in milliseconds (default: 5000ms)
   */
  constructor(reportIntervalMs: number = 5000) {
    this.startTime = Date.now();
    this.lastReportTime = this.startTime;
    this.reportInterval = reportIntervalMs;
    this.measurements = [];
  }

  /**
   * Takes a memory measurement with a label
   * @param label Label for this measurement point
   * @param forceReport Whether to force console output (default: false)
   * @returns The measurement object
   */
  measure(label: string, forceReport: boolean = false): any {
    const now = Date.now();
    const memoryUsage = process.memoryUsage();
    
    const measurement = {
      timestamp: now,
      label,
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), 
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024)
    };
    
    this.measurements.push(measurement);
    
    // Report if forced or if interval has passed
    if (forceReport || (now - this.lastReportTime) >= this.reportInterval) {
      this.report();
      this.lastReportTime = now;
    }
    
    return measurement;
  }
  
  /**
   * Reports all measurements to the console
   */
  report(): void {
    console.log('\n=== Memory Usage Report ===');
    console.log(`Total runtime: ${((Date.now() - this.startTime) / 1000).toFixed(2)}s`);
    console.log('Recent measurements:');
    
    // Only show the last 10 measurements to avoid cluttering the console
    const recentMeasurements = this.measurements.slice(-10);
    
    recentMeasurements.forEach(m => {
      const timeOffset = ((m.timestamp - this.startTime) / 1000).toFixed(2);
      console.log(`[${timeOffset}s] ${m.label}: Heap Used: ${m.heapUsed} MB, RSS: ${m.rss} MB`);
    });
    
    // Calculate the growth rate if we have enough measurements
    if (this.measurements.length >= 2) {
      const first = this.measurements[0];
      const last = this.measurements[this.measurements.length - 1];
      const durationSeconds = (last.timestamp - first.timestamp) / 1000;
      
      if (durationSeconds > 0) {
        const heapGrowthRate = (last.heapUsed - first.heapUsed) / durationSeconds;
        console.log(`Heap memory growth rate: ${heapGrowthRate.toFixed(2)} MB/s`);
      }
    }
    
    console.log('========================\n');
  }
  
  /**
   * Takes a heap snapshot if the heap-dump module is available
   * @param label Label for the snapshot file
   * @returns Promise that resolves when the snapshot is written
   */
  async takeHeapSnapshot(label: string): Promise<string | null> {
    try {
      console.log('Heap snapshots require the heapdump module. You can install it with: npm install heapdump');
      console.log('This functionality is currently disabled for compatibility.');
      
      // Just create a placeholder file
      const filename = `heap-${label}-${Date.now()}.txt`;
      
      // We'll implement a simpler alternative here
      const fs = require('fs');
      const memoryUsage = process.memoryUsage();
      const content = `Memory snapshot at ${new Date().toISOString()}\n` +
        `Label: ${label}\n` +
        `RSS: ${Math.round(memoryUsage.rss / 1024 / 1024)} MB\n` +
        `Heap Total: ${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB\n` + 
        `Heap Used: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB\n` +
        `External: ${Math.round(memoryUsage.external / 1024 / 1024)} MB\n`;
      
      fs.writeFileSync(filename, content);
      console.log(`Basic memory info written to ${filename}`);
      return filename;
    } catch (error) {
      console.error('Failed to take memory snapshot:', error);
      return null;
    }
  }
  
  /**
   * Explicitly requests garbage collection if --expose-gc flag is enabled
   * @returns Whether garbage collection was successfully requested
   */
  requestGC(): boolean {
    if (typeof global.gc === 'function') {
      try {
        global.gc();
        console.log('Garbage collection requested');
        return true;
      } catch (e) {
        console.error('Error requesting garbage collection:', e);
      }
    } else {
      console.warn('Garbage collection not available. Run with --expose-gc flag to enable.');
    }
    return false;
  }
  
  /**
   * Exports all measurements to a JSON file
   * @param filePath Path to save the JSON file
   * @returns Promise that resolves when the file is written
   */
  exportToFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const fs = require('fs');
        const data = {
          startTime: this.startTime,
          measurements: this.measurements,
          summary: {
            totalDuration: Date.now() - this.startTime,
            measurementCount: this.measurements.length,
            peakHeapUsed: Math.max(...this.measurements.map(m => m.heapUsed)),
            peakRSS: Math.max(...this.measurements.map(m => m.rss))
          }
        };
        
        fs.writeFile(filePath, JSON.stringify(data, null, 2), (err: any) => {
          if (err) {
            reject(err);
          } else {
            console.log(`Memory measurements exported to ${filePath}`);
            resolve();
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}