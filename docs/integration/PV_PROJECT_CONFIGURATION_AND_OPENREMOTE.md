# PV project configuration and OpenRemote mapping / PV проектна конфигурация и OpenRemote mapping

## English

### Ownership and storage

`sites.latitude` and `sites.longitude` identify the project location. Every
physical PV orientation is stored separately in `pv_arrays`; do not collapse
east/west, roof planes or trackers into one averaged row. The GrideX API owns
validation, revisions and audit. OpenRemote owns the resulting `SolarPVAsset`
tree and all live/predicted datapoints.

Required per array: `name`, `dcKwp`, `tiltDeg` (0–90°), `azimuthDeg`
(0–359°, 180° = south), `performanceRatio` (0–1), and enabled state. Optional
per-array coordinates override the site location only for physically distant
arrays. Additional forecast inputs are `temperatureCoefficientPctPerC` and
`shadingLossPct`.

### Final BFF API

```text
GET  /api/v1/sites/{siteId}/pv-configuration
PUT  /api/v1/sites/{siteId}/pv-configuration       If-Match: <revision>
POST /api/v1/sites/{siteId}/pv-configuration/validate
POST /api/v1/sites/{siteId}/pv-configuration/simulate
POST /api/v1/sites/{siteId}/pv-configuration/activate
GET  /api/v1/sites/{siteId}/pv-configuration/status
```

`PUT` creates or updates a **draft** only. `validate` checks coordinates,
range, role, enabled-array DC capacity and OpenRemote mapping; `simulate`
calculates weather/irradiance/PV impact; `activate` writes the validated
revision through the backend adapter. The frontend never writes OpenRemote
directly.

```json
{
  "baseRevision": 4,
  "site": { "latitude": 42.6977, "longitude": 23.3219, "timezone": "Europe/Sofia" },
  "arrays": [{
    "id": "pv-array-a", "name": "Roof south", "enabled": true,
    "dcKwp": 125.0, "tiltDeg": 25, "azimuthDeg": 180,
    "performanceRatio": 0.82, "temperatureCoefficientPctPerC": -0.35,
    "shadingLossPct": 2.5
  }]
}
```

### OpenRemote mapping

```text
SiteAsset
└─ SolarPVAsset (one per pv_arrays row)
   ├─ configuration.dcKwp                 number, kWp
   ├─ configuration.tiltDeg               number, degree
   ├─ configuration.azimuthDeg            number, degree
   ├─ configuration.performanceRatio      number, ratio
   ├─ configuration.temperatureCoefficientPctPerC  number, %/°C
   ├─ configuration.shadingLossPct        number, %
   ├─ location.latitude / location.longitude         number, degree
   ├─ forecast.irradianceGtiWm2           predicted datapoint, W/m²
   ├─ forecast.pvPowerKw                  predicted datapoint, kW
   └─ forecast.pvEnergyKwh                predicted datapoint, kWh
```

The forecast worker obtains weather and tilted irradiance from the approved
provider, applies each array’s physical configuration, aggregates the site PV
forecast and writes predictions through the OpenRemote REST adapter. API tokens
and provider credentials stay in the backend secret store.

## Български

`sites.latitude` и `sites.longitude` описват местоположението на проекта.
Всеки различно ориентиран PV масив се пази като отделен ред в `pv_arrays` —
източен/западен покрив, различни скатове и тракери не се усредняват.

За всеки масив са задължителни: име, DC kWp, наклон (0–90°), азимут (0–359°;
180° = юг), PR и активност. По избор се задават локални координати, температурен
коефициент и загуби от засенчване. Редакцията създава чернова; валидирането,
симулацията и активирането вървят през GrideX API. Frontend-ът не пише директно
в OpenRemote.

В OpenRemote всеки ред е child `SolarPVAsset` с конфигурационни атрибути за
kWp, наклон, азимут, PR, температурен коефициент, засенчване и координати.
Прогнозният worker записва GTI, PV мощност и PV енергия като predicted
datapoints. Реалното производство остава телеметрия в OpenRemote.
