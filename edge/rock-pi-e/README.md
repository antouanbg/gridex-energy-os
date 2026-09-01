# GrideX Edge for ROCK Pi E

## English

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

---

## Български

Тази директория съдържа основата на Linux/C++ Edge услугата за Radxa ROCK Pi E. Тя е отделена от уеб портала, OpenRemote конфигурацията и firmware-а за ESP32/T-CAN485 нодовете.

Текущата версия реализира потвърдените от производителя правила за Suntech STE-261L / SunStorage Pro 261, без домейн драйверът да зависи от конкретна Modbus библиотека. `ModbusClient` е транспортната граница; следващата хардуерна стъпка е постоянен libmodbus TCP адаптер върху LAN 1 / OT.

```text
OpenRemote стратегия -> MQTT/TLS или HTTPS -> ROCK Pi E command arbiter
                                                |
                                                +-> safety envelope
                                                +-> SuntechSte261l драйвер
                                                +-> Modbus TCP :3200 / unit 1
```

Компилиране и изпълнение на тестовете:

```bash
cmake -S . -B build
cmake --build build
ctest --test-dir build --output-on-failure
```

Тестовете използват Modbus клиент в паметта. Те не комуникират с физическо оборудване и не заменят стендовото валидиране на шкафа.
