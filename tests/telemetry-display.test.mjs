import test from 'node:test';
import assert from 'node:assert/strict';
import { formatRockMetric, formatRockMetricTime, rockMetricDescription } from '../app/lib/telemetry-display.ts';

test('ROCK telemetry uses human-readable time and sizes without changing the measurement', () => {
  assert.equal(formatRockMetric('uptimeSeconds', 93784, 's', 'bg'), '1 д 2 ч 3 мин');
  assert.equal(formatRockMetric('uptimeSeconds', 59, 's', 'en'), '59 sec');
  assert.equal(formatRockMetric('memoryAvailableBytes', 1_500_000_000, 'bytes', 'bg'), '1,5 ГБ');
  assert.equal(formatRockMetric('journalSizeBytes', 750_000, 'bytes', 'en'), '750 kB');
  assert.equal(formatRockMetric('cpuTemperatureC', 52.083, 'Cel', 'bg'), '52,1 °C');
  assert.equal(formatRockMetric('load1', 0.37, 'load', 'en'), '0.37');
});

test('load is explained as a load average, not an invented CPU percentage', () => {
  assert.match(rockMetricDescription('load1', 'bg').detail, /не е процент/);
  assert.match(rockMetricDescription('journalSizeBytes', 'en').detail, /does not by itself confirm delivery/);
  assert.equal(formatRockMetricTime(2, 'bg'), null);
});
