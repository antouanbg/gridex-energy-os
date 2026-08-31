# GrideX Edge for ROCK Pi E

This directory contains the Linux/C++ edge-service foundation for the Radxa
ROCK Pi E. It is separate from the web portal, OpenRemote configuration and the
ESP32/T-CAN485 node firmware.

The current slice implements the manufacturer-confirmed Suntech STE-261L /
SunStorage Pro 261 protocol rules without binding the domain driver to a
particular Modbus library. `ModbusClient` is the transport boundary; the next
hardware step is a persistent libmodbus TCP adapter on LAN 1 / OT.

```text
OpenRemote strategy -> MQTT/TLS or HTTPS -> ROCK Pi E command arbiter
                                            |
                                            +-> safety envelope
                                            +-> SuntechSte261l driver
                                            +-> Modbus TCP :3200 / unit 1
```

Build and run the standard-library tests:

```bash
cmake -S . -B build
cmake --build build
ctest --test-dir build --output-on-failure
```

The tests use an in-memory Modbus client. They do not communicate with physical
equipment and do not replace cabinet bench validation.

