# GrideX Edge — CAN/serial protocol references and Waveshare transport

Status: architecture baseline for implementation and bench validation.

## Decision

GrideX will use the Waveshare 2-CH CAN TO ETH as an optional transport
expansion on the isolated OT network:

```text
CAN BMS ───── CAN1 ┐
CAN inverter ─ CAN2 ├─ Waveshare 2-CH CAN TO ETH ─ LAN 1 / OT ─ ROCK Pi E
RS485 device ─ 485 ┘                                      │
                                                          ├─ frame adapters
                                                          ├─ device drivers
                                                          ├─ normalisation
                                                          └─ safety / fail-safe

ROCK Pi E LAN 2 / WAN ─ VPN + MQTT/TLS or HTTPS ─ OpenRemote private cloud
```

The Waveshare unit is a transparent transport gateway. It is not the GrideX
safety controller, does not replace the ROCK Pi E, and must not be exposed to
the public internet. Heartbeats, device availability, timestamps, quality,
BMS-limit validation, command clamping and safe-state remain local services on
the ROCK Pi E.

## Verified product capabilities

Source: official Waveshare product page and wiki for `2-CH-CAN-TO-ETH`.

- 2 × isolated CAN 2.0B, configurable from 10 kbps to 1 Mbps.
- Up to 8,000 received and 8,000 transmitted CAN frames/s per channel.
- 1 × RS485, configurable from 600 bps to 115.2 kbps.
- 10/100 Mbps Ethernet, Auto-MDI/MDIX, 1.5 kV Ethernet isolation.
- TCP Client/Server and UDP Client/Server; static IP or DHCP.
- 5–36 VDC input and stated operating range of −40°C to +85°C.
- Switchable 120 Ω CAN termination.
- Configurable network/CAN heartbeat and registration packets.
- Typical published average transport delay below 20 ms.

The exact product is a TCP/UDP transport. MQTT is not listed as a native
function for this model. MQTT/TLS to OpenRemote therefore remains a ROCK Pi E
service.

## CAN-over-Ethernet frame adapter

The Waveshare transparent CAN payload uses a fixed 13-byte record:

| Offset | Length | Meaning |
| --- | ---: | --- |
| 0 | 1 | Frame control, frame type and data length |
| 1 | 4 | CAN identifier |
| 5 | 8 | CAN payload, padded to eight bytes |

The ROCK Pi E adapter must treat TCP as a byte stream, not as a message bus:

1. Maintain a per-socket receive buffer.
2. Extract complete 13-byte records and retain partial records.
3. Validate DLC, standard/extended-frame flags and permitted CAN IDs.
4. Timestamp reception locally and attach link/channel quality.
5. Keep independent queues and health counters for CAN1, CAN2 and RS485.
6. Reconnect with bounded backoff and mark telemetry stale during disconnects.
7. Never forward an unvalidated command frame to an inverter or BMS.

Default ports shown by the vendor are CAN1 TCP Server `20001` and CAN2 TCP
Server `20005`. These are deployment defaults, not fixed GrideX requirements.
Every installation receives an explicit static addressing and port plan.

## Protocol catalogue reference

The public `ai-republic/bms-to-inverter` project is useful for identifying
protocol families and preparing test fixtures. Its currently published wiki
lists inverter bindings for Deye, GoodWe, Growatt LV/HV, Huawei, Luxpower,
Pylon-compatible LV/HV, SMA Sunny Island, Sol-Ark and Solis. It also lists BMS
families including BYD, Daly, Growatt, Huawei, JBD, JK, Megarevo, LIA,
Luxpower, Narada, PACE, PylonTech, SacredSun, Samsung/Vertiv, Seplos, SMA and
TianPower across CAN, RS485, RS232/UART and Modbus.

These names mean “a reference binding exists”; they do not mean that every
model or firmware revision is certified by GrideX. Each GrideX driver record
must keep:

- manufacturer, exact model and hardware revision;
- firmware version;
- physical interface and pinout;
- baud rate, parity, CAN bitrate and termination;
- protocol/register-map revision;
- sign, scale, offset, word order and byte order;
- read/write permissions and command prerequisites;
- stale timeout, heartbeat and recovery behaviour;
- bench-test evidence and approval status.

## Wiring references

The following public pin maps are useful only as test references. RJ45 is used
as a connector and does **not** imply Ethernet.

| Protocol family | Public reference pin map |
| --- | --- |
| Deye | CAN H pin 4, CAN L pin 5, GND pin 6; RS485 pairs on pins 1/2 and 7/8 |
| Growatt CAN | CAN H pin 4, CAN L pin 5, GND pin 2 |
| Pylon-compatible | CAN H pin 4, CAN L pin 5, GND pin 6; RS485 A/B pins 7/8; pins 1–3 not connected |
| SMA Sunny Island | CAN H pin 4, CAN L pin 5 |

Before wiring, the engineer must verify the manufacturer manual for the exact
model and firmware, check signal ground requirements, and confirm that 120 Ω
termination exists only at the two physical ends of the CAN bus.

## Licensing boundary

`ai-republic/bms-to-inverter` publishes its code under CC BY-NC-SA 4.0. That
licence restricts commercial reuse. GrideX must therefore not copy or embed its
source code in a commercial product without separate written permission.

Allowed project use for the current architecture:

- link to and attribute the public reference;
- use it to discover protocol names and prepare interoperability questions;
- compare independently captured laboratory traces;
- implement original GrideX drivers from manufacturer specifications and
  validated traces.

## Bench-validation gate

A driver may move from `R&D reference` to `Supported` only after:

1. Pinout and electrical levels are confirmed for the exact device.
2. Passive telemetry capture is decoded and compared with device values.
3. Limits, alarms, signs, scaling and endianness are verified.
4. Commands are tested first at zero power, then under a controlled envelope.
5. Link loss, stale data, reboot and malformed-frame behaviour are tested.
6. The GrideX safety layer proves that a strategy cannot bypass BMS limits.

## Primary references

- [ai-republic/bms-to-inverter](https://github.com/ai-republic/bms-to-inverter)
- [Published BMS and inverter protocol list](https://github.com/ai-republic/bms-to-inverter/wiki/Supported-BMSes-and-Inverters)
- [Reference-project licence](https://github.com/ai-republic/bms-to-inverter/blob/main/LICENSE)
- [Waveshare 2-CH CAN TO ETH product page](https://www.waveshare.com/2-ch-can-to-eth.htm)
- [Waveshare technical wiki](https://www.waveshare.com/wiki/2-CH-CAN-TO-ETH)
