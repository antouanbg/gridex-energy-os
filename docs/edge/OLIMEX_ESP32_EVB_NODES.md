# GrideX Edge — OLIMEX ESP32-EVB device nodes

## English

Each field device is assigned one OLIMEX ESP32-EVB node. The production
profile is **ESP32-EVB-EA-IND**; the ordinary ESP32-EVB board is retained only
for bench work. One node has one selected device type, vendor/model and
southbound bus: CAN or an external galvanically isolated RS485 transceiver on
UEXT. Mixed products on the same node are not allowed in the first release.

```text
OpenRemote / GrideX API
        │ command through the site VPN
        ▼
ROCK Pi E ── OT Ethernet / Modbus TCP :1502 ── OLIMEX ESP32-EVB ── CAN or RS485 ── one device
        ▲
        └──── receives normalised telemetry from MQTT through the site-router VPN
```

The node publishes telemetry through the site router's VPN-only MQTT path. It
has no WireGuard client and accepts command connections only from the allowlisted
ROCK Pi E address on the OT network. Command expiry applies a safe zero setpoint.
The ROCK Pi E remains the only command coordinator and safety authority.

The OLIMEX ESP32-EVB CAN reference maps TX to GPIO5 and RX to GPIO35. RS485 is
not an on-board physical port: use a suitable isolated external transceiver and
validate the carrier pinout, direction control, baud rate, parity and ground.

Sources: [OLIMEX ESP32-EVB firmware](https://github.com/OLIMEX/ESP32-EVB),
[production board](https://www.olimex.com/Products/IoT/ESP32/ESP32-EVB-EA-IND/open-source-hardware),
and [PlatformIO board profile](https://docs.platformio.org/en/stable/boards/espressif32/esp32-evb.html).

## Български

Всяко полево устройство получава собствен OLIMEX ESP32-EVB нод. За производство
се използва **ESP32-EVB-EA-IND**, а обикновеният ESP32-EVB остава за лабораторни
тестове. Нодът има точно един тип устройство, производител/модел и една
southbound шина: CAN или външен галванично изолиран RS485 transceiver през UEXT.
В първата версия не се разрешава смесване на продукти върху един нод.

Командите вървят само OpenRemote/GrideX API → site VPN → ROCK Pi E → OT Ethernet
→ Modbus TCP :1502 → OLIMEX нод → CAN/RS485. Телеметрията се публикува към
VPN-only MQTT през site router-а. Нодът няма WireGuard, не приема команди от
интернет и при изтекла команда задава безопасни 0 kW. ROCK Pi E остава единствен
координатор на командите и safety authority.

За CAN официалният референтен pinout е TX GPIO5 и RX GPIO35. RS485 не е физически
вграден порт; необходим е подходящ външен изолиран transceiver и проверка на
pinout, direction control, скорост, parity и ground за избрания carrier.
