# Suntech STE-261L / SunStorage Pro 261 - confirmed Modbus profile

Status: manufacturer-confirmed implementation baseline for bench validation.

This profile combines the supplied `EMS MODBUS All-in-one liquid-cooled
cabinet BCQ controller comm protocol 261kWh V2.0` with the manufacturer's
written clarifications. The written clarifications take precedence where the
original table is ambiguous.

## Connection

| Parameter | Confirmed value |
| --- | --- |
| Transport | Modbus TCP |
| Port | `3200` |
| Unit / slave ID | `1` |
| Address offset | None; register `5005` is requested as `5005` |
| Poll interval | 500 ms to 1 s |
| Request timeout | 3 to 5 s; GrideX default is 4 s |
| Maximum register count | 125 |
| Supported clients | Up to 10; operational limit 6 to 8 |
| Concurrent writes | Last write wins; GrideX therefore enforces one writer |

The ROCK Pi E keeps one persistent connection on the isolated OT Ethernet
interface. OpenRemote never writes directly to the cabinet.

## Confirmed encoding

- Multi-register values use `ABCD`, high-order word first, big-endian.
- Registers 122 and 124 are signed `Int32` values decoded as `raw / 10 kWh`.
- Telemetry and command polarity is positive for discharge and negative for
  charge.
- There is no register-address offset.

For words `[0x0001, 0xE240]`, the raw Int32 is `123456`, therefore the decoded
value is `12345.6 kWh`.

## Energy counters

| Registers | Function | Type | Meaning |
| --- | --- | --- | --- |
| 122-123 | FC04 | signed Int32 / 10 | Accumulated DC-side charge energy |
| 124-125 | FC04 | signed Int32 / 10 | Accumulated DC-side discharge energy |
| 129 | FC04 | signed Int16 / 10 | Daily DC-side charge energy |
| 130 | FC04 | signed Int16 / 10 | Daily DC-side discharge energy |

Registers 122-125 must be read in one FC04 request so both Int32 values are
captured from the same refresh instant. Reading the words or counters in
separate requests is prohibited.

The lifetime counters exclude PCS conversion losses, survive power loss and
cannot be reset by a third party. Signed Int32 overflow is expected only near
214 million kWh. Daily registers 129/130 reset when the BMS local RTC crosses
00:00:00; this is not a reboot reset and not necessarily UTC midnight. The edge
service stores the BMS time-zone configuration with the telemetry metadata.

## Heartbeat

Heartbeat registers are manufacturer-confirmed as readable/writable Int16,
using FC06 for writes:

1. Write `1` to register `5302` to enable heartbeat.
2. Write the timeout, normally `60`, to register `5301`.
3. Refresh register `5301` before expiry; GrideX uses 35 seconds.
4. If the countdown reaches zero, the PCS enters standby and can recover
   automatically after communications return.

The PDF labels the two fields as `Bit / R`; the manufacturer's clarification
explicitly confirms `Int16 / RW`, which is the implemented behaviour.

## Active-power command

| Register | Function | Type | Scaling | Meaning |
| --- | --- | --- | --- | --- |
| 5005 | FC06 | signed Int16 | raw / 10 kW | Active power; positive discharge, negative charge |
| 5006 | FC06 | signed Int16 | raw / 10 kvar | Reactive power |

Only FC06 is used. Command interval is at least one second. Commands are not
retained after reboot. There is currently no PCS ramp limit, and writing zero
is the mandatory safe command.

Before a non-zero active-power command, GrideX requires all of the following:

- register 5003 is `1` - unit powered on;
- register 5001 is `0` - grid-tied / synchronised;
- register 5002 is `1` - PQ current-source mode; the driver verifies but does
  not change this factory/startup setting;
- PCS overall-fault coil 1 is clear;
- SOC register 102 is within the configured charge/discharge envelope;
- BMS limit registers 127 and 128 are fresh and greater than zero for the
  requested direction.

Registers 127/128 are positive DC-side kW values, update every 1-2 seconds and
are capped by the 125 kW system rating. Zero prohibits the corresponding power
direction. GrideX clamps the requested setpoint before writing; the PCS clamp is
treated as an additional protection, not the primary safety layer.

## Edge implementation

The standard-library C++ implementation foundation is under
`edge/rock-pi-e`. A concrete libmodbus adapter will implement the transport
interface. The driver already contains:

- ABCD signed Int32 decoding;
- mandatory atomic 122-125 reads;
- heartbeat enable and refresh sequence;
- readiness, fault, SOC and BMS-limit checks;
- signed Int16 scaling and directional clamping;
- one-second command-rate enforcement and safe zero.

Bench acceptance must still validate live register traces, disconnect/reconnect,
midnight rollover, reboot recovery, simultaneous-client rejection and zero-power
command behaviour before production deployment.

