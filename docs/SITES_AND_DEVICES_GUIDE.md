# Обекти и устройства / Sites and devices

Статус 2026-09-29: интерфейсът е публикуван в gridex.tech, backend API и
миграция 015 са внедрени. Реален тест за създаване с клиентски администратор
и потвърждение на OpenRemote asset още предстои. Публикацията не е доказателство
за работещ клиентски процес.

## Български

### Нов Обект — `/sites/`

Само администратор с активно членство и право за всички Обекти в **своята**
организация вижда „Нов Обект“. Въвежда име и часова зона и натиска „Създай
Обект“. Организацията се взема от потвърденото членство, не от имейл или
твърдение на браузъра. Backend създава Обекта в същия OpenRemote realm,
свързва го с администратора, проверява връзката и едва тогава го показва.
Обектът започва в статус commissioning, без управляващи команди.

При празен списък администраторът вижда формата, а другите потребители —
указание да поискат достъп. При зареждане/грешка не се показват демо Обекти.
Ако OpenRemote не потвърди заявката, екранът показва грешка; повторението със
същите данни използва същия ключ и не създава дубликат.

### Ново устройство — `/devices/` след избор на Обект

Само администраторът на организацията вижда „Добави устройство“ за разрешен
Обект. Избира единствено ROCK Pi E или потвърден OLIMEX ESP32-EVB вариант,
въвежда име и, за ESP32, избира ROCK Pi E от същия Обект като родител. Ролята
се определя от модела: ROCK е контролер, ESP32 е комуникационен нод.
OpenRemote asset, йерархията и собствеността се проверяват преди успешно
показване. Конфигурационните роли се задават отделно като чернова — най-много
две на устройство. Интеграторът може да редактира тази чернова за разрешен
Обект, но не създава Обект или нов хардуер. Само организационният
администратор започва commissioning. Добавянето не променя Ethernet, не
изпраща OTA/Modbus команди и не доказва heartbeat.

Без избран Обект първо се отваря списъкът с Обекти. При недостъпна връзка
екранът запазва липсата на потвърждение, а не измисля онлайн статус.
Профил на устройство, който не е потвърден от GrideX, не се предлага.

Анонимното `/demo/*` показва само примерни данни и не изпраща заявки за
създаване. Ръководството трябва да се сравни с реален вход, мобилен и desktop
екран, OpenRemote asset tree и отказ към чужд realm преди да се обяви за live.

## English

### New Site — `/sites/`

Only an administrator with active, all-Site membership in **their own**
organisation sees New Site. They enter a name and time zone, then choose
Create Site. The organisation comes from verified membership, not an email
match or a browser claim. The backend creates the Site in that organisation's
OpenRemote realm, links it to the administrator and verifies the link before
showing it. A new Site starts in commissioning status, with no control commands.

On an empty list, administrators see the form; other users see instructions to
request access. Loading or error states never display demo Sites. If OpenRemote
cannot verify the request, the screen reports an error; retrying unchanged
details uses the same key and cannot create a duplicate.

### New device — `/devices/` after selecting a Site

Only the organisation administrator sees Add device for an authorised Site.
They select an approved ROCK Pi E or OLIMEX ESP32-EVB variant and enter a name.
An ESP32 also needs a parent ROCK Pi E in the same Site. Model determines role:
ROCK is the controller and ESP32 a communication node. OpenRemote asset,
hierarchy and ownership are verified before success. Configuration roles are a
separate draft, limited to two per device. An authorised Integrator can edit
that draft, but cannot create a Site or new hardware. Only the organisation
administrator starts commissioning. Adding inventory does not alter Ethernet,
send OTA/Modbus commands or prove a heartbeat.

Without a selected Site, the Site list opens first. On connectivity failure,
the screen reports missing verification rather than inventing an online state.
Unapproved hardware profiles are not offered.

Anonymous `/demo/*` contains samples only and sends no creation requests.
The guide must be checked against real sign-in, mobile and desktop screens,
the OpenRemote asset tree and cross-realm denial before being marked live.
