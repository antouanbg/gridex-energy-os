# Frontend login handoff
Repository / GitHub: `antouanbg/gridex-energy-os`

## 2026-09-30 — изтекла сесия към демото

Одобрено поведение: при потвърден 401, отнета идентичност или нов release
порталът чисти личните данни и отваря `/demo/`. Не стартира автоматичен
Keycloak/OpenRemote вход. Следващият вход е само с бутона „Вход“ от демото.
При временен отказ на API проверката остава в защитено live състояние с
повторен опит; демо данни не заменят потребителските. Няма ново меню.
Публикация и реална проверка с потребителска сесия се отчитат отделно.

## 2026-09-30 — contact enquiry release gate

The About form is source-ready on `feat/secure-contact-inquiries`. The existing
offer button only pre-fills a topic; it never sends until form submission.
Dependency: backend contact API and private support recipient must be deployed
first; the BG/EN Docusaurus guide must be published. Acceptance: anonymous
demo and a verified customer member each receive a provider-queued response
and support confirms actual mailbox delivery; bad challenge, honeypot,
throttling and foreign Origin cannot send. Exact next action: review the PR,
deploy backend first, publish Pages, then perform the two real browser tests.
Do not mark the About help guide ready until the public guide and live form
are both verified.

Изходният код е готов, но живото изпращане още не е потвърдено. Пази
последователността backend → портал → документация → реална доставка.

## 2026-09-30 — /market/ super-admin render regression

След добавянето на BG delivery date PostgreSQL `DATE` пристигаше през JSON
като ISO timestamp (например `2026-09-29T21:00:00.000Z` за 30 септември
в София). Frontend добавяше второ `T12:00:00Z`, създаваше невалидна дата и
`Intl.DateTimeFormat` прекъсваше целия екран. `formatMarketDeliveryDate`
вече приема както DATE-only, така и ISO timestamp, показва датата по
Europe/Sofia и връща празна стойност при невалиден отговор, без crash.
Регресионният тест покрива реалния PostgreSQL формат, BG/EN и fallback.
Няма промяна в права, ценови записи, API или Grafana.

## 2026-09-29 — яснота за датите на цените „ден напред“

В „Пазар“ BG/EN текстът различава датата/часа на доставка по Europe/Sofia
от часа на получаване от ENTSO-E. За супер администратора се показва и
`latestDeliveryDate` за BG от съществуващия health API; клиентският екран
не получава това platform-only API. Grafana остава защитена и показва
последния реален час с цена. Няма промяна на права, събиране или меню.

## 2026-09-29 — live checkpoint: Site графики

PR #74 е в `main` (`f1efd7e`), CI мина с 58 browser теста и GitHub Pages
deploy завърши успешно. Публичният JS съдържа `/visualisations/` и екрана
„Визуализации“. За дълбокия URL GitHub Pages връща SPA `404.html` с
абсолютни JS/CSS пътища; клиентският routing зарежда екрана, но HTTP
статусът остава 404 — да се отчита при бъдещо SEO/hosting решение. Няма
реален приемателен тест със сесия и одобрена услуга; без org/member grant
екранът правилно отказва измервания. BG/EN help е в Docusaurus.

## 2026-09-29 — Site графики в Обекти (source checkpoint)

Добавен е стабилен адрес `/sites/{id}/visualisations/` под „Обекти“, без
ново главно меню. Картата на реален Обект води към 24-часова графика за
конфигурираните OpenRemote измервания; няма демо или предполагаеми стойности.
Достъпът се решава от backend по Site и org/member `visualisations` права.
BG/EN help връзката е към същия раздел в Docusaurus. TypeScript/Pages build,
lint без грешки, 57 съществуващи Playwright теста и отделен тест за новия
desktop/mobile Site URL минават; frontend публикацията и
реалният browser тест с клиентска самоличност се отразяват отделно.

Каталогът/заявките от PR #73 са в GitHub main (`28eb2aa`), Pages deploy е
успешен и публичният bundle съдържа „Достъпни услуги“/„Заявки за услуги“.
Клиентските триролеви действия все още чакат човешки приемателен тест.

## 2026-09-29 — заявки за услуги в Profile и съществуващата администрация

Добавен е каталог с пет услуги в „Профил → Услуги“ за потвърдени членове:
`day_ahead` (само BG) и `visualisations` се заявяват отделно; останалите
са „Предстои“. Заявителят вижда статус/история; супер администраторът и
организационният администратор решават отделно в съществуващото „Потребители
и покани“. Няма ново главно меню, автоматичен достъп или автоматичен имейл.
BG/EN документация и help link са обновени. TypeScript и production Pages
build са успешни. **Live публикацията и проверката с реални роли се отбелязват
отделно**, след backend миграция 020 и API внедряване. Графиките за Обекти
остават отделна задача с изолация по организация и конкретен Обект.

## 2026-09-29 — вграден BG ценови dashboard е публикуван

PR #71 е слят в `main` (`acba699`), quality и GitHub Pages deploy минаха;
публичният `/market/` зарежда bundle с „Отвори графиките“. Бутонът е в
реалния „Пазар“ само за проверен супер администратор или член с двете
услуги `day_ahead` и `visualisations`; backend допълнително проверява BG
зона, сесия и права за всяка Grafana заявка. BG/EN документацията е
публикувана. Реален iframe тест с човешки акаунт още се очаква от
собственика; не обявявай клиентския път за потвърден по анонимните тестове.
Заявките за услуги и бъдещите Site графики не са част от тази публикация.

## 2026-09-29 — одобрен каталог за услуги, UI предстои

Всеки логнат потребител, включително наблюдател, ще вижда пет услуги в
„Профил → Услуги“ без ново главно меню. „Цени ден напред“ и „Графики“ са
отделни заявяеми услуги; за цените се избира точно една държава/зона,
засега само България/BG. „Анализ“, „Метеорология“ и „Прогнозиране“ са видими
като „Предстои“ и не могат да се заявят. Заявката се показва на администратора
на организацията и супер администратора в „Потребители и покани → Заявки
за услуги“, но не дава автоматично право. След супер-админ разрешение за
организация (+ ценова зона) организационният администратор дава отделно
лично право. Цените и BG ценовият dashboard са в съществуващия „Пазар“;
бъдещите графики за Обекти — в „Обекти → Обект → Визуализации“, само при
проверен достъп до Обекта. Без публичен
Grafana вход и без ново главно меню. Пълният backend договор е в
`gridex-openremote-backend/docs/SERVICE_CATALOG_APPROVALS.md`.

**Уточнение:** BG ценов Grafana dashboard вече има защитен бутон и iframe в
реалния „Пазар“ (не е ново главно меню). Бутонът се показва на проверения
супер администратор или при лични `day_ahead` + `visualisations` права;
backend проверява допълнително BG зона и активна организация на всяка
заявка. Вътрешният Grafana, BG-only read-only view, API и public proxy са
стартирани; безвходният и подправеният достъп са отказани. Публикацията на
frontend и истинският браузърен тест с трите роли още предстоят и не бива
да се представят като приключени. Каталогът за всички и UI за заявки също
остават невнедрени.

## 2026-09-29 — избор на държави, само BG по подразбиране

Одобрено от собственика: в live „Пазар“ само супер администраторът вижда
административен списък на ценовите зони, с изрично потвърждение преди
включване/спиране на събирането. `BG` е единствената включена по подразбиране.
За активна организация зоната се разрешава отделно в съществуващото
„Клиенти и договори → Потребители и покани“ след `day_ahead` grant; няма нов
главен елемент. Личните права и ценовите стойности остават както преди;
демото не се променя. При изключена глобална зона организацията не може да
я включи. Backend миграция 018 и новите API endpoints вече са live след
backup; анонимните заявки към тях получават 401. Frontend TypeScript/lint,
27 unit и 57 браузърни теста минаха. BG/EN docs се обновяват заедно.
Grafana е само подготвен частен операторски dashboard, не е нов frontend
раздел и не е публичен login. Реален тест с трите роли остава задължителен.

## 2026-09-29 — Пазар и двустепенни права (актуално)

Собственикът одобри първо супер администраторът да разрешава услуга на
организация, след което нейният администратор я включва за всеки одобрен
потребител. Няма автоматично наследяване. Без личното право „Пазар“ и
подменютата му се скриват в live навигацията; директен адрес показва отказ,
а API пази окончателната граница. Дори при лично право клиентът още не вижда
ценови стойности или състояние на доставчика. Само супер администраторът вижда
ENTSO-E API status и последния успешен час на обновяване, не самите цени.
Контролите са в съществуващото „Клиенти и договори → Потребители и покани“,
без ново меню. Демото не е променено. Backend миграция 017/API/Timescale
worker вече са live; 0 права са включени. Frontend TypeScript и 27 unit
теста и пълните 57 браузърни теста минават; публикация/реален тест с трите
роли се отбелязват отделно.
BG/EN Docusaurus страниците са обновени. По-старият запис по-долу за
графика с цени е отменен от новото изрично решение.

## 2026-09-29 — одобрен екран „Пазар“ с реални цени (локално)

Собственикът потвърди съществуващия `/market/` и избор на пазарен продукт,
без ново меню. Логнатият потребител вижда отделен live екран за ENTSO-E
„Ден напред“: държава, ценова зона, дата, графика, таблица, източник,
време на зареждане и ясни непубликувани/непълни/недостъпни състояния.
Демо `Market` остава само за анонимното демо, без подмяна на live цени.
Frontend build, TypeScript и 27 unit теста минават локално. Не е внедрено:
backend A44 токен липсва в private env, а реален provider/browser тест и
публикация предстоят. BG/EN Docusaurus статия е подготвена в `gridex-docs`.

## 2026-09-29 — публикувано; реален акаунтен тест остава

PR #67 е слят в `main` като `ef78bc5`. GitHub Pages run
`36582947236` и Frontend quality run `36582947289` завършиха успешно.
Публичните `/`, `/login/`, `/sites/` и `/devices/` върнаха 200.
Backend миграция 016/API вече са внедрени преди frontend публикацията;
BG/EN Docusaurus е внедрен локално през одобрения скрипт. Тестът с реалните
супер администратор, организационен администратор и наблюдател на един
компютър, както и истинският еднократен resend/последен вход, още не са
потвърдени. Не извеждай извод за тях само от HTTP 200 или CI.

## 2026-09-29 — смяна на акаунт и покани (локална реализация)

Одобрено в текущия разговор: на споделен компютър новият вход не наследява
предишния realm или лични данни; обект се създава само от „Обекти“; поканен
член влиза след имейл/парола без втори бутон; самият поканен може еднократно
да поиска повторно писмо до същия адрес само преди приемане. Приетите покани
показват последен записан вход, не срок на линка. Кодът е подготвен в branch
`fix/account-switch-invitations` и е проверен с TypeScript, 26/26 unit и
57/57 Playwright тестове. Зависимост: backend миграция `016` и нов API маршрут;
не публикувай frontend самостоятелно. BG/EN Docusaurus е обновен локално,
но живата публикация и реалната проба с три акаунта още не са потвърдени.
Релевантен контекст: текущият разговор и проверени Phase1/Phase2 задачи;
не са намерени по-нови противоречащи решения за този поток.

Repository / GitHub: `antouanbg/gridex-energy-os`

## 2026-09-29 — покани, възстановяване на сесията, меню за наблюдател

По сигнал от мобилен клиент: потвърждението след изпращане не трябва да се
губи при неуспешно обновяване на списъка. Организационният администратор
вижда трайния статус на собствените си покани и може да изпрати повторно само
покана със статус `sent`. Временна грешка от API при проверка на сесията се
показва отделно, опитва се автоматично отново и се изчиства след успех;
истински 401 прекратява сесията. Наблюдателят няма разделите „Клиенти и
договори“ и „Потребители и покани“ и не ги отваря с директен адрес.
Променени са BG/EN помощта и браузърните тестове. Не се твърди, че
публикацията или реален клиентски тест са завършени, докато не бъдат проверени.
Първият CI цикъл откри запазена организация със специален отказ `organisation_suspended`;
поправката не го третира като обикновено изтичане на сесията. Старите тестови
очаквания за помощта и 503 са синхронизирани с новото поведение. Всичките
14 засегнати браузърни теста минаха локално; пълният набор е в ход.

## 2026-09-29 — одобрено живо внедряване на клиентски Обекти/Устройства

Собственикът даде изрично одобрение за живото пускане. PR #63 е в main
(`155bba0`); GitHub Pages run `36486777301` е успешен за същия commit.
Публичните `/sites/`, `/devices/` и `/demo/` връщат HTTP 200. Backend PR #57
и миграция `015` са внедрени, API е healthy, а анонимен `/api/v1/me` връща 401.
BG/EN Docusaurus ръководството е обновено на `doc.gridex.tech`. Следва
реален вход като клиентски администратор, създаване на нов Обект и потвърдено
устройство, проверка на OpenRemote asset tree и отказ към чужд realm. Нито
комишънинг, нито физически настройки се активират при създаването.

## 2026-09-29 — нова организация: устройства и роли, source готов / live чака backend

BG: Събрах PR #55 с актуалния main без промяна на менюто. Администраторът създава Обект в `/sites/`, добавя само одобрено ROCK Pi E/OLIMEX ESP32-EVB в `/devices/`, след което администратор/разрешен интегратор записва най-много две роли като неактивна чернова. Запазени са актуалният вход по имейл, сесията и защитеният Manager. Премахнах остарелите UI твърдения, че клиентското създаване не съществува. Pages build, TypeScript и три Chromium теста (desktop/mobile/refresh) минаха. Липсва реален клиентски тест; frontend не е внедрен, защото production API миграция/рестарт беше спряна от автоматичния преглед до изрично одобрение. Не показвай новата форма live, преди backend да работи.

EN: The approved existing Sites/Devices flow is integrated with current main; no new navigation or physical activation. Build, typecheck and three browser tests passed. Live release waits for the specifically authorised backend migration/restart and real customer verification.

## Main and live Pages reconciliation — 2026-09-28

Owner-approved PR #61 merged the organisation suspension controls with the
current email-first login and invitation resend into `main` at `f1aaa50`.
Local checks: 24 code tests, 20 focused Chromium tests, lint with zero errors
and two pre-existing image warnings. GitHub quality and Pages deployment
succeeded; public `gridex.tech/release.json` reports the same revision.
No menu hierarchy or mobile navigation was changed. Backend access enforcement
is already live; real customer suspension/email delivery has not been tried.

Customer Site/device creation PR #55 remains open and unpublished. Its backend
dependency #43 lacks completed tenant-aware OpenRemote provisioning and has a
migration-number conflict; do not advertise or publish the customer creation
form alone. Existing live read-only inventory remains unchanged.

Одобреният PR #61 е в `main` и в живия портал (ревизия `f1aaa50`).
Преминаха 24 кодови и 20 браузърни теста; няма промяна на менюто/мобилната
навигация. Реално спиране/имейл още не е проверено. PR #55 за създаване на
клиентски Обекти и устройства остава отворен: зависимият backend #43 не е
готов и има конфликт на миграцията. Не публикувай формата самостоятелно.

## Повторно изпращане на първа покана и правилен realm при вход — 2026-09-28

Собственикът поиска бутон „Изпрати поканата наново“ непосредствено до
„Отмени“, само ако статусът е `sent`. Бутонът извиква защитения backend
endpoint за същата покана, обновява срока и не създава нов акаунт. При
неясна доставка показва предупреждение и зарежда състоянието отново, без
автоматично повторение. Интегриран е и вече одобреният от предходен чат
email-first вход: общият „Вход“ пита за имейл и избира правилния realm;
паролата остава само в Keycloak. Изричният `?realm=novacom` работи и без
lookup API. Локално: build/build:pages, 25 кодови и 52 browser проверки
минаха. Backend lookup/resend е внедрен и анонимният отказ е проверен.
**Frontend публикацията и реалното повторно писмо още не са потвърдени.**
След публикуване провери клиентския вход и автоматичното довършване.
Публичният Docusaurus раздел се публикува заедно с функцията.

## OpenRemote Manager от административната страница — 2026-09-28

Собственикът одобри бутон в съществуващото „Клиенти и договори → Потребители
и покани“ за администратор на организация или супер администратор. Бутонът
извиква проверен backend endpoint, получава еднократен линк с 60 секунди срок
и отваря Manager веднага за realm-а на текущата сесия. Линкът се проверява
срещу origin-а на OIDC; няма имейл, setup акаунт или нов елемент в менюто.
При изход порталът опитва да отнеме Manager сесиите, без да блокира Keycloak
изход при backend outage. Помощта сочи към Docusaurus раздела
`/organisations-and-access/#openremote-manager`.

Статус: PR #57 е слят в `main` (`ba48dcef`); GitHub Pages и quality са
успешни, а публичният release.json показва този commit. `npm run build:pages`,
`npm test` (23/23), 45/45 браузърни теста и lint (0 грешки, 2 стари
предупреждения) минаха; desktop/mobile скрийншотовете са прегледани.
След отделното изрично одобрение backend миграция 014 и рестарт само на
`gridex-api` са извършени с архив и проверки. Защитеният proxy е внедрен,
а `novacom` OIDC callback/webOrigin е поправен. Docs PR #6 е публикуван с
актуален live статус. Локалният HTTPS тест потвърди отказ за анонимен
Manager и недостъпност на `master`; реалният вход и изход с пилотния и
клиентския акаунт от външна мрежа още чакат приемане от собственика.
Не приемай локалния отрицателен тест за пълна end-to-end проверка. Backend
текущо е от клон `feat/organisation-freeze`; не го връщай към по-стар `main`.

## Нов клиентски Обект и устройство — PR публикуван, не внедрен — 2026-09-27

Публикация: PR [#55](https://github.com/antouanbg/gridex-energy-os/pull/55),
последен commit `6935d8c`; backend PR [#43](https://github.com/antouanbg/gridex-openremote-backend/pull/43),
Docusaurus PR [#4](https://github.com/antouanbg/gridex-docs/pull/4).
Frontend CI мина: 47 браузърни теста, lint и server-render. Поправен е
конфликт на CSS selector между новата форма и старата настройка. Това не е
GitHub Pages deploy или приемане от реален клиент.

Последно изрично решение в Phase3: администраторът на активна организация
създава нов Обект от `/sites/` и добавя само потвърден ROCK Pi E или OLIMEX
ESP32-EVB от `/devices/` в нейния OpenRemote realm. ESP32 избира родител ROCK
в същия Обект. Интеграторът настройва чернова, но не създава ресурс;
commissioning е само за администратор. Няма ново меню или автоматичен
хардуерен старт.

Локални форми и API клиент са добавени. Нов Site се показва след проверения
backend отговор; повторение на неясна заявка запазва ключа за идемпотентност.
Формулярите са скрити за неадминистратори и сочат към Docusaurus help.
BG/EN ръководство: `docs/SITES_AND_DEVICES_GUIDE.md`; coverage таблицата е
обновена. `npm run lint` мина с две стари image предупреждения, `npm test`
25/25; `tsc --noEmit` има предходните несвързани грешки. Новият поток е
проверен с mock API на mobile/desktop; няма тест с реален клиентски акаунт.

Клиентският `antouan@novacom.bg` още няма активно членство; **не** го
„одобрявай“ ръчно. Първо негов вход към `novacom`, автоматично Accept,
проверен OpenRemote admin grant и изолация, после тест за нов Обект и ROCK/ESP.
Backend PR/миграция трябва да предхождат frontend deploy. Публичният
Docusaurus guide още трябва да се публикува със състояние „не е live“ и да
се сравни след реален тест.

EN: Forms/API for new Site and approved ROCK/ESP are published in a PR,
not deployed. Mocked mobile/desktop browser checks and full CI passed;
first-admin activation, real customer OpenRemote token, browser acceptance
and coordinated backend/frontend rollout remain.

## Потвърден клиентски процес за Обекти и устройства — 2026-09-27

Последно изрично решение в „EMS OpenRemote architecture Phase3“: само GrideX
ROCK Pi E и OLIMEX ESP32-EVB са избор за хардуер в съществуващия раздел
„Устройства“. Обект създава само администраторът на организацията. Друг
одобрен потребител вижда само разрешения му Обект; интеграторът и
администраторът подготвят конфигурацията. Commissioning и пускане засега са
само за администратора. Супер администраторът вижда всички потребители и
права, без да смесва клиентския инвентар. Максимум две роли на устройство;
ESP се настройва през ROCK. Външните протоколни референции не са GrideX
production драйвери.

Текуща промяна: изборът в съществуващия setup показва само вече проверени
в OpenRemote ROCK/ESP; черновата е за интегратор/администратор, а защитеният
достъп до ROCK — само за администратор. Help и публичното BG/EN ръководство
са обновени. **Не е завършено** добавянето на нов клиентски Обект/устройство:
frontend няма форма, backend няма Site POST и tenant-aware OR provisioning.
Проверки: `npm run build:pages` и Chromium `live-navigation.spec.ts` 1/1
минаха. Общият `tsc --noEmit` още пада от предходни несвързани грешки
(gateway/supported, jose/Fetcher, membershipIdentity); не е green gate.
Публичният Docusaurus guide е локално внедрен с `GRIDEX_DOCS_DEPLOYED`,
но frontend/backend кодът тук не е внедрен и няма real-customer тест.
Следва OR-авторитетно създаване с точен realm/owner link, идемпотентно
съгласуване, отрицателни cross-tenant тестове и live browser приемане.

EN: Only confirmed ROCK/ESP hardware. Organisation admin creates Sites and
alone commissions; Site-scoped integrators may draft settings. Platform admin
sees all users/rights, not pooled inventory. New customer creation is pending.

## Одобрение за всяка нова функция; frontend устройства — 2026-09-27

Последното изрично решение: за всяка нова функционалност извън вече
одобреното задание първо конкретен въпрос и потвърждение; без измислени
модели, роли или допълнителни стъпки. Изборът на устройства и роли е в
съществуващото меню GrideX „Устройства“; backend записва единствения
авторитетен инвентар в OpenRemote. Не добавяй ново меню. Правилото е в
AGENTS.md. Първият администратор на клиентска организация вече НЕ натиска
отделен бутон за приемане: след email/password/login frontend извиква
съществуващия проверен backend Accept endpoint за съвпадащата покана и
проверява членството. Поканите за членове остават непроменени. Локален Pages
build и 1 Chromium E2E тест минаха; реална публикация и customer test още
няма. Site/device creation за нов клиент е НЕЗАВЪРШЕНО: липсва Site POST,
tenant-aware OpenRemote provisioning и frontend форма. Публичната BG/EN
Docusaurus страница е обновена локално, но не е публикувана. Следва backend
tenant provisioning с fail-closed проверки, GrideX Site/device UI според
потвърдения каталог и реален тест с клиента.

EN: Ask for explicit confirmation before any new unspecified function.
Device/role selection belongs in the existing GrideX Devices UI; OpenRemote
is authoritative. The first administrator no longer presses a second Accept
button; portal calls the existing checked backend transition after sign-in.
Member invitations are unchanged. Local build/browser test passed, but
publication and customer acceptance remain pending. Customer Site/device
creation remains unfinished. Public BG/EN Docusaurus update is local only.

## Първа клиентска покана — проверка на приемането, 2026-09-27

Регистрацията и входът не са завършено провизиране. Реалната покана е `sent`,
валидна и свързана с точния потвърден клиент. Backend я връща като pending,
но audit няма `activation_started` или `accepted`: няма доказана Accept POST.
Chromium E2E тестът `tests/e2e/customer-onboarding-acceptance.spec.ts` мина:
клиент без членство вижда поканата в `/profile/`, изпраща Accept и получава
права след refresh. Това не замества реалното приемане. След него провери
OpenRemote admin grant, активна организация/членство и отказ до чужди Обекти.
Задължителният checklist е в AGENTS.md; не активирай вместо клиента.

EN: The verified customer has a valid `sent` invitation, but no Accept POST
or activation audit event. Browser E2E confirms Profile visibility without a
membership, acceptance and post-refresh rights. Real customer acceptance and
subsequent OpenRemote/tenant checks remain required.

## Organisation suspension / Спиране на организация — 2026-09-27

EN: Implemented suspension/restoration in the existing super-admin panel, strict verified pilot-subject permission, pilot protection, revision-locked durable operations, audit and one Mailgun attempt per suspension with recipient-specific delivery verification. API responses/SSE and patched OpenRemote HTTP/WebSocket sessions enforce denial; old JWTs stay revoked after restoration. Accounts, roles and inventory are preserved. Request source: delegated owner task `01a0cea9-3cd0-7430-b309-95795bf293a6`; history reader returned empty items, so the explicit request and repository decisions were used.

BG: Реализирани са спиране/възстановяване в съществуващия супер-админ панел, право само за проверения pilot subject, защита на пилотната организация, устойчиви операции/ревизии, audit и един Mailgun опит за всяко спиране с проверка на доставката до получателя. API/SSE и поправеният OpenRemote HTTP/WebSocket налагат отказ; старите JWT остават невалидни след възстановяване. Акаунтите, ролите и инвентарът се пазят. Източник е делегираното искане от посочената задача; history инструментът върна празни записи и са използвани изричното искане и repository решенията.

Evidence / Доказателства:
- Backend: 68 passing tests, including isolated PostgreSQL transactions, concurrency, multi-realm identity, idempotency, mail ambiguity and active SSE denial. Manager image `1.30.0-organisation-access-v2` compiled with the original issuer test plus access-guard tests.
- Isolated real OpenRemote/Keycloak: populated synthetic Asset inventory preserved, other realm unchanged, cross-realm denial, existing WebSocket closed, BG/EN disabled login, restore, old-token denial and fresh-token access. Test containers/volumes were removed afterward; no real customer data or email was used.
- Frontend: 23 unit/render tests, 52 Chromium tests after integrating main's realm-isolation PR #51, including BG/EN two-tab suspension, null battery/SOC/SOH, empty/denied/unavailable states. Lint has only two existing image warnings.
- Docs: typecheck and both locale builds; BG/EN 390/1440px layout reviewed without overflow.

Runtime / Внедряване: Manager v2 and API with migration 013 are healthy; source hashes match this branch. Private backup `organisation-access-vzUVs1`; organisation/membership/Site counts unchanged. Read-only verified platform identity, feature flag and unauthenticated 401 passed; access-operation count is zero. Local master discovery/admin/login and forced-local trusted-TLS public issuer/Manager/ingress denials passed. Normal-DNS public auth probes time out from this Mac; external real-owner acceptance remains unverified. Няма спряна реална организация, изтрити акаунти, повторна покана или изпратен имейл. Реалната първа доставка остава непроверена; Mailgun acceptance не се представя като delivered.

Publication / Публикуване: backend PR https://github.com/antouanbg/gridex-openremote-backend/pull/40 targets `feat/live-organisation-invitations`, since deployed setup-client/docs-proxy dependencies are not in main. Frontend PR https://github.com/antouanbg/gridex-energy-os/pull/52 and docs PR https://github.com/antouanbg/gridex-docs/pull/1 target main; neither is merged or publicly deployed by this task. Automatic approval review rejected the docs merge, citing trusted AGENTS review/no-automatic-merge rules. No workaround was used. Автоматичната проверка отказа docs merge по правилото за review и забрана за автоматично сливане; frontend/docs остават за изрично одобрение.

Exact next action / Точно следващо действие: obtain owner approval to merge and publish frontend #52 and docs #1 after their checks; update the publication-status note, deploy docs with `scripts/deploy-local.sh`, verify live Pages and BG/EN CSS/JS MIME, then record the actual first owner-triggered suspension/delivery. Keep backend #40's separate base dependency for review. Do not resend the onboarding email here. Изчакай одобрение за frontend #52 и docs #1; след проверките публикувай, смени статуса в ръководството, провери Pages/MIME и запиши първото реално спиране/доставка. Backend #40 пази отделната dependency основа. Не изпращай повторна покана от тази задача.


## Customer/platform realm separation and refresh state — 2026-09-27

EN: The owner reports that the first customer received the action email and can
sign in, but the same browser intermittently showed no session and selected the
customer realm for the platform owner. Root cause in the portal: the realm hint
was stored in browser-wide `localStorage`. This change ignores/removes that old
key, keeps explicit customer realm hints only in tab-scoped `sessionStorage`,
and clears the hint on sign-out. Generic new-tab login defaults to `gridex`.
During live session checks the account control now says “Checking session…”;
temporary verification failure is not represented as a confirmed sign-out.
No token is persisted. Five focused Chromium tests, including two-tab realm
isolation, route refresh, timeout and permission changes, passed. Source-only
until PR/Pages publication and real owner/customer browser acceptance.
The customer's empty inventory is a separate unfinished provisioning problem:
the new realm has no Site yet; do not show pilot devices or invent local ones.
Follow `docs/LOGIN_REALM_ISOLATION.md` and the OpenRemote-only inventory rule.

BG: Собственикът потвърди полученото писмо и входа на първия клиент, но от
същия браузър понякога се виждаше „няма сесия“ и клиентски realm се избираше
при входа на платформения собственик. Порталът пазеше realm-а общо за целия
браузър в `localStorage`. Поправката премахва стария ключ, пази изричния
клиентски избор само в текущата вкладка и го изчиства при изход. Общият вход
от нова вкладка започва в `gridex`. Докато се проверява реална сесия,
контролът показва „Проверка на сесията…“; временна грешка не се представя
като потвърден изход. Няма записване на токени. Пет целеви Chromium теста
минаха. Кодът чака PR/Pages и реален браузърен тест. Празният клиентски
инвентар е отделно незавършено провизиране: новият realm още няма Обект;
не се показват пилотните устройства и не се измислят локални записи.

## Помощ за покана от клиентска организация — 2026-09-27

Собственикът уточни, че новото обяснение е **само за администратори на
съществуващи клиентски организации**, не за платформения супер администратор
или създаване на нова организация. В `/help/` е добавен BG/EN раздел за
покана на колега, роли и минимален обхват по Обекти, приемане от „Профил“ и
действие при неясен резултат. Линкът води до съответния BG/EN раздел на
`doc.gridex.tech/organisations-and-access/`. Няма промяна в менюто или в
правата за изпращане; това е потребителска помощ към съществуващия поток.

Локално: `npm run build:pages` и трите целеви Chromium E2E теста минаха,
включително мобилен 390px и EN. Публичният Docusaurus раздел е изграден и
внедрен чрез `scripts/deploy-local.sh` с успешни проверки на двата езика и
MIME типовете. Първа реална клиентска покана, приемане и проверка на правата
остават непроверени; не изпращай покана без посочен от собственика получател.
Публикувано в `main` като `70ff589`; GitHub Pages deploy и Frontend quality
завършиха успешно (43 Chromium теста в CI). Живият
`https://gridex.tech/help/` връща новия bundle с BG/EN заглавието и линка
към раздела в документацията. Външният маршрут до `doc.gridex.tech` от
тази Mac машина даде timeout; локалният HTTPS proxy и asset MIME са
проверени успешно. Първият клиентски E2E тест още предстои.

## Публична документация и покани — 2026-09-26

Собственикът потвърди DNS A за `doc.gridex.tech`. Отделният Docusaurus сайт е
изграден в съседната директория `gridex-docs`: BG по подразбиране и EN под
`/en/`. Първата завършена тема е „Организации, покани и права“. Останалите
раздели водят към честна страница „Очаква се да се попълни“, без привидно
завършено съдържание. Глобалният линк „Помощ“ е добавен към заглавието на
всеки frontend екран, без нов елемент в менюто; профилът има линк към
началната страница на документацията. Формата за глобална покана е поставена
преди локалните покани и е стилизирана в съществуващия GrideX стил.

Локално: frontend build, 23/23 unit/render и 42/42 Chromium теста минават;
документационната страница е огледана на 1440px и 390px без преливане.
Публичният docs proxy отвръща локално с доверен TLS и HTTP 200 за BG/EN;
проверката отвън остава. След потвърждението на собственика frontend branch
е публикуван и `main` е обновен fast-forward до `a637320`. GitHub Pages и
Frontend quality завършиха успешно; живият `gridex.tech/customers/users/`
зарежда bundle с `doc.gridex.tech` и текста за непопълнено ръководство.
Предишният отказ за push не бе заобиколен. Изходният код на docs сайта е в
отделен локален Git repo `gridex-docs` (без remote). Първа реална клиентска
покана още не е изпратена или приета. Сертификатът за docs е с ръчно DNS-01
и няма автоматично подновяване; виж `gridex-docs/README.md`.

Повторен Docusaurus build временно показа 404 поради заменена `build/`
директория и стар Docker bind mount. Поправено е със скрипта
`gridex-docs/scripts/deploy-local.sh`: build → recreate само docs контейнера →
локална BG/EN HTTPS проверка. Скриптът е изпълнен успешно. `npm audit` намери
една high build зависимост; override до `serialize-javascript@7.1.2` я
премахна. Остават 17 moderate транзитивни зависимости за отделен преглед.

## Организации, права и първа страница на документацията — 2026-09-26

По последното решение на собственика съществуващият му човешки акаунт е
глобалният администратор и остава администратор на пилотната организация;
служебният setup client не е начин за човешки вход. Нов клиент започва само
с покана от платформата за първия си администратор. След приемане неговият
администратор кани членове само в своя отделен OpenRemote realm, с конкретна
роля и разрешени Обекти. Имейл без приемане не дава членство; member invite
не делегира администраторска роля. Проверява backend, не текст/имейл във UI.

Подготвена е първата публична BG/EN страница за организации и покани в
`docs/ORGANISATIONS_AND_ACCESS.md`, а съществуващата `/help/` е разширена с
обяснение „нужна е покана“, стъпки и обхват. Без нов елемент в менюто, DNS
или претенция, че `doc.gridex.tech` е активен. Допълнен е guide за
`/customers/users/`, като е коригиран старият статус: backend е включен,
но първо реално клиентско изпращане/приемане още не е проверено. Това са
локални промени в branch `feat/empty-site-member-invitations`; frontend push
е бил отказан за предишната отделна поправка и не се заобикаля.

Следва: тест на `/help/` BG/EN на мобилен и desktop; реална първа покана и
междуорганизационен отказ; след разрешено публикуване — проверка на живата
страница. Owner решенията са от текущия GrideX Phase3 разговор; Phase2
потвърждава съществуващата пилотна организация/инвентар. Виж backend
`docs/ORGANISATION_INVITATION_PLAN.md` за границите на правата.

## PR reconciliation checkpoint / Проверка на PR — 2026-09-24

PR #49: latest main incorporated; lint has zero errors and two existing image warnings; Pages build and 41/41 Chromium tests passed locally. GitHub CI/merge remain separate checks. Older PRs #11–#14 and #41 conflict with current code or decision documents; do not overwrite newer navigation, session or inventory work. Reconcile these separately. New-organisation onboarding still requires backend activation and real-user acceptance.

PR #49: последният main е включен; lint без грешки и с две съществуващи image предупреждения; Pages build и 41/41 Chromium теста минаха локално. GitHub CI/merge са отделни проверки. Старите PR #11–#14 и #41 конфликтуват с текущ код или решения; без презаписване на новата навигация, сесии и инвентар. Следва отделно съгласуване. Новите организации още изискват backend активиране и реално потребителско приемане.

## Existing owner clarification / Съществуващ собственик — 2026-09-24

Live backend and Phase2 history confirm `antouan.bg@gmail.com` already
administers active GrideX organisation in `gridex`, including Test Lab/ROCK/ESP.
Global invitations extend this account; they do not require owner onboarding
or a replacement organisation. Existing Keycloak Mailgun REST/BCC is available;
the prior SMTP prerequisite was incorrect. Additional platform binding remains
to be deployed. Existing organisation admin access is not in question.

Собственикът вече е администратор на активната организация GrideX в `gridex`.
Новите глобални покани надграждат този акаунт. Без повторно завеждане на
собственика/организацията. Наличната поща е Mailgun API с BCC, не е нужно SMTP.
Допълнителното глобално право още изисква внедряване.

## Global organisation invitations — 2026-09-24 (staged)

BG: По изричното решение на собственика глобалният администратор остава в
пилотния `gridex` realm. В одобреното подменю `/customers/users/` е
подготвена отделна форма за първия администратор на нова организация. URL
`?realm=<код>` избира само предварително разрешен realm на същия auth origin;
пренасочването при вход пази realm параметъра. Поканеният приема в „Профил“.
Демо не изпраща нищо. Chromium наборът минава 41/41 (включително три fixture
теста за покани), но реално изпращане,
първи вход, роли и изолация на нов realm още не са доказани. Функцията остава
изключена до dedicated master setup client, проверка на наличния Mailgun модул, проверен
owner subject, backend миграция 012 и реално приемане. Не твърди, че е live.

EN: The platform administrator stays in the pilot `gridex` realm. The approved
`/customers/users/` submenu has a separate first-admin invitation form.
`?realm=<slug>` selects only an allowed realm at the configured auth origin;
the login redirect preserves that hint. Acceptance lives in Profile. Demo
sends nothing. The Chromium suite passes 41/41 (including three mocked
invitation tests), but real delivery, first
login, roles and tenant isolation are unverified. Keep disabled until the
dedicated master setup client, existing Mailgun-provider check, verified owner subject, backend
migration 012 and real acceptance are ready. Not a live claim.

## Menu documentation gate / Документация за менюта — 2026-09-24

BG: Собственикът изисква при всяка промяна по меню или подменю едновременно да
се създава/обновява потребителска BG/EN документация и да се записва самото
решение. Правилото е в `AGENTS.md`; планът за всички раздели е в
`docs/USER_DOCUMENTATION_PLAN.md`. За подготвеното, непубликувано подменю
„Потребители и покани“ е създадена чернова
`docs/USERS_AND_INVITATIONS_GUIDE.md`. При публикуването ѝ трябва да се
свърже от вътрешната „Документация“ и да се провери с реални права/екрани.
Това не разрешава нови менюта без отделно одобрение.

EN: Every menu/submenu change must include an updated BG/EN user guide and a
recorded owner decision in the same change. `AGENTS.md` enforces the gate;
`docs/USER_DOCUMENTATION_PLAN.md` tracks coverage. A draft guide now covers
the staged Users & invitations submenu. Link it from in-portal Documentation
and verify against real permissions/UI on publication. This rule does not
grant approval for future navigation changes.

## Realm decision / Решение за realm — 2026-09-24

BG: Собственикът потвърди отделен OpenRemote realm за ВСЯКА нова клиентска
организация; текущият `gridex` е само пилотен. Без промяна към общ realm или
локално активиране без изрично ново одобрение. Глобалната покана през
„Клиенти и договори → Потребители и покани“ остава незавършена, докато
backend реализира и тества multi-realm провизиране, вход и първи администратор.
Подменюто за покани към членове на съществуваща организация е подготвено,
но не е публикувано от този клон.

EN: The owner approved one OpenRemote realm for each new customer
organisation; `gridex` is only the pilot. Never silently switch to a shared
realm or activate local-only organisations. Global invitations need tested
multi-realm provisioning/login and first-admin binding; existing-member UI is
staged but not published from this branch.

## Invitation submenu / Подменю за покани — 2026-09-24 (staged, not live)

BG: По изрично искане на собственика „Клиенти и договори → Потребители и
покани“ има собствен URL `/customers/users/`. Само удостоверен администратор
на организация вижда формата за покана на член с изричен избор на роля и
разрешени Обекти; получателят приема поканата от „Профил“. Демо режим не
изпраща имейли. Глобален администратор ще кани първия администратор на нова
организация от същото място, но тази форма и API още не са включени: чака се
провизирането на отделен OpenRemote realm за новите организации и реален тест с акаунта на
собственика. Никакви организации или права не се създават само във frontend.
Build и два Playwright fixture теста минават; няма доказателство за публикуване
или реален Mailgun/Keycloak тест.

EN: The owner-approved Customers & contracts → Users & invitations submenu
has its own `/customers/users/` URL. An authenticated organisation admin can
select a member role and permitted Sites; recipients accept in Profile. Demo
sends no mail. New-organisation invitations from a global admin remain blocked
pending per-organisation OpenRemote realm provisioning and real owner-account testing. This is
staged code, not a live rollout. Build and two mocked browser tests pass.

## Profile redesign and documentation / Профил и документация — 2026-09-24

Requested: bring Profile into the portal's visual system, remove empty
placeholders and explain every visible setting. Add Documentation inside the
account button and contextual links from Profile. The initial first-party
guide lives at `/help/`; it does not claim the proposed external documentation
domain is live. Full coverage for EVERY existing menu and submenu is a tracked
follow-up in `docs/USER_DOCUMENTATION_PLAN.md`, with fields, permissions,
data provenance, empty/error states and BG/EN acceptance. No main-navigation
structure changed. Verify desktop/mobile, active login, anonymous guide access,
deep-link refresh and actual opt-in persistence before claiming acceptance.

Implementation check: local Pages build and changed-file ESLint passed. The
full Chromium suite passed 38/38, including a new fixture test for signed-in
Profile, saved opt-in after refresh, documentation deep links, anonymous help
and 390px mobile menu/overflow. This is fixture evidence, not acceptance in
the owner's real Keycloak session. `tsc --noEmit` still reports pre-existing
errors in gateway/supported/API worker outside this change. PR #47 merged;
GitHub Pages deployment succeeded. Public `/profile/` and `/help/` returned
HTTP 200. Real-owner Keycloak visual approval remains pending.

По искане на собственика: Профил да следва дизайна на портала, без празни
placeholder-и и с обяснение на всяка настройка. „Документация“ е в бутона на
профила; контекстните линкове водят към първото ръководство `/help/`.
Предложеният външен домейн още не се представя като активен. Документацията
за ВСЯКО съществуващо меню и подменю е задача в
`docs/USER_DOCUMENTATION_PLAN.md`, с полета, права, произход на данните,
празни/грешни състояния и приемане на BG/EN. Главното меню не е променяно.
Проверка: desktop/mobile, реален вход, достъп до помощта без вход, refresh на
дълбок линк и съхранена настройка за имейл.

Проверка: Pages build и ESLint на променените файлове минаха. Пълният
Chromium набор мина 38/38, включително нов fixture тест за Профил с вход,
запазена отметка след refresh, директни линкове, помощ без вход и 390px
мобилно меню/ширина. Това не е проверка с реалната Keycloak сесия на
собственика. `tsc --noEmit` още пада върху стари грешки в gateway/supported/
API worker извън промяната. PR #47 е слят и GitHub Pages внедряването мина;
публичните `/profile/` и `/help/` върнаха HTTP 200. Реалното визуално
одобрение през Keycloak сесията на собственика остава.

## Event email preference and Devices warning / Имейли и знак в „Устройства“ — 2026-09-24

EN update: Profile has one persistent checkbox for email on ALL future event
types, off by default, using the verified identity email. It is not per-incident
approval or a new menu item. Only missed-heartbeat has a connected producer
today; future producers must honor the same preference. The checkbox is hidden
in demo. Backend PR #33 provides the general endpoint and is merged/deployed;
frontend PR #45 merged and GitHub Pages deployment succeeded. Owner-browser opt-in,
cross-Site authorization and a real
outage remain acceptance gates.

BG обновяване: В Профил има един постоянен checkbox за мейли за ВСИЧКИ бъдещи
видове събития. Изключен е по подразбиране и използва потвърдения имейл от backend
идентичността. Това е обща потребителска настройка за всички достъпни Обекти,
не одобрение за инцидент и не ново меню. В демото checkbox не се показва.
Endpoint-ът е в backend PR #33, слят/внедрен. Frontend PR #45 е слят и GitHub
Pages внедряването е успешно.
Засега реален източник има само липсата на heartbeat; бъдещите източници трябва
да проверяват същата настройка.
Приемането изисква реален вход, права между Обекти и истински инцидент.

EN: Published through PR #45, not yet owner-browser verified. In an
authenticated live session the existing Devices nav item polls the scoped
heartbeat API every 10 seconds and shows `!` when an item is offline. No new
menu item, no demo warning, no fabricated offline status on API error. The
same nav item serves desktop and mobile; no responsive layout change. Pages
build and changed-file ESLint passed. Full `tsc --noEmit` still fails on
pre-existing gateway/supported/API worker errors outside this diff. Next: test
signed-in real Site and mobile visibility.

BG: Публикувано през PR #45, но непроверено в браузъра на
собственика. В реална удостоверена сесия съществуващото меню „Устройства“
проверява Site-scoped heartbeat API през 10 секунди и показва `!` при offline.
Няма ново меню, демо предупреждение или измислен offline при API грешка. Един
и същ елемент е за desktop и mobile, без промяна в адаптивното оформление.
Pages build и ESLint на променения файл минаха. Пълният `tsc --noEmit` още
пада върху стари грешки в gateway/supported/API worker извън тази промяна.
Следва проверка с реален Обект и на телефон.

## CPU temperature now reaches history / CPU температурата вече се записва — 2026-09-24

Supersedes the CPU-pending line below. The operator enabled the physical ROCK
thermal sensor; independent OpenRemote TimescaleDB and datapoint API checks
found fresh CPU temperature (21 readings/hour, latest 52.083 °C at check).
The already published Devices UI lists all six configured system metrics and
selects the newest point by timestamp. This is not a real owner-browser
acceptance test: the owner must confirm the CPU row and five other values in
GrideX Test Lab → Devices, including refresh and no stale/demo substitution.

Заменя реда по-долу за чакаща CPU температура. Операторът включи thermal
сензора на физическия ROCK; независими TimescaleDB и OpenRemote datapoint API
проверки намериха пресни CPU стойности (21 измервания/час, последно 52.083 °C
при проверката). Публикуваният екран „Устройства“ изброява и шестте настроени
показателя и избира най-новата точка по време. Това не е реален owner browser
тест: собственикът трябва да потвърди CPU реда и останалите пет стойности в
GrideX Test Lab → Устройства, включително refresh без стари/демо данни.

## ROCK telemetry Devices publication / Публикуване в „Устройства“ — 2026-09-24

Publication update: PR #42 passed lint/build/browser CI (36 browser tests),
merged as `085076190eec05f8dad04638aea5ab8dd3c85b55`, and main Pages run
`35923639360` succeeded. Public `https://gridex.tech/release.json` returned
that exact commit; `/devices/` serves the new bundle. The running backend API
image contains `/history`, and read-only Timescale counts later reached 56 for
each of five physical ROCK metrics. These are publication and data-path
checks, not a real authenticated owner browser check. Owner should open
Devices for GrideX Test Lab and confirm the ROCK values/refresh; CPU
temperature needs the separate physical sensor opt-in and datapoint check.

Публикация: PR #42 мина lint/build/browser CI (36 browser теста), слят е като
`085076190eec05f8dad04638aea5ab8dd3c85b55`, а Pages run `35923639360`
успя. Публичният `https://gridex.tech/release.json` върна същия commit;
`/devices/` сервира новия bundle. Работещият backend API има `/history`, а
Timescale по-късно достигна 56 реални ROCK записа за всеки от пет показателя.
Това доказва публикация и пътя на данните, но не и вход през реален owner
браузър. Собственикът трябва да отвори „Устройства“ за GrideX Test Lab и да
потвърди стойностите/обновяването; CPU температурата изисква отделно физическо
включване на сензора и проверка на datapoint.

The Site-scoped Devices card requests authenticated `/api/v1/sites/{siteId}/history`
and renders only the latest OpenRemote datapoint per metric; no demo fallback.
Backend Timescale has growing physical ROCK data for five metrics, but the
frontend commit was only on `feat/rock-telemetry-ui`, not public `main`. A clean
publication branch from main carries that UI without the unrelated docs commit.
Local Pages/RSC builds, 22 existing tests and lint (zero errors, two old image
warnings) passed; an additional API test covers populated, empty, invalid,
denied and unavailable history. CI/merge/Pages results are recorded above;
real owner browser acceptance remains separate. CPU temperature has no datapoints yet.

Картата в „Устройства“ заявява автентикирано
`/api/v1/sites/{siteId}/history` и показва само последната OpenRemote стойност
за всеки показател, без демо заместител. В Timescale има нарастващи реални
ROCK записи за пет показателя, но frontend commit беше само в
`feat/rock-telemetry-ui`, не в публичния `main`. Чист клон от main носи UI без
несвързания документационен commit. Локалните Pages/RSC build, 22 стари теста
и lint (нула грешки, две стари image предупреждения) минаха; нов API тест
покрива налични, празни, невалидни, отказани и недостъпни данни.
CI/merge/Pages резултатите са по-горе; реалният собственически browser тест
остава отделен. CPU температура още няма datapoints.

## Publication gate / Публикационен блокер — 2026-09-20

Backend a58aebf is pushed in PR #32 and deployed (381dee9a89bb); existing frontend
already receives OR-backed /sites and /hardware without requiring a new bundle.
Frontend 38295b4 is pushed in PR #40. Pages run 35535292127 built successfully
but environment protection REJECTED deployment from feat/routes-session-restoration.
No protection settings changed; no merge performed. New frontend validation/error
messages are NOT public yet. Need owner merge approval for PR #40, then verify
main Pages deployment and public revision. Real owner browser acceptance pending.

Backend a58aebf е в PR #32 и е внедрен (381dee9a89bb); текущият frontend вече
получава OR данни от /sites и /hardware и без нов bundle.
Frontend 38295b4 е в PR #40. Pages run 35535292127 build мина, но environment
защитата ОТКАЗА deployment от feat/routes-session-restoration. Защитата не е
променяна; няма merge. Новите frontend проверки/съобщения още НЕ са публични.
Нужно е owner одобрение за merge на PR #40, после проверка на main Pages
deployment и публичната ревизия. Реалното owner browser приемане предстои.


## OpenRemote-backed frontend inventory / Инвентар за frontend от OpenRemote — 2026-09-20

API DEPLOYED image 381dee9a89bb, private rollback api-inventory-8YeBtP.
GET /sites intersects current GrideX membership with OR user-linked Site assets;
names come from OR. GET /hardware verifies Site/gateway bindings, realm, parent
hierarchy and user-linked assets on every request; gateway name/model/role come
from OR. Local port/configuration data remain execution settings only.
No OR response -> 503; incomplete binding/ownership -> 409; no local-only fallback.
Existing heartbeat transport and configuration editing are unchanged.
Actual owner membership/OR data handler probe returns one accessible pilot and
two verified gateways. Identity was injected into an isolated local handler:
this is NOT a real owner browser/JWT login. No customer data published.
Frontend requires inventorySource=openremote; unavailable/unprovisioned states
hide stale inventory while preserving the session. No menu/layout changes.
Tests: 48 API, 22 frontend unit/render, 4 browser fixture flows PASS. Includes
deep link/refresh/expiry, ownership, no-battery BG/EN, inventory outage/recovery.
Lint has zero errors (two pre-existing image warnings); Pages/RSC builds pass.
Local master auth gate passes; forced-local trusted TLS public issuer/master
denial pass. Normal-DNS external ingress probes from Mac time out; external
owner browser login/expiry and physical temperature remain NOT verified.
Frontend publication result will be recorded after Pages deployment; backend
runtime already serves the compatible OR inventory contract to existing clients.
Next: owner browser acceptance, then generic provisioning/import/update guards;
do not treat this read integration as completion of all legacy write-path debt.

API е ВНЕДРЕН: 381dee9a89bb; частен rollback api-inventory-8YeBtP.
GET /sites пресича текущото GrideX членство с OR Site assets, свързани към
потребителя; имената идват от OR. GET /hardware проверява Site/gateway bindings,
realm, родителите и потребителските връзки при всяка заявка; имена/модели/роли
идват от OR. Локалните портове/конфигурация са само изпълними настройки.
OR отказ -> 503; непълен binding/собственост -> 409; без local-only fallback.
Heartbeat транспортът и редакцията на конфигурации са непроменени.
Пробата с реалните членство/OR данни връща пилотния Обект и два проверени шлюза.
Идентичността е подадена в изолиран локален handler — НЕ е реален owner browser/
JWT вход. Няма публикувани клиентски данни.
Frontend изисква inventorySource=openremote; при отказ/непровизиран ресурс
скрива стария инвентар, без да прекратява сесията. Без промени в меню/оформление.
Минават: 48 API, 22 frontend unit/render и 4 browser fixture сценария, включително
deep link/refresh/expiry, права, BG/EN без батерия и OR отказ/възстановяване.
Lint е без грешки (две стари image предупреждения); Pages/RSC build минава.
Local master auth проверките минават; forced-local trusted TLS public issuer и
забраната за master минават. Normal-DNS ingress от Mac е timeout; външен owner
browser вход/expiry и физическа температура НЕ са потвърдени.
Frontend публикацията ще се запише след Pages deployment; backend вече обслужва
съвместимия OR inventory договор и за текущите клиенти.
Следва owner browser приемане, после общи provisioning/import/update защити.
Това read интегриране не приключва дълга по старите write пътища.


## Pilot inventory reconciled / Пилотен инвентар съгласуван — 2026-09-20

DEPLOYED via supported OpenRemote APIs: pilot Site -> ROCK -> ESP, with the
existing temperature asset reparented under ROCK (same ID/history writer).
All four assets have verified owner links. Owner lacked OR read:assets: granted
that role with restricted_user, NOT unrestricted asset/admin writes. Existing
GrideX administrator membership unchanged. New tokens may be needed to see roles.
Site binding and two gateway bindings are projections of verified OR resources
(migration 009), not independently provisioned inventory. No physical activation,
Ethernet, certificates, MQTT configuration or BESS control changes.
Private backups: inventory-or-XXk1AE before asset creation; inventory-or-ypRcM2
before owner role assignment. Both database dumps passed pg_restore --list;
OR/owner snapshots are private. Final read-back: inventory-or-dHQvbb.
A partial SQL audit failure was corrected; retry reused the same OR IDs.
Eight verification tests + 37 API regression tests PASS; live snapshot validates
hierarchy, owner links, bindings and history writer restricted to its one asset.
Sandbox HTTP tests initially failed EPERM; approved local-port rerun passed.
NOT claimed: owner browser acceptance, physical temperature receipt, or generic
UI/import provisioning enforcement. Those remain pending under the canonical
backend plan. Do not resume local-only bootstrap scripts. Documentation rules
published in backend PR #32, frontend PR #40 and edge PR #20; not merged here.

ВНЕДРЕНО през OpenRemote API: пилотен Обект -> ROCK -> ESP; съществуващият
температурен asset е преместен под ROCK със същия ID/history writer.
Проверени са връзките на четирите assets към собственика. Липсващото OR
read:assets право е добавено с restricted_user, БЕЗ неограничени asset/admin
записи. GrideX администраторското членство е запазено. За новите роли може да
е нужен нов token. Site binding и двата gateway bindings (миграция 009) са
проекции на потвърдени OR ресурси, не отделно провизиран инвентар.
Без физическо активиране, Ethernet, сертификати, MQTT настройки или BESS промени.
Частни backups: inventory-or-XXk1AE преди assets и inventory-or-ypRcM2 преди
owner ролите; двата database dump-а са проверени с pg_restore --list.
OR/owner snapshots са частни; последна проверка inventory-or-dHQvbb.
Поправен е частичен SQL audit отказ; повторението използва същите OR IDs.
8 verification + 37 API regression теста МИНАВАТ; реалният snapshot потвърждава
йерархия, owner links, bindings и writer само до неговия температурен asset.
Първият HTTP тест е блокиран от sandbox EPERM; разрешеното повторение минава.
НЕ са потвърдени: owner browser приемане, физическа температура и универсална
UI/import защита. Те остават задачи по backend плана. Без local-only bootstrap.
Правилата са публикувани в backend PR #32, frontend PR #40 и edge PR #20;
тук не са merge-вани.


## Strategic invariant: OpenRemote-only inventory / Стратегическо правило — 2026-09-20

Owner-confirmed: OpenRemote is the ONLY authoritative place for all operational
inventory, Sites, devices, gateways, sensors and resource relationships. This
applies equally to user actions through the frontend and Codex/operator actions
under owner instructions: create/provision/update resources through supported
OpenRemote APIs, normally orchestrated by the authorized GrideX backend. Never
bypass OpenRemote by SQL, import, scripts, browser storage or a second registry.
Do not expose administrative credentials in the frontend. No local-only resource
may be presented as provisioned. Require verified OR identity, hierarchy,
owner/realm access and durable bindings before success; outages and partial
failures stay pending/failed and must reconcile idempotently.
Local drafts, delivery queues and disposable read projections are allowed ONLY
as workflow data referencing OR or a pending request, never independent inventory.
Device configuration/NVS and certificates are execution artifacts, not a registry.
Keycloak identity and business records are separate concerns. Anonymous demo
fixtures remain explicitly synthetic, never registered customer/live inventory.
This decision supersedes conflicting older local-only provisioning instructions.
Preserve existing data and safety locks; reconcile legacy orphans with backup,
not blind deletion. Canonical plan: backend docs/OPENREMOTE_PROVISIONING_AUTHORITY.md.
Documentation is not runtime enforcement; migration and acceptance remain pending.

Потвърдено от собственика: OpenRemote е ЕДИНСТВЕНОТО основно място за целия
оперативен инвентар, Обекти, устройства, шлюзове, сензори и ресурсните им връзки.
Правилото важи еднакво за потребителя през frontend и за Codex/оператор по
инструкции на собственика: създаване/провизиране/обновяване през поддържаните
OpenRemote API, обичайно чрез GrideX backend с проверени права. Без заобикаляне
чрез SQL, import, скриптове, browser storage или втори регистър. Без admin тайни
във frontend. Local-only ресурс не се показва като провизиран. Успех изисква
проверени OR идентичност, йерархия, собственик/realm права и устойчив binding;
отказите остават pending/failed и се съгласуват идемпотентно.
Локални чернови, опашки и възстановими проекции за четене са допустими САМО като
данни за процеса с връзка към OR или чакаща заявка, никога независим инвентар.
Device конфигурации/NVS и сертификати са изпълними настройки, не регистър.
Keycloak идентичности и бизнес записи са отделни. Анонимното демо остава ясно
синтетично, не регистриран клиентски/live инвентар.
Решението отменя противоречащи стари инструкции за local-only provisioning.
Пази данните и safety locks; съгласувай наследените записи с backup, без сляпо
изтриване. Каноничен план: backend docs/OPENREMOTE_PROVISIONING_AUTHORITY.md.
Документацията не е runtime защита; миграцията и приемането предстоят.


## Current backlog / Актуален план — 2026-09-20

See [CURRENT_BACKLOG](docs/CURRENT_BACKLOG.md): I18N-01 ten-language localisation
is recorded for future implementation, with acceptance criteria and open language/
provider choices. Consolidated remaining work distinguishes implemented heartbeat
from pending sensor telemetry and supersedes historical frontend publication TODOs.
Documentation only; no runtime/provider changes. Next recommended: Devices real-data
acceptance, then ROCK temperature end-to-end; locale work remains explicitly planned.

Виж [CURRENT_BACKLOG](docs/CURRENT_BACKLOG.md): записана I18N-01 за десет езика,
приемателни критерии и избори за езици/доставчик. Списъкът отделя готов heartbeat
от оставащите сензори и отменя старите frontend TODO за публикация. Само документация.
Предложена следваща стъпка: приемане на Устройства, после температурата на ROCK.

## Demo cleanup / Изчистване на демо екрана — 2026-09-20

Owner accepted swipe navigation and requested removal of the repeated heading
Demo badge and Overview representative-data switch. Removed both from demo
screens; live status/configuration display is preserved. The explanatory demo
notice remains, with a full-width 44px Sign in button on phones. Existing PKCE
handler unchanged. Eight BG/EN browser cases cover 360/390/430/1280px, absence
of removed controls, visible CTA and redirect to a mocked identity provider.
22 unit/render tests pass, including live null battery/SOC states. Public
deployment evidence belongs in PR; owner physical-phone acceptance remains.

Собственикът прие плъзгащото меню. Премахнати са горният етикет Демо от всички
екрани и блокът с представителни данни/превключвател в демо Преглед. Live
статусът е запазен. Пояснението за демо остава, а Вход на телефон е на отделен
ред с височина поне 44px. PKCE логиката е непроменена. Осем BG/EN браузърни
теста проверяват четири размера и пренасочване към mock identity provider.
22 unit/render теста минават. Остава приемане на реален телефон; deployment в PR.

## Mobile swipe navigation / Мобилна плъзгаща навигация — 2026-09-20

Owner requested three visible section tiles with horizontal finger scrolling
through every existing destination. Implemented native overflow/touch scrolling
with snap points; Menu remains fixed for expanded hierarchy/account access.
Active section is revealed on route change, refresh, menu close and resize.
Desktop, menu order/labels and auth behavior remain unchanged. Added touch
gesture and all-destination tests at 360/390/430 px. Browser emulation does not
replace physical phone acceptance; owner should verify swipe feel on their phone.
Publication evidence is recorded in the implementation PR.

По изрично искане: три видими раздела и хоризонтално плъзгане с пръст между
всички съществуващи екрани. Бутонът Меню остава фиксиран за пълната йерархия
и акаунта. Активният раздел се показва при навигация, refresh, затваряне на
менюто и resize. Desktop, редът/имената и сесиите не са променяни. Добавени
touch/навигационни тестове на 360/390/430 px. Остава приемане на физически
телефон от собственика; публикацията се проследява в PR.

## Approved submenu presentation / Одобрен дизайн — 2026-09-20

Implemented owner-approved desktop and expanded-phone hierarchy: indented
children, thin connectors, light-green active child and subtle active parent.
No menu labels/order/relationships changed. Header shows linked parent → current
section, Site below and explicit Demo label. Links preserve route/mode and native
new-tab behavior. Session/auth logic is unchanged. Added 390/1280 browser tests
for hierarchy, parent links, refresh, long headings and overflow; updated translated
heading expectations. Publication/CI evidence belongs in the implementation PR.
Remaining: owner visual acceptance; earlier infrastructure gates remain unchanged.

Внедрен е одобреният дизайн за desktop и отвореното меню на телефон: отстъпи,
свързващи линии, светлозелено активно подменю и отличим родител. Няма промяна
в имената, реда или структурата. Заглавието показва родител → раздел с линк,
Обекта отдолу и знак Демо. Сесиите не са променяни. Добавени са браузърни
проверки на 390/1280 px за йерархия, линкове, refresh и дълги заглавия.
Остава визуално приемане от собственика; публикацията/CI се проследяват в PR.

## Session lifecycle audit / Проверка на жизнения цикъл на сесиите — 2026-09-20

Found and corrected: logout was not propagated to other tabs; some final 401s
left backend-online/private component state alive; the periodic check refreshed
tokens without rereading backend roles/Site grants; retry responses skipped the
API-restart handler. Local session termination now clears the client/token and
private UI, stops polling and rejects late auth results. Logout publishes only
a random non-secret invalidation signal; never tokens. Same-origin tabs react
immediately when storage events are delivered. Failed IdP logout is not reported
as successful. Role changes remount private sections to discard cached views.

While authenticated: one in-flight verification at a time; `/me` and `/sites`
checked every 20 seconds, plus focus/visible/online/pageshow. Browser throttling
can delay background checks. Definitive 401/403 or removed selected Site clears
the session UI; network/5xx errors retain identity and show verification failure.
Token-refresh waits are bounded by backendTimeoutMs (1–15 seconds); requests do
not send expired tokens after a failed refresh. Reads retry once, writes never.
Restart-required is handled on both initial and retried responses.

Evidence: 22 unit/render pass including EN/BG null-battery; targeted browser
cross-tab/logout and role/Site-revocation tests pass. Full 23-case browser suite
passes. Local auth gate passes; normal-DNS public checks still time out from Mac
(pre-existing limitation). Final role-remount rerun and PR/Pages are delivery gates.
No backend, session-lifetime, menu, Ethernet, MQTT or device changes.
Remaining acceptance: real owner multi-tab/mobile resume and prolonged offline
recovery; remote IdP revocation is bounded by token refresh/expiry, NOT instant
server introspection. A blocked/hung underlying SDK refresh can require reload
after connectivity recovers; UI waits time out safely. No perpetual perfect-session
claim. This is client-session checking, not a scheduled external uptime monitor.

Открити и поправени: logout не се разпространяваше към другите табове; някои
окончателни 401 оставяха backend-online/частния UI; таймерът обновяваше токена,
без backend роли/Обекти; повторният GET пропускаше restart-required обработката.
Прекратяването чисти client/token и частния UI, спира polling и отхвърля закъснели
auth резултати. Logout публикува само случаен не-секретен сигнал, никога токени.
Табовете от същия origin реагират при storage event. Неуспешен IdP logout не се
обявява за успешен. Смяна на роля презарежда частните компоненти без стар cache.

След вход: една активна проверка; `/me` и `/sites` на 20 секунди и при
focus/visible/online/pageshow. Браузърът може да забави фоновите проверки.
Окончателен 401/403 или отнет избран Обект чисти сесийния UI; network/5xx пази
идентичността и показва неуспешна проверка. Token refresh изчаква ограничено
backendTimeoutMs (1–15 секунди); след неуспех не се праща изтекъл токен.
GET се повтаря веднъж, записи никога. Restart-required се обработва и след retry.

Доказателства: 22 unit/render минават, включително EN/BG null-battery; целевите
browser тестове за cross-tab/logout и отнети роли/Обекти минават. Всичките 23
browser сценария минават. Local auth gate минава; normal-DNS public проверките
от Mac още са timeout (старо ограничение). Финален role-remount rerun и PR/Pages
са проверките преди публикация.
Без backend, срок на сесия, меню, Ethernet, MQTT или device промени.
Остава реално owner multi-tab/mobile resume и продължителен offline тест; remote
IdP revoke се открива при refresh/expiry, НЕ чрез незабавна server introspection.
При блокирал SDK refresh може да трябва reload след възстановяване на връзката;
UI изчакването прекъсва безопасно. Не обещаваме безкрайна/перфектна сесия.
Това е проверка на клиентската сесия, не външен планиран uptime монитор.

## Approved menu baseline and separate Demo / Одобрено меню и отделно Демо — 2026-09-20

Implementation update: `/demo/*` is now implemented with static Pages entries.
First-time visitors to Home (no remembered live session and no OIDC callback)
enter `/demo/` immediately, without API/identity requests. Remembered live
sessions and callbacks stay on the live restoration path. Explicit live URLs
never fall back to demo on error/expiry. Demo sign-in returns to live Home;
Live→Demo→Live preserves the prior URL and Site/device query in session storage,
never tokens. Demo has the existing synthetic screens; their controls do not
call real provisioning APIs. Build creates a static file for every demo section.
Tests: 21 browser cases and 21 unit/render cases passed; mobile screenshot reviewed.
Final return-link refinement passed a separate 3-case targeted rerun. Mandatory
auth gate: local master/admin/form pass; normal-DNS public checks still time out
from Mac (pre-existing, not proof of external availability). Lint: no errors,
two pre-existing image warnings. Publication/owner browser acceptance pending
until the PR/Pages result; no backend, MQTT or Ethernet configuration changes.

Актуална реализация: `/demo/*` вече е реализирано със статични Pages входове.
Нов посетител на Начало (без запомнена live сесия и без OIDC callback) влиза
веднага в `/demo/`, без API/identity заявки. Запомнените сесии/callback остават
в реалния SSO поток. Изричните live URL не стават демо при грешка/изтичане.
Входът от Демо връща реалното Начало; Live→Demo→Live пази предишния URL и
Обект/device query в session storage, никога токени. Демо ползва наличните
примерни екрани; контролите не викат реални provisioning API. Build генерира
статичен файл за всеки демо раздел. 21 browser и 21 unit/render теста минаха;
проверена е mobile снимка. Финалният return-link мина 3 отделни повторни теста.
Auth gate: local master/admin/form минават; normal-DNS public проверките от Mac
още са timeout (стар проблем, не доказва външна достъпност).
Lint: без грешки, две стари image предупреждения. Публикацията/owner приемането
чака PR/Pages резултата. Без backend, MQTT или Ethernet промени.

### English — canonical structure

Owner-approved baseline, not permission for later unsolicited menu changes.
Paths below match `app/lib/routes.ts`; hierarchy matches `app/page.tsx`.

```text
Overview (Home)                  /
Customers                       /customers/
Sites                           /sites/
  Assets                        /assets/
  Battery                       /battery/
  Flexible loads                /loads/
Market                          /market/
  Settlement                    /market/settlement/
  Balancing                     /market/balancing/
Automation                      /automation/
  Schedules                     /automation/schedules/
Devices                         /devices/
  Supported devices             /devices/supported/
Alarms                          /alarms/
Reports                         /reports/
Settings                        /settings/
  Subscription                  /settings/subscription/
About                           /about/
Separate Demo section           /demo/                  [planned]
Account: Profile / Sign in      /profile/ /login/
Language selector               below Sign in/account
```

For an authorized selected Site, assets/battery/loads/automation/schedules/devices
use `/sites/{siteId}` followed by their path, e.g. `/sites/{siteId}/devices/`.
Device selection uses `?device={deviceId}`. IDs in a URL never grant access.
Site selection belongs in Sites, device setup and connectivity in Devices;
no separate Edge gateway entry. No top-right language/status/Site/bell controls.
Every section/subsection has a real hyperlink: direct entry, refresh, Back/Forward
and new tabs must preserve the section and permitted context. Live routes restore
valid SSO; only the approved logout/revocation/restart/release policy requires login.

Owner clarification: KEEP the demo site as a separate, explicitly selected
section with demo data and hyperlinks, not as an automatic fallback of the live
portal. Planned namespace: `/demo/` for demo Overview; prefix the corresponding
section paths, e.g. `/demo/sites/`, `/demo/devices/`, `/demo/market/settlement/`.
Preserve the same approved hierarchy and existing demo fixtures. No customer
inventory, private addresses, live telemetry or real control/provisioning/email
writes in Demo. Demo must work without login or a backend and be clearly labelled.
Demo browsing must not clear an existing live session or overwrite its selected
Site/device. Signing in/returning to Live loads only authorized real data; checking,
empty, expired, denied and unavailable live states never become demo data.

Original planning status (superseded by implementation update above): isolated
public `/demo/*` was a new recorded requirement, not yet implemented.
Next task: implement namespace + isolated demo state/data source and static Pages
entries (direct demo URLs must return HTTP 200, not depend on the private 404 shell).
Acceptance: EN/BG, desktop/mobile, every demo link/direct refresh/history/new tab,
anonymous/offline demo, authenticated Live→Demo→Live with session/context preserved,
no live-data leakage or write requests, and no demo fallback on live API/auth errors.

### Български — същата структура и правила

Одобрена основа, не разрешение за бъдещи непоискани промени в менюто.
URL са от `app/lib/routes.ts`, йерархията е от `app/page.tsx`.

```text
Преглед (Начало)                 /
Клиенти                         /customers/
Обекти                          /sites/
  Активи                        /assets/
  Батерия                       /battery/
  Управляеми товари             /loads/
Пазар                           /market/
  Сетълмент                     /market/settlement/
  Балансиране                    /market/balancing/
Логика и режими                  /automation/
  Графици                       /automation/schedules/
Устройства                      /devices/
  Поддържани устройства          /devices/supported/
Аларми                          /alarms/
Отчети                          /reports/
Настройки                       /settings/
  Абонамент                     /settings/subscription/
За нас                          /about/
Отделен раздел Демо              /demo/                  [планиран]
Акаунт: Профил / Вход            /profile/ /login/
Избор на език                    под Вход/акаунта
```

При избран разрешен Обект assets/battery/loads/automation/schedules/devices
използват `/sites/{siteId}` пред своя път, например `/sites/{siteId}/devices/`.
Устройството се избира чрез `?device={deviceId}`. ID в URL не предоставя права.
Обект се избира в Обекти, настройките и свързаността на устройствата са в
Устройства; без отделен Edge шлюз. Без език/статус/Обект/камбанка горе вдясно.
Всеки раздел/подраздел има истински линк: директен вход, refresh, Back/Forward
и нов tab пазят раздела и разрешения контекст. Live възстановява валидна SSO
сесия; нов вход се иска само по одобрената logout/revocation/restart/release политика.

Уточнение на собственика: демо сайтът СЕ ЗАПАЗВА като отделен изрично избран
раздел с демо данни и линкове, не като автоматичен fallback на реалния портал.
Планирано: `/demo/` за демо Преглед; префикс пред съответните пътища, например
`/demo/sites/`, `/demo/devices/`, `/demo/market/settlement/`. Същата одобрена
йерархия и наличните демо fixtures. Без клиентски inventory, частни адреси,
жива телеметрия или реални control/provisioning/email записи. Демо работи без
вход/backend и е ясно обозначено. Не изтрива live сесия и не променя избраните
реални Обект/устройство. Вход/връщане към Live зарежда само разрешени реални данни;
checking/empty/expired/denied/unavailable състоянията никога не стават демо данни.

Първоначален план (заменен от актуалната реализация по-горе): изолираното
публично `/demo/*` е било ново записано, още нереализирано изискване.
Следва: namespace + изолиран демо state/data source и статични Pages входове
(директните демо URL да са HTTP 200, без зависимост от частния 404 shell).
Приемане: EN/BG, desktop/mobile, всички демо линкове/direct refresh/history/new tab,
anonymous/offline демо, Live→Demo→Live след вход със запазени сесия/контекст,
без изтичане на live данни/реални записи и без демо fallback при API/auth грешки.

## Routes and session restoration / URL и възстановяване на сесия — 2026-09-20

UPDATE: owner confirmed 365-day Remember Me; backend helper now APPLIED with
private rollback. API dd06bf203540 healthy, restart gate enabled; 31 backend tests
and actual temporary PKCE login pass. Local auth/forced-local trusted TLS checks
pass; normal-DNS public auth from Mac times out. Previous blocked status below
is historical. Owner browser refresh/reopening/logout acceptance still pending.
Frontend routes/session implementation remains PR #32; this follow-up changes
documentation only. Dynamic private Site URLs retain Pages HTTP-404-shell caveat.

АКТУАЛНО: собственикът потвърди 365-day Remember Me; helper вече е ПРИЛОЖЕН с
частен rollback. API dd06bf203540 healthy, restart gate включен; 31 backend теста
и реален временен PKCE вход минават. Local auth/forced-local TLS проверките
минават; normal-DNS public auth от Mac е timeout. Предишният blocked статус е
исторически. Owner browser refresh/reopening/logout приемането предстои.
Frontend реализацията остава PR #32; тук се променя само документация.
Динамичните частни Site URL запазват ограничението Pages HTTP-404-shell.

Deployment evidence: PR #32 merged; Pages 35495986528 succeeded, release
1f24bad49a15a60a82b536168a6e3ee6a24b375e confirmed via public release.json.
/devices/, /market/, /settings/ return 200. Exact PR CI passed; final layout
parity rerun passed (7 browser cases), complete suite 19, unit/render 21.
Backend companion PR #30 merged as 801ec1d, NOT deployed/enabled. Runtime
Remember Me/session-lifetime helper was rejected BEFORE execution by safety
review: requires explicit owner approval of the 365-day duration. No runtime
env/realm change occurred. Do not retry indirectly or claim persistent-browser
Remember Me enabled. Ask owner to choose/approve duration, then apply rollback
helper and deploy API gate. Ordinary refresh SSO fix IS published. Real owner
refresh/reopening acceptance remains pending; fixture tests are not that proof.

Публикация: PR #32 е слят; Pages 35495986528 мина, публичният release.json е
1f24bad49a15a60a82b536168a6e3ee6a24b375e. /devices/, /market/, /settings/ връщат
200. CI за точния PR мина; style parity повторението е 7 browser теста, целият
пакет 19, unit/render 21. Backend PR #30 е слят като 801ec1d, НЕ е внедрен/
активиран. Helper за Remember Me/срока е отказан ПРЕДИ изпълнение от safety
review: нужно е изрично owner одобрение за 365 дни. Няма env/realm промяна.
Без косвен повторен опит или твърдение за активно запомняне след браузър рестарт.
Следва потвърждение на срока, rollback helper и API gate deployment. SSO поправката
при обикновен refresh Е публикувана. Owner приемането предстои; fixtures не го доказват.

Owner-approved navigation now uses real links and ordered child sections; Home
is Overview. Site-scoped paths, history and session-only selected Site context;
foreign Site links do not silently select another Site. Top-level Keycloak SSO
restores existing sessions without iframe cookies; only non-secret release and
return-path hints are stored, never tokens. A changed frontend release prompts
fresh login; API restart policy uses signed auth_time and requires fresh login.
Root callback remains unchanged to preserve the existing OIDC allowlist.
Automatic demo fallback is removed (explicit demo config remains for fixtures).
Pages emits static section index files plus a noindex 404 shell for dynamic
private Site URLs: direct deep links render but retain HTTP 404 on GitHub Pages.
Public indexable content needs dedicated static pages; private inventories are
not SEO content. Real Remember Me was disabled with 24h session lifetime.
Backend helper enables it from the single env, bounded to 365 days, with rollback.
Tests: 31 backend, 21 frontend unit/render, 19 browser fixtures; final visual
style parity correction needs rerun. Not deployed/owner-accepted yet. Outstanding:
real account refresh/new tab/logout, restart/release re-login; normal-DNS auth
reachability; optional future hosting rewrite for HTTP 200 dynamic routes.
ROCK temperature and sensor metrics remain a separate unfinished task.

Одобрената навигация използва линкове и групирани подраздели; Начало е Преглед.
Site URL, history и session-only избран Обект; чужд URL не избира мълчаливо друг
Обект. Top-level Keycloak SSO възстановява сесията без iframe cookies; пазим само
release/return-path подсказки, не токени. Нова frontend версия изисква пресен
вход; API restart политиката проверява подписания auth_time. Root callback е
запазен за съществуващия OIDC allowlist. Няма автоматичен демо fallback.
Pages генерира статични index файлове и noindex 404 shell за частните динамични
Site URL: екранът работи, HTTP статусът при директен вход остава 404 на Pages.
Публичното SEO съдържание изисква отделни статични страници, не частен inventory.
Реалното Remember Me е било изключено при 24h сесия. Backend helper го включва
от единния env с максимум 365 дни и rollback. Проверки: 31 backend, 21 frontend
unit/render, 19 browser fixtures; последната style parity поправка чака повторен
тест. Още не е внедрено/прието. Остават реален refresh/нов tab/изход, restart/
release re-login, normal-DNS auth и евентуален hosting rewrite за динамични 200.
Температурата и сензорите на ROCK остават отделна незавършена задача.

## Imported device status correction / Поправка на внесения статус — 2026-09-20

Validation: 21 unit/render tests (including EN/BG null-battery), 6 browser tests,
an additional automatic-poll regression and full GitHub CI pass. Lint has only
two pre-existing image warnings. PR #31 merged as 0dbffca; Pages run 35494308660
is the publication gate. Tests use fixtures; physical DB counter independently
advanced 15437 → 15977. Pages succeeded; public HTML serves main-Bvd6vg18.js
and the new device-information-CX4clWV1.js text was fetched successfully.
Owner browser acceptance and temperature remain pending.

Проверки: 21 unit/render теста (вкл. EN/BG без батерия), 6 browser теста,
допълнителен automatic-poll regression и целият GitHub CI минават. Lint има само
две стари image предупреждения. PR #31 е слят като 0dbffca; Pages run 35494308660
е проверката за публикация. Тестовете са с fixtures; реалният DB брояч отделно
нарасна 15437 → 15977. Pages приключи успешно; публичният HTML зарежда
main-Bvd6vg18.js, новият текст от device-information-CX4clWV1.js е проверен.
Owner browser приемането и температурата предстоят.

The imported-configuration panel hardcoded connectivity as unverified even while
the separate heartbeat panel received live data. It now shares the same polled
status, including empty, stale, denied and unavailable responses. No menu,
layout, authentication or hardware changes. Real database receipt at 06:20 UTC:
ROCK 06:20:47, ESP contact 06:20:53, counter 15437. This proves ingestion at that
instant, not owner-browser acceptance. Pages publication and owner acceptance
must be verified separately. Temperature/sensor metrics remain UNIMPLEMENTED;
next extend ROCK payload, backend storage/API and existing Devices display,
then deploy ROCK and verify actual readings. Never substitute sample values.

Панелът за внесена конфигурация показваше постоянно непотвърдена връзка дори
при живи heartbeat данни в отделния панел. Вече споделя същия обновяван статус,
включително празен/остарял/отказан/недостъпен отговор. Без меню, оформление,
auth или hardware промени. Реална база към 06:20 UTC: ROCK 06:20:47, ESP контакт
06:20:53, брояч 15437. Това доказва получаване тогава, не owner-browser приемане.
Публикация и приемане се проверяват отделно. Температурата/сензорите още НЕ СА
реализирани: следват ROCK payload, backend база/API, текущият Devices екран,
внедряване на ROCK и проверка на реални измервания. Без примерни заместители.

## Approved dual transport plan / Одобрен план за два транспорта — 2026-09-19

Owner approval recorded for per-Site WireGuard-private OR direct MQTT-mTLS.
Canonical execution checklist: backend docs/PER_SITE_TRANSPORT_AND_ENROLLMENT.md
on branch docs/per-site-transport. Twelve TODO items cover contract, persistence,
existing broker/worker, ingress, certificate lifecycle, first-boot claim, approved
configuration application, UI, signed firmware, ROCK-initiated ESP OTA, fleet
operations and end-to-end release acceptance. No new menu; no SSH requirement.
This change is documentation only: no listener, runtime env, migration, device
or router changed. Next: versioned transport contract, then persistence/worker.
Heartbeat implementation is merged; physical delivery still needs acceptance.

Записано е одобрение за избор по Обект: WireGuard-private ИЛИ direct MQTT-mTLS.
Каноничният план е backend docs/PER_SITE_TRANSPORT_AND_ENROLLMENT.md в branch
docs/per-site-transport. 12 TODO задачи: договор, база, broker/worker, входове,
сертификати, first-boot claim, одобрено прилагане, UI, подписан firmware, ESP OTA
от ROCK, управление на много обекти и end-to-end приемане. Без ново меню и SSH
зависимост. Само документация: без listener/env/миграция/device/router промени.
Следва versioned transport договор, после база/worker. Heartbeat кодът е слят;
физическата доставка още изисква приемане.

## Merge compatibility check / Проверка преди merge — 2026-09-19

Owner approved merging the current PRs. Added fail-closed handling of malformed
heartbeat responses and an explicit heartbeat fixture in the navigation suite.
The previous failing PR run is historical, not evidence of a live login outage.
New local results: 18 browser tests and 3 API-client tests pass; Pages build passes.
These are fixture tests, not physical MQTT receipt or owner-account acceptance.

Собственикът одобри актуалните PR-и. Добавени защитена обработка на невалиден
heartbeat отговор и изричен fixture в навигационния тест. Старият неуспешен PR
run не доказва текущ проблем с live входа. Нови локални резултати: 18 browser
и 3 API теста минават, Pages build минава. Това не е реален MQTT receipt или
приемане с акаунта на собственика.

## Device heartbeat display / Heartbeat в Устройства — 2026-09-19

Devices separately shows last backend-received ROCK message and last successful
ESP contact observed by ROCK, plus ESP counter. Authenticated Site-scoped polling
every 10s, cancelled on unmount/Site change; errors clear live status, no demo.
No navigation/login/CSS changes. API client tests (3) and Pages/Vinext builds pass.
Not published; needs backend device-heartbeats endpoint/migration and real MQTT
delivery first. Actual populated/empty/denied/unavailable browser flow and owner
account acceptance remain pending; API tests are fixtures, not real delivery.

Устройства показва отделно полученото в backend ROCK съобщение, последния
успешен ESP контакт през ROCK и ESP брояча. Удостоверен Site polling през 10s,
отменен при смяна/напускане; при грешка няма live статус или демо заместител.
Без промени по меню/вход/CSS. 3 API теста и Pages/Vinext builds минават.
Не е публикувано; нужни са backend endpoint/миграция и реален MQTT receipt.
Browser populated/empty/denied/unavailable и owner приемане предстоят.
## SRS implementation plan / Проверим план по спецификацията — 2026-09-19

Owner-requested point-by-point comparison is in
[SRS_VERIFIABLE_PLAN.md](docs/integration/SRS_VERIFIABLE_PLAN.md).
All 32 source subsections plus chapter 12 commissioning are mapped: 33 items,
each with evidence, gap and acceptance gate. G0–G7 define dependencies and
DOC-01 follows verified features. No complete SRS requirement is accepted by
this review; existing component work is explicitly retained as partial evidence.
Local source revisions and dirty changes are recorded; remote main/runtime were
not revalidated. Backend activation adapter/migration remain uncommitted WIP,
not deployed proof. Next: G0 reconcile the SRS with approved architecture, then
G1 read-only end-to-end telemetry acceptance before physical control.
Validation: section coverage, EN/BG parity, evidence paths and diff check.
No source document, product UI, backend runtime, device or network changes.

По искане на собственика е добавено сравнение точка по точка в свързания план.
Всички 32 подраздела и commissioning от глава 12: 33 позиции с доказателство,
липса и приемателен тест. G0–G7 описват зависимости, DOC-01 следва проверените
функции. Няма прието изцяло SRS изискване от този преглед; съществуващата работа
е запазена като частично доказателство. Записани са локални ревизии и dirty
промени; remote main/runtime не са проверявани отново. Backend адаптерът и
миграцията за активация остават непубликуван WIP, не доказано внедряване.
Следва G0 съгласуване с архитектурата, после G1 read-only телеметрия от край
до край преди физическо управление. Проверки: покритие, EN/BG, evidence пътища
и diff check. Без промяна на Word документа, UI, runtime, устройства или мрежа.

## DOC-01 — Documentation portal / Портал за документация — 2026-09-19

### Owner-selected structure reference / Избран структурен пример

Reference inspected on 2026-09-19:
https://docs.eniris.com/en/Controller/External%20Signals/DSO/poland
The rendered HTML exposes a nested topic tree, search and language controls,
breadcrumbs, article contents, previous/next pages and a last-updated date.
Use these navigation patterns for the DOCUMENTATION portal, not the product
menu. This is structural inspiration, not permission to copy articles, images,
branding or assume Eniris capabilities/compliance exist in GrideX. Docusaurus
remains our proposed implementation; the reference's underlying engine is not
an architectural requirement.

Proposed GrideX documentation hierarchy (EN / BG):

```text
Start here / Първи стъпки
  Quick start; demo vs live; commissioning checklist / Бърз старт; демо и реални данни; приемателен списък
Portal and accounts / Портал и акаунти
  Invitations and login; organisations and roles; Sites / Покани и вход; организации и роли; Обекти
Controller and devices / Контролер и устройства
  Architecture and safety / Архитектура и безопасност
  Installation → wiring, network, prerequisites / Инсталация → свързване, мрежа, изисквания
  Configuration → discovery/import, roles, draft, approval, acknowledgement, rollback / Конфигурация → откриване/импорт, роли, чернова, одобрение, потвърждение, връщане
  Devices → ROCK Pi, ESP32, supported drivers / Устройства → ROCK Pi, ESP32, поддържани драйвери
  External signals → market prices; DSO → country → operator / Външни сигнали → пазарни цени; DSO → държава → оператор
Telemetry and monitoring / Телеметрия и наблюдение
  Heartbeat; offline; journal and recovery; alarms / Heartbeat; офлайн; журнал и възстановяване; аларми
Energy strategies / Енергийни стратегии
  Day-ahead prices; battery cycle cost; operating limits / Цени ден напред; цена на цикъла; работни ограничения
Integrations and API / Интеграции и API
  Authentication; contracts; MQTT/TLS; WireGuard boundaries / Удостоверяване; договори; MQTT/TLS; граници на WireGuard
Diagnostics and support / Диагностика и поддръжка
  Symptoms; safe checks; test results; support checklist / Симптоми; безопасни проверки; резултати; данни за поддръжка
Releases and reference / Издания и справочници
  Changelog; compatibility matrix; glossary / Промени; матрица за съвместимост; речник
```

Article template: purpose and feature status → supported models/firmware and
required role → prerequisites and safety → data/control path → numbered setup
steps → expected result and verification → failure/timeout behaviour → rollback
→ troubleshooting → authoritative references, owner and last verification date.
Use GrideX-specific diagrams/tables and clearly distinguish warnings from notes.
Every device/driver page records tested model, firmware, protocol, read/write
support and actual acceptance evidence. Unknown compatibility is not support.
Country/DSO branches are future scaffolding: publish technical requirements only
after checking the relevant operator's primary specification and project approval;
do not import the Polish example's claims or activate physical control.

Implementation acceptance: stable /en/ and /bg/ paths; nested sidebar, breadcrumbs,
in-page contents and previous/next links; searchable public pages; accessible
mobile navigation. No product-menu changes. Preserve private-content boundaries
below. Next action: approve platform/repository, then implement this docs skeleton
and the first verified onboarding/device guides. Status remains planned only.

Примерът е прегледан на 2026-09-19 чрез HTML: тематично дърво, търсене, език,
път до страницата, съдържание, предишна/следваща страница и дата на обновяване.
Тези модели са за ДОКУМЕНТАЦИЯТА, не за менюто на продукта. Не копираме статии,
изображения или марка и не приемаме възможностите/съответствието на Eniris за
налични в GrideX. Docusaurus остава предложението; технологията на примера не е
изискване. Двуезичното дърво по-горе е предложената адаптация за GrideX.

Шаблон на статия: цел и статус → модели/firmware и необходима роля → изисквания
и безопасност → път на данни/команди → номерирани стъпки → очакван резултат и
проверка → поведение при отказ/timeout → връщане назад → диагностика → първични
източници, отговорник и дата на проверка. Собствени диаграми/таблици, ясно отделени
предупреждения. За драйвер: тестван модел, firmware, протокол, четене/запис и
доказателства от приемане. Неизвестна съвместимост не означава поддръжка.
Държава/DSO е бъдеща структура: технически изисквания се публикуват след проверка
на първичната спецификация на оператора и проектно одобрение. Не пренасяме
твърденията от полския пример и не активираме управление на оборудване.

Приемане: стабилни /en/ и /bg/ адреси; вложено меню, път до страницата, съдържание
и предишна/следваща; търсене само в публичните страници; достъпна мобилна навигация.
Без промени в продуктовото меню и без нарушаване на частните граници по-долу.
Следва одобряване на платформата/хранилището, после реализация на тази структура
и първите проверени ръководства за начало/устройства. Статус: само планирано.

Status: planned, not implemented. Owner requests a separate documentation site
at `doc.gridex.tech` (explicitly approved public hostname). Recommendation:
**Docusaurus**, an open-source docs-as-code platform, with Markdown/MDX in Git,
reviewed PRs and a separate GitHub Pages deployment. No new backend container,
database or router port is needed for this static public documentation.

Next steps and acceptance criteria:
1. Confirm Docusaurus and a separate documentation repository (proposed name:
   `gridex-docs`); pin a supported release and dependencies when implementing.
2. Write matching EN/BG guides: quick start; demo versus signed-in mode; email
   invitations, registration and recovery; organisations, roles and site access;
   Sites/Devices; ROCK Pi → ESP32 provisioning and draft → approval → device
   acknowledgement; telemetry/offline states; troubleshooting and support.
   Describe only verified behaviour as available; label planned features clearly.
3. Add public architecture/API reference with sanitised examples. Keep internal
   runbooks, real device inventories/addresses, backups and secrets out of public
   source, generated assets and search indexes. Private docs need separate access
   control; hiding navigation or using robots.txt is NOT protection.
4. Implement GrideX styling, responsive reading, language navigation and search
   (evaluate a maintained local search integration). Add release versions when
   stable product releases exist, plus last-reviewed revision and page ownership.
5. Publish separately through CI: build, broken-link checks, secret/content
   review and desktop/mobile reading/search tests. Configure the custom domain,
   DNS and trusted HTTPS only during the approved implementation. Do not change
   the existing product Pages domain or add product menu items without approval.
6. Accept only after external HTTPS access, EN/BG navigation/search, onboarding
   walkthrough and absence of private data are checked. Record deployment SHA,
   evidence, rollback and unfinished chapters in HANDOFF. Future feature PRs
   must update their affected documentation or explicitly track the missing work.

Blocker: platform/repository choice and implementation remain to be approved;
this task only records the proposal. No DNS, deployment or menu changes made.
Sources: https://docusaurus.io/docs/deployment,
https://docusaurus.io/docs/i18n/introduction,
https://docusaurus.io/docs/versioning.

Статус: планирано, не е реализирано. Собственикът иска отделен сайт за
документация на `doc.gridex.tech` (изрично одобрен публичен адрес). Предложение:
**Docusaurus** — open-source документация с Markdown/MDX в Git, преглед през PR
и отделна публикация в GitHub Pages. За статичната публична документация не
трябват нов backend контейнер, база или отворен порт на рутера.

Следващи стъпки и критерии за приемане:
1. Одобряване на Docusaurus и отделно хранилище (предложено име `gridex-docs`);
   фиксиране на поддържана версия и зависимости при реализацията.
2. Еднакви EN/BG ръководства: първи стъпки; демо спрямо реален вход; покани по
   имейл, регистрация и възстановяване; организации, роли и достъп до обекти;
   Обекти/Устройства; провизиране ROCK Pi → ESP32 и чернова → одобрение →
   потвърждение от устройството; телеметрия/офлайн; проблеми и поддръжка.
   Само провереното се описва като налично; бъдещите функции се маркират ясно.
3. Публична архитектура/API справочник с обезличени примери. Вътрешни инструкции,
   реални устройства/адреси, архиви и тайни не попадат в публичния код, генерираните
   файлове или индекса за търсене. Частната документация изисква отделна защита;
   скрито меню или robots.txt НЕ ограничават достъпа.
4. Стил на GrideX, четене на телефон, езиков избор и търсене (оценка на поддържана
   локална интеграция). Версии при стабилни продуктови издания, последна проверена
   ревизия и отговорник за всяка страница.
5. Отделна CI публикация: build, невалидни връзки, проверка за тайни/съдържание и
   тестове на четене/търсене на компютър и телефон. Домейнът, DNS и доверен HTTPS
   се настройват при одобрената реализация. Без промяна на текущия продуктов
   Pages домейн или добавяне на меню в продукта без разрешение.
6. Приемане след външен HTTPS тест, EN/BG навигация/търсене, преминаване на първите
   стъпки и проверка за липса на частни данни. Запис на deployment SHA,
   доказателства, rollback и незавършени глави в HANDOFF. Бъдещите feature PR-и
   обновяват засегнатата документация или изрично записват липсващата работа.

Пречка: изборът на платформа/хранилище и реализацията чакат одобрение; текущата
задача записва предложението. Няма промени по DNS, публикацията или менюто.

## Sidebar controls and anonymous demo / Меню и анонимно демо — 2026-09-19

Owner explicitly removes ALL upper-right controls, including language, login
progress, site selector, bell and mobile account shortcut. Language is below
the sidebar sign-in/profile; mobile exposes both in the expanded Menu. Anonymous
profile button launches PKCE login directly. Site selection remains in Sites
cards, not a global dropdown. Menu titles/tooltips are restored without added
setup labels; setup explanations remain inside the unfinished screens only.
Anonymous visits render demo immediately. Only OIDC callback visits initially
wait for identity; signed-in/API-error paths still never substitute demo data.
Removed blocking optional account-profile request (verified token claims used),
bounded Keycloak initialization and API fetch with backendTimeoutMs. Callback
timeout resets the failed adapter for retry; no password/PKCE/TLS weakening.
Clean public anonymous-browser reproduction worked on previous deployment; the
owner's exact stuck session was not available. Regression tests simulate hung
token exchange and hung API, plus mobile/desktop login, language position,
short labels and absent header controls. Real-owner acceptance remains pending.
No runtime, backend configuration, router or hardware changes.
Validation: 18 Chromium tests and 20 Node tests pass; Pages and Vinext builds
pass, lint has two pre-existing About image warnings and no errors. Anonymous
demo, stalled callback retry and 403/503/hung API paths verified with fixtures.
Local master auth probes pass. Normal-DNS public probes from Mac still fail;
this is not evidence of a completed external owner login.

Собственикът изрично премахва ВСИЧКИ горни десни контроли: език, прогрес на входа,
избор на обект, камбанка и мобилен профил. Езикът е под входа/профила в менюто;
на телефон са в разгънатото „Меню“. Анонимният бутон стартира PKCE вход директно.
Изборът на обект остава в картите в „Обекти“, не в глобален списък. Възстановени
кратки имена/tooltip без добавки; обясненията за настройка са само вътре в раздела.
Анонимният посетител вижда демо веднага; начална проверка има само при OIDC
callback. След вход/API грешка демо заместители няма. Премахната е блокираща
незадължителна заявка за профил (ползват се проверените token claims); init/API
чакането е ограничено с backendTimeoutMs. Timeout освобождава неуспешния adapter
за нов опит, без отслабване на парола/PKCE/TLS. Чист публичен анонимен браузър
работеше и на предходната версия; точната заседнала сесия не е възпроизведена.
Тестове симулират зависнали token/API заявки, вход на телефон/компютър, позиция
на езика, кратки менюта и празна горна лента. Реалното приемане предстои.
Без runtime, backend конфигурационни, рутерни или хардуерни промени.
Проверки: 18 Chromium и 20 Node теста минават; Pages/Vinext build минават,
lint без грешки и с две стари About image предупреждения. Анонимно демо,
повторен вход след зависнал callback и 403/503/зависнал API са fixture тестове.
Local master auth минава; публичните normal-DNS проби от Mac още отказват.
Това не доказва завършен външен вход с реалния акаунт.

## Authenticated data only / Само реални данни след вход — 2026-09-19

Demo is now allowed only for confirmed anonymous visitors. Session checking and
identity/API errors never fall back to sample sites, metrics, alarms or profile
history. Header names resolve from the authorised site list, not the demo default.
Unintegrated menu sections are marked "Setup & data" without changing menu
structure; their screens explain that data provisioning AND backend integration
are prerequisites. Existing Devices/Sites remain available. Missing telemetry
shows a connection/setup explanation, not an instruction to reprovision working
devices. Unknown grid power/balance remains unknown, never a fabricated zero.
No device, database, network or backend changes. Mocked tests cover successful
identity with API 403/503, all authenticated navigation, imported devices,
refresh outage/recovery, null battery and missing metrics in BG/EN. Real-owner
acceptance and heartbeat remain pending. Next: complete missing backend data
contracts and live edge telemetry; do not mark sections ready from demo fixtures.
Prior design PR #25 was deployed at b308b75, Pages run 35458931893 succeeded.
Validation: 16 browser tests and 20 Node tests pass. Both production builds pass;
lint has no errors (two existing About image warnings). Local master auth probes
pass; public normal-DNS reachability from Mac remains separately unverified.

Демо има само за потвърден анонимен посетител. Проверка на сесията и identity/API
грешки не връщат примерни обекти, показатели, аларми или история на профила.
Името в лентата идва от разрешените обекти, не от демо стойността по подразбиране.
Несвързаните раздели са означени „Настройка и данни“, без структурни промени;
екраните уточняват нуждата от провизирани данни И backend интеграция. Обекти и
Устройства остават достъпни. При липсваща телеметрия се обясняват връзката и
настройката, без повторно провизиране на работещи устройства. Неизвестните
мрежови мощност/баланс не се заменят с измислена нула. Без промени в устройства,
база, мрежа или backend. Mock тестове: вход с API 403/503, навигация след вход,
внесени устройства, refresh отказ/възстановяване, липсваща батерия/показатели в
BG/EN. Реално приемане и heartbeat предстоят. Следва: липсващи backend договори
и жива edge телеметрия; демо fixtures не доказват готовност. Предходният дизайн
PR #25 е публикуван при b308b75, успешен Pages run 35458931893.
Проверки: 16 браузърни и 20 Node теста минават; двата production build минават.
Lint без грешки (две стари About image предупреждения). Local master auth пробите
минават; публичният маршрут през normal DNS от Mac остава отделно непотвърден.

## Design publication and four-language suggestion — 2026-09-19

Owner approved publishing PR #25. Includes desktop provisioning cards, removal
of Edge gateway navigation, Devices-only management, header cleanup and direct
sign-in. No new menu items, hardware commands or backend configuration changes.
Implemented optional FR/ES/DE/IT browser-translation guidance before login,
chosen from navigator.languages, not IP. Dismissal and explicit BG/EN choices
are remembered; /en takes precedence. Other browser languages use English.
No translation widget, GeoIP service or automatic text transmission is installed.
This is guidance, NOT four complete translated application catalogues. Native
reviewed FR/ES/DE/IT catalogues remain backlog; authenticated data translation
is not automated. Mobile provisioning redesign remains separately unapproved.
Tests include all four suggestions, dismissal, saved BG preference, /en,
navigation, mocked login/session expiry and imported devices. Real owner-session
acceptance and live device heartbeat remain pending; mocks do not prove these.
Publication evidence is recorded on PR #25 after the deployment workflow.
Validation: 14 Chromium tests and 20 Node tests pass; six translation tests
rerun with screenshots, visually reviewed. Pages and Vinext builds pass. Lint:
zero errors, two existing About image warnings. Local master auth probes pass;
normal-DNS public issuer from Mac still fails (known network-path limitation).

Собственикът одобри публикуването на PR #25: desktop provisioning карти,
премахнат Edge шлюз, управление през Устройства, изчистена лента и директен вход.
Без нови менюта, хардуерни команди или backend настройки. Добавени са инструкции
по желание за браузърен превод на FR/ES/DE/IT преди вход според navigator.languages,
не IP. Отказът и изричният BG/EN избор се пазят; /en има предимство. За други
езици основата е английски. Без външен widget, GeoIP или автоматично изпращане
на текст. Това са предложения/инструкции, НЕ четири пълни превода на приложението.
Прегледаните FR/ES/DE/IT речници остават задача; няма автоматичен превод на
удостоверени данни. Mobile provisioning редизайнът чака отделно одобрение.
Тестовете покриват четирите предложения, отказ, запазен BG, /en, навигация,
симулиран вход/изтичане и внесени устройства. Реално приемане с акаунта и жив
heartbeat остават непотвърдени. Публикацията се документира в PR #25 след workflow.
Проверки: 14 Chromium и 20 Node теста минават; шестте езикови са повторени със
снимки и визуален преглед. Pages/Vinext build минават; lint без грешки, две стари
About image предупреждения. Local master пробите минават; public issuer през
normal DNS от Mac още не се достига (известно ограничение на мрежовия път).

## Language suggestions / Езикови предложения — 2026-09-19

Owner requests translation suggestions for visitors outside Bulgaria, including
French and Spanish. Existing unmerged PR #12 uses browser time zone, NOT GeoIP.
Proposed implementation, not enabled: saved explicit choice first, explicit
language route next, browser navigator.languages next; optional country-only
server GeoIP may suggest a language only when the preferred language is unknown.
Never equate nationality/country with language or override a saved choice.
Keep BG/EN; add reviewed static FR/ES translation catalogues incrementally with
English fallback, including login/invitation/error strings and number/date units.
Suggest once, allow dismissal and remember choice. Use the existing language
control, not a new navigation item. GeoIP provider and privacy/storage policy
must be selected before adding any external IP lookup; no browser GPS required.
Interim option: user-initiated browser translation guidance (Chrome Translate),
not an injected third-party widget and not an automatic external proxy of the
authenticated portal. Do not send customer/device data, credentials, tokens or
private runtime text to translation providers. Machine assistance may translate
public static catalogues offline, with review of technical/safety terminology.
Tests: French/Spanish browsers, BG user abroad, country/language conflict, VPN,
unavailable GeoIP, explicit /en, dismissed suggestion and saved preference;
no session reset or menu changes. This is a proposal/backlog, not delivered FR/ES.

Собственикът иска предложения за превод извън България, включително френски и
испански. Неслетият PR #12 използва часова зона, НЕ GeoIP. Предложение, още
неактивно: запазен изричен избор, после изричен езиков маршрут, после
navigator.languages; опционално GeoIP само за държава може да предложи език,
ако предпочитаният е неизвестен. Държавата не определя езика и не отменя избора.
BG/EN остават; постепенно се добавят прегледани статични FR/ES речници с EN
fallback, включително вход/покани/грешки и формати на числа/дати/единици.
Еднократно предложение с отказ и запомняне. Използва се текущият езиков контрол,
не нов елемент в менюто. GeoIP доставчик и политика за поверителност/съхранение
се избират преди външна IP заявка; без GPS. Временна опция: инструкции за
превод от браузъра по желание (Chrome Translate), без външен widget или
автоматичен proxy на удостоверения портал. Клиентски/device данни, credentials,
tokens и частен runtime текст не се изпращат към преводачи. Машинен превод може
да помага за публични статични речници офлайн, с техническа/безопасностна редакция.
Тестове: FR/ES браузър, българин в чужбина, конфликт държава/език, VPN, отказал
GeoIP, /en, отказано предложение и запазен избор; без рестарт на сесия/промяна
на менюто. Това е предложение/backlog, не внедрен FR/ES превод.

## Menu governance / Правило за менюто — 2026-09-19

AGENTS.md now requires explicit owner permission for any menu structure change
and an explicit owner request for each new menu item, across desktop/mobile and
submenus. Documentation only; EN/BG reviewed and git diff --check passed.

AGENTS.md изисква изрично разрешение за всяка структурна промяна на менюто
и изрично искане от собственика за нов елемент, включително mobile/подменюта.
Само документация; EN/BG са проверени и git diff --check минава.

## Header and direct login / Лента и директен вход — 2026-09-19

Moved live/demo context into Devices with explicit separation from heartbeat.
Open-source links remain in About, now available in authenticated mode too.
Removed global role selection (server authorization unchanged) and unused global
period state: existing section-local time selectors remain, no fictitious filter.
Header and demo notice sign-in now start existing OIDC/PKCE directly; failure
opens the login error/retry screen. No new auth provider or backend changes.
Tests: 20 Node tests; 7 full Chromium tests plus two one-click login viewport
tests (390/1280px) pass. Both builds pass; lint has two existing image warnings.
Local master issuer/admin URL/login form pass; forced-local public discovery 200,
admin 404. Normal-DNS public auth regression probes still fail from Mac; not
external acceptance. Added to PR #25, not published. Full real-owner login,
logout and expiry acceptance remains unverified.

LIVE/DEMO контекстът е в Устройства, отделен от heartbeat. Open-source връзките
остават в За нас, вече достъпен и след вход. Премахнати са общият избор на роля
(backend правата са непроменени) и неизползваният общ период; локалните избори
на период се запазват, без фиктивен филтър. Входът от лентата и демо съобщението
стартира OIDC/PKCE директно; при грешка се показва екранът за повторен опит.
Без нов auth provider или backend промени. Минават 20 Node, 7 пълни Chromium
теста и два теста за еднократен вход на 390/1280px. Двата build-а минават;
lint има две стари image предупреждения. Local master issuer/admin URL/login
форма минават; forced-local public discovery 200, admin 404. Normal-DNS public
auth пробите от Mac още не минават; това не е външно приемане. Към PR #25,
непубликувано. Реален вход/изход/изтекла сесия със собственика остават непроверени.

## Single device entry / Един вход за устройства — 2026-09-19

Owner requested removal of Edge gateway from desktop/mobile navigation.
Devices remains the single entry for existing ROCK Pi/ESP32 inventory and setup.
Removed the unrelated hardcoded sidebar "online 8 sec ago" card as well.
Legacy navigation requests for gateway resolve to Devices. No device records,
API permissions or hardware configuration removed. The old demo module remains
in source but is no longer loaded. Navigation coverage now has 18 sections.
Included in design PR #25; publication pending.
Validation: 20 Node and all 7 Chromium tests pass, including 18-section mobile
navigation at 360/390/430px and imported-pair/session regression. Both builds pass.

По искане на собственика Edge шлюз е премахнат от desktop/mobile менюто.
Устройства е единственият вход за наличните ROCK Pi/ESP32 и настройките им.
Премахната е и фиксираната sidebar карта „онлайн преди 8 сек.“. Старите
навигационни заявки gateway водят към Устройства. Не са изтрити устройства,
API права или хардуерни настройки. Старият демо модул остава в кода, но не
се зарежда. Навигационните тестове вече обхващат 18 раздела.
Промяната е към design PR #25; публикацията предстои.
Проверки: 20 Node и всичките 7 Chromium теста минават, включително 18 раздела
на 360/390/430px и внесена двойка/сесия. Двата build-а минават.

## Provisioning appearance / Оформление на provisioning — 2026-09-19

Matched live inventory, role setup and protected-access forms to existing GrideX
settings/Edge cards, colors, borders and controls. Only scoped desktop styles
(min-width 681px); mobile styling awaits explicit owner approval. No auth, API,
device configuration, credential handling or hardware behavior changes.
Build, 20 Node tests and initial Chromium regression pass; desktop fixture
screenshot inspected. Expanded role-edit regression also passed (1.1 min);
both desktop screenshots reviewed. Publication awaits review/mobile decision.
Do not call this hardware commissioning.

Уеднаквени са live inventory, роли и защитен достъп с картите, цветовете,
рамките и контролите на GrideX настройки/Edge. Само desktop стилове от 681px;
мобилното оформление чака изрично одобрение. Няма промени по auth, API,
конфигурации, тайни или хардуерна логика. Build, 20 Node теста и първият Chromium
тест минават. Разширеният тест за редакция също мина (1.1 мин); двете desktop
снимки с фиктивни данни са прегледани. Публикацията чака преглед/мобилно решение.
Това не е hardware commissioning.

## Imported pair visibility / Видимост на внесената двойка — 2026-09-19

Runtime read-only DB inspection confirms two registered gateways and an active
device-import revision with two entries. Hardware inventory revision remains
draft; an active import is NOT hardware activation. Devices now shows imported
inventory immediately, before selecting a unit. Pending modules provide an
explicit action to Devices, including the Assets screen reported by the owner.
No duplicate registration, backend deployment, hardware commands or mobile CSS.
Browser regression covers both imported units, selecting each without repeat
provisioning, and Assets → Devices; OIDC/API fixtures are mocked, not actual
owner-session acceptance. Real account acceptance and heartbeat remain pending.
Next: owner-session verification of the published Devices screen; then finish
ROCK-initiated approved-revision execution and real heartbeat separately.

Validation: 20 Node tests pass; extended Chromium imported-pair/navigation and
refresh regression passes (1.1 min); Pages and Vinext builds pass; lint has only
two pre-existing image warnings. Initial browser attempt exposed a missing
explicit selector accessible name; fixed and rerun passed. Publication pending.

Read-only проверка в реалната база потвърди два шлюза и активна device-import
ревизия с два записа. Hardware ревизията остава чернова; активен импорт НЕ е
активиране на хардуера. Устройства показва внесената двойка веднага, преди избор.
Незавършените раздели имат преход към Устройства, включително докладвания Активи.
Без дублиране, backend deployment, хардуерни команди или mobile CSS промени.
Browser regression проверява двата уреда, избор без повторен provisioning и
Активи → Устройства; OIDC/API са mock, не приемане с реалния акаунт.
Реалното приемане и heartbeat предстоят. Следва проверка с акаунта на собственика
в публикувания екран; после отделно ROCK-инициирано прилагане и реален heartbeat.

Проверки: 20 Node теста и разширеният Chromium тест за двойката/навигацията и
refresh минават (1.1 мин); Pages/Vinext build минават; lint има само две стари
image предупреждения. Първият browser опит откри липсващо изрично достъпно име
на избора; поправено и повторно проверено. Публикацията предстои.

## Live navigation/session repair / Поправка на навигация и сесия — 2026-09-19

Found: Sites was routed to a placeholder despite the existing sites API; header
count and profile statistics were demo constants. Refresh transport errors were
converted to 401 and the periodic verifier logged users out on every error.
Fixed: real authorized Site list/ID selection and Devices action; no demo sites,
alarm counts, profile statistics, power flow or forecast when live data is absent.
Read-only API 401 gets one forced-refresh retry; writes are never replayed.
Refresh network/5xx errors preserve the session and show temporary failure;
actual rejected refresh still expires it. Aborted snapshot results are ignored.
Other operational menu modules remain explicitly unfinished, not falsely live.

Tests: authenticated mocked-OIDC browser traversal of 19 sections plus 503
refresh outage, recovery and invalid_grant expiry passed; eight EN/BG render
tests passed. Lint: two existing image warnings. Local master issuer, console
URL and login form passed. Normal-DNS public probes from Mac timed out; forced
local trusted-TLS public discovery returned 200. This is not external reachability
or real-account login/logout acceptance. Publication pending this branch CI.
Device pull/update implementation is paused; incomplete backend files are not
deployed and must not be reported as an active device update mechanism.

Открито: Обекти отиваше към заглушка въпреки наличния API; броят и статистиката
в профила бяха демо константи. Мрежова refresh грешка ставаше 401, а периодичната
проверка отписваше при всяка грешка. Поправено: реален списък/избор по ID и
бутон Устройства; без демо обекти, аларми, профилна статистика, поток и прогноза
при липсващи live данни. Read-only 401 има един refresh retry, без повторение
на записи. Мрежови/5xx откази пазят сесията; отхвърлен refresh я прекратява.
Прекратени snapshot заявки не обновяват екрана. Останалите оперативни раздели
остават изрично незавършени, не фиктивно live.

Тестове: browser обход на 19 раздела с тестов OIDC, refresh 503, възстановяване
и invalid_grant — успешен; осем EN/BG render теста — успешни. Lint: две стари
image предупреждения. Local master issuer/console URL/login форма минават.
Публичните normal-DNS проби от Mac изтичат; forced local trusted-TLS discovery
връща 200. Това не доказва външен достъп или вход/изход с реален акаунт.
Публикацията чака CI. Device pull/update работата е спряна; незавършените backend
файлове не са внедрени и не са действащ механизъм за обновяване.

## ROCK Pi initiated activation — work plan / План за активиране от ROCK Pi

Owner decision: only ROCK Pi initiates provisioning/update communication.
Browser approval queues an immutable revision; backend never opens an inbound
connection to ROCK Pi/ESP32. Receiving a job is not successful application.

- [ ] Durable approved revision queue, scoped device identity, idempotent receipt.
- [ ] ROCK Pi outbound pull, bounded validation, local backup/recovery and health proof.
- [ ] UI draft, explicit approval, pending/active/failed/unconfirmed status.
- [ ] ESP32 provisioning through ROCK Pi with verified readback; no direct backend path.
- [ ] Firmware update adapters and rollback verified separately from configuration.
- [ ] Negative tests, deployment commissioning and Git push/PR.

Решение: само ROCK Pi започва provisioning/update комуникацията. Одобрението
в сайта поставя неизменяема версия в опашка; backend не отваря входяща връзка
към ROCK Pi/ESP32. Получена задача не означава успешно прилагане.

- [ ] Устойчива опашка, отделна идентичност, повторяемо потвърждение без дублиране.
- [ ] Изходящо изтегляне от ROCK Pi, проверки, локален backup/recovery и health проверка.
- [ ] UI чернова, изрично одобрение, чака/активна/грешка/непотвърдено.
- [ ] ESP32 provisioning през ROCK Pi с проверка чрез прочит, без пряк backend достъп.
- [ ] Firmware адаптери и rollback се проверяват отделно от конфигурацията.
- [ ] Отрицателни тестове, проверка при внедряване и Git push/PR.

## Existing test config import / Импорт на съществуваща тестова конфигурация

Owner-supplied private ROCK Pi env imported into the existing owning Site.
Exactly two registered gateways matched, no new inventory or hardware writes.
Original encrypted AES-256-GCM in external vault imports with Site/hash AAD;
SQL stores only provenance and sanitized polling/DHCP/commissioning summary.
Repeated import verified idempotent. No SSH credential, Deye driver validation
or live telemetry established. Source proves intended ROCK Pi settings, not
current ESP firmware or physical health. Device UI skips repeat provisioning
for imported pair, offers a separate draft for changes. Private export remains
0600 outside Git; key backup is necessary for encrypted source recovery.
Migration 005 expands configuration section constraint for device-setup/import;
prior memory tests missed this real PostgreSQL restriction. Applied successfully.
Frontend publication/real user acceptance must be verified separately.

Внесен е частният ROCK Pi env към съществуващия Обект на собственика. Намерени
точно два регистрирани gateway записа; без нов inventory/hardware writes.
Оригиналът е AES-256-GCM криптиран във външния vault imports със Site/hash AAD;
SQL съдържа само произход и обезличени polling/DHCP/commissioning данни.
Повторният импорт е проверен без дублиране. Не са добавени SSH credentials,
проверен Deye драйвер или live телеметрия. Файлът доказва ROCK Pi настройки,
не ESP firmware/физическо здраве. UI пропуска повторния provisioning на двойката
и предлага отделна чернова за промени. Частният експорт остава 0600 извън Git;
за възстановяване на криптирания оригинал е нужен backup на ключа.
Миграция 005 разширява section constraint за device-setup/import; предишните
memory тестове са пропуснали това PostgreSQL ограничение. Приложена успешно.
Frontend публикацията и приемането от реалния потребител се проверяват отделно.

## Device setup flow / Настройки на устройства — 2026-09-19

Owner requested all device configuration under Devices, not Profile. Implemented
registered-device dropdown, one/two communication roles, peer selection (backend,
Deye 100 kW, Suntech 261) and transport. Backend enforces verified Site admin,
known gateway, max two roles, no duplicate peer and no direct ESP-to-backend role.
Versioned device-setup configuration is persisted in PostgreSQL with draft
lifecycle, optimistic revision and audit; no new env files or hardware commands.
Only after confirmed save is the controller's protected provisioning/access form
shown. ESP stays DHCP via ROCK Pi; reservation/driver deployment is not implemented.
Equipment labels are planning choices, not proof of compatible drivers or exact
vendor model; commissioning remains required. Existing inventory IDs are reused.
No migration, battery Modbus activation, VPN or credential changes.
Tests: 25 API tests pass, including HTTP admin/scope/revision protection.
Frontend lint/build and null-battery regression pass. API deployment initiated;
UI CI/publication and real browser acceptance must be checked before claiming live.

Настройките са преместени от Профил в Устройства: падащо меню със заведени
устройства, една/две комуникационни роли, партньор (backend, Deye 100 kW,
Suntech 261) и транспорт. Backend проверява потвърден admin на Обекта,
познат gateway, максимум две роли, без дублиран партньор и без директна ESP-backend
роля. Versioned device-setup е в PostgreSQL с draft lifecycle, revision check
и одит; без нов env файл или hardware команди. Едва след потвърден запис се
показва защитената форма за provisioning/достъп на контролера. ESP остава DHCP
през ROCK Pi; прилагане на резервация/driver не е реализирано. Етикетите са
план, не доказан съвместим драйвер/точен модел; commissioning предстои.
Запазени са inventory ID. Без миграции, battery Modbus, VPN или credentials промени.
25 API теста минават, включително HTTP admin/scope/revision защити. Frontend
lint/build и null-battery regression минават. API deployment е стартиран;
UI CI/публикация и реалният browser тест трябва да се проверят преди live твърдение.

## Local admin login repair / Поправка на локалния admin вход — 2026-09-19

Applied master realm frontendUrl from GRIDEX_ADMIN_AUTH_BASE in the single
private env, preserving other realm attributes and public gridex issuer.
Rollback metadata saved privately. No password, proxy ACL, TLS trust or router
change. Verified local discovery, admin authServerUrl and fresh PKCE login form
all use the local admin origin; forced restricted-proxy master probe remains 404.
Actual LAN forwarding target is host port 14443, not 443; LAN TLS probe passed.
Public-domain access from this Mac still times out: external/mobile reachability
and LAN hairpin routing are not proven by these local checks. Earlier diagnosis
based on host port 443 refusal was not valid for this router mapping.
Backend check-auth-routing.mjs provides a read-only regression gate; both AGENTS
require login/logout/expired-session browser acceptance, not just HTTP 200.
Actual password submission and browser session-expiry acceptance remain pending;
no continuous monitoring has been installed.

Приложен master realm frontendUrl от GRIDEX_ADMIN_AUTH_BASE в единния частен env,
със запазени останалите realm attributes и public gridex issuer. Частен rollback
е записан. Без промяна на пароли, proxy ACL, TLS доверие или рутер. Local discovery,
admin authServerUrl и новата PKCE login форма вече ползват локалния admin адрес;
принудителната проба през ограничения proxy за master остава 404.
Реалната LAN цел е host порт 14443, не 443; LAN TLS пробата мина. Публичният домейн
от този Mac още изтича: външен/mobile достъп и LAN hairpin не са доказани с тези
локални проверки. Предишният извод от отказ на host 443 не е валиден за този NAT.
Backend check-auth-routing.mjs е read-only regression проверка; двата AGENTS
изискват browser вход/изход/изтекла сесия, не само HTTP 200. Реално подаване на
парола и browser приемане след изтекла сесия предстоят; няма постоянен монитор.

## UI publication and device inventory / UI публикация и устройства — 2026-09-19

PR #19 merged; GitHub Pages run 35442969353 succeeded. Protected access form
and sanitized demo example are published. New device-information implementation
uses the existing administrator-only hardware API in live Devices/Gateway views.
Shows model, role, ID, interfaces, configuration revision and attached-device
drivers; never renders connection settings or credentials. Site changes unmount
old data, requests are aborted on cleanup, denied/error states never use demo
fallback. No live gateway heartbeat claim: configuration is not telemetry.
No backend, hardware, CSS/mobile layout, VPN or battery Modbus changes.
New inventory publication and real authenticated browser acceptance remain pending;
heartbeat ingestion remains a separate unfinished task.

PR #19 е слят; GitHub Pages run 35442969353 завърши успешно. Публикувани са
формата за защитен достъп и обезличеният демо пример. Новата информация за
устройства ползва съществуващия admin-only hardware API в live Устройства/Gateway.
Показва модел, роля, ID, интерфейси, конфигурационна ревизия и драйвери на свързани
устройства; не показва connection настройки или credentials. Смяна на Обект
премахва старите данни, заявките се прекратяват при cleanup, отказ/грешка не
замества данните с демо. Няма твърдение за live heartbeat: конфигурацията не е
телеметрия. Без промени по backend, хардуер, CSS/mobile layout, VPN или Modbus.
Публикацията на новия inventory и реален browser тест с вход предстоят;
heartbeat ingestion остава отделна незавършена задача.

## Blank screen after login / Празен екран след вход — 2026-09-19

Proxy logs show successful token, identity and Site snapshot responses. Found
an unconditional battery.sohPct.toFixed call in live Overview: a commissioned
inventory without battery telemetry can return battery=null and crash rendering.
Guard missing battery/SOH and show a dash, never demo SOH. Six EN/BG render
regressions cover absent battery, null metrics and populated metrics; included
in npm test. Pages build passes. No auth, network or hardware setting changed.
Actual external browser acceptance remains required after publication.

Proxy логовете показват успешни token, identity и Site snapshot отговори.
Открито е безусловно battery.sohPct.toFixed в live Overview: Обект без батерийна
телеметрия може да върне battery=null и да срине визуализацията. Добавена защита
за липсваща батерия/SOH с тире, не демо SOH. Шест EN/BG render теста покриват
липсваща батерия, null и налични стойности; включени в npm test. Pages build
минава. Без auth, мрежови или hardware промени. Реален външен browser тест
след публикацията остава необходим.

## Planned: day-ahead net-profit arbitrage / Планирано: арбитраж „ден напред“ — 2026-09-19

Status: requirement recorded, not implemented or activated by this task.
Extend the existing `price_arbitrage` strategy rather than introducing a duplicate.

### English

- [ ] Select/configure the strategy per Site in the frontend, persist a versioned
  configuration in the backend, enforce Site administrator permissions and audit
  approval. Deployment settings remain in the single backend configuration file;
  no hard-coded operational settings or secrets in frontend/Git.
- [ ] Backend jointly optimizes next-day charging and later discharging windows
  for maximum expected **net profit**, not merely the lowest/highest spot price.
  Use published day-ahead intervals, currency/energy units, timezone and DST;
  distinguish actual published prices from forecasts and validate source freshness.
- [ ] Net profit = export revenue minus purchased energy, applicable grid/market
  fees and taxes, and battery degradation cost. Model charge/discharge efficiency
  in the energy balance, without charging losses twice.
- [ ] Configure battery cost per equivalent full cycle (EFC), or an equivalent
  throughput cost with an explicit kWh basis. Allocate partial-cycle wear to each
  dispatch interval and show hourly costs; cycle cost is not an arbitrary fixed
  cost per clock hour. Document the conversion and avoid double-counting wear.
- [ ] Respect initial/final SOC, reserve, usable capacity, charge/discharge power,
  grid import/export limits, cycle budget, availability and the Edge safety
  envelope. Prevent simultaneous charge/discharge; do not schedule trades below
  the configured minimum net margin. Missing/stale prices or telemetry must
  block new automatic dispatch and follow an approved safe fallback.
- [ ] UI displays buy/sell windows, kWh, prices, losses, fees, cycle cost and
  expected net profit by interval and total. Support preview/simulation, explicit
  administrator approval and an audited plan/configuration revision. Compare
  forecasts with actual metered results; predicted profit is not guaranteed.
- [ ] Acceptance: tests for low spread, negative prices, efficiency/degradation,
  partial cycles, SOC/power/reserve limits, DST/missing intervals, stale inputs
  and unauthorized changes; then read-only simulation with real price data.
  Physical battery dispatch remains disabled until separate commissioning and
  approval. No Suntech 261 Modbus activation is authorized by this task.

Next: agree the versioned strategy inputs, cost units and plan API contract,
then implement backend optimization and frontend selection/preview together.

### Български

- [ ] Избор/настройка на стратегията по Обект през frontend, versioned конфигурация
  в backend, права на администратор на Обекта и одит на одобрението. Deployment
  настройките остават в единния backend конфигурационен файл; без hard-coded
  оперативни настройки или тайни във frontend/Git.
- [ ] Backend оптимизира съвместно прозорците за зареждане и последващо разреждане
  за следващия ден за максимална очаквана **нетна печалба**, не само най-ниска/
  най-висока борсова цена. Ползва публикуваните интервали „ден напред“, валута,
  енергийни единици, часова зона и лятно/зимно време; различава реалните публикувани
  цени от прогнози и проверява актуалността на източника.
- [ ] Нетна печалба = приход от продажба минус закупена енергия, приложими
  мрежови/пазарни такси и данъци и износване на батерията. КПД при заряд/разряд
  се отчита в енергийния баланс, без двойно начисляване на загубите.
- [ ] Настройва се цена на еквивалентен пълен цикъл (EFC) или еквивалентна цена
  за преминала енергия с изрична kWh база. Износването от частичните цикли се
  разпределя по интервали и се показва по часове; цената на цикъла не е произволна
  фиксирана такса на астрономически час. Документирана конверсия, без двойно
  начисляване на износването.
- [ ] Спазват се начален/краен SOC, резерв, използваем капацитет, мощности на
  заряд/разряд, мрежови лимити за внос/износ, бюджет цикли, наличност и безопасният
  работен диапазон на Edge. Без едновременен заряд/разряд и сделки под зададения
  минимален нетен марж. Липсващи/стари цени или телеметрия блокират новото
  автоматично управление и задействат предварително одобрено безопасно поведение.
- [ ] UI показва прозорци за покупка/продажба, kWh, цени, загуби, такси, цена на
  цикъла и очаквана нетна печалба по интервал и общо. Преглед/симулация, изрично
  одобрение от администратор и одит на ревизията на плана/конфигурацията.
  Сравнение с реално измерения резултат; прогнозната печалба не е гаранция.
- [ ] Приемане: тестове за малък спред, отрицателни цени, КПД/износване, частични
  цикли, SOC/мощност/резерв, смяна на часа/липсващи интервали, стари входни данни
  и неразрешени промени; после read-only симулация с реални цени. Физическото
  управление остава изключено до отделно commissioning и одобрение. Тази задача
  не разрешава активиране на Modbus към Suntech 261.

Следва: договор за versioned входни параметри, единици за разходите и plan API,
после съвместна реализация на backend оптимизацията и frontend избора/прегледа.

## Protected device access / Защитен достъп до устройства — 2026-09-19

Backend deployed: GET/PUT site gateway access metadata/replacement endpoints.
Verified current site administrator required; foreign Sites rejected, ESP direct
access rejected. Hardware topology/config administration is now admin-only.
Full SSH connection material encrypted AES-256-GCM with Site/gateway/version/time
AAD, stored outside SQL. Separate 0400 master-key volume, read-only API mount;
data directory 0700/files 0600. Single backend .env holds vault path settings.
No secret read HTTP endpoint. Explicit confirmation, optimistic version check,
no-store response and secret-free replacement audit. API tests: 22 pass.

Frontend Profile form implemented, lint/Pages build pass; publication and real
browser acceptance remain pending. Full tsc is blocked by existing gateway,
overview, supported-device, worker and service dependency errors, not new form.
No actual device credential has been saved; no SSH execution, heartbeat worker,
OTA queue or fresh-auth/MFA approval flow exists yet. Key fingerprint is required
as input but not verified against a connection yet; key input is structurally
validated only. Current vault supports one API process (not distributed writers).
Master-key offline encrypted backup/rotation and recovery drill remain mandatory
before production; SQL backup alone cannot restore credentials. Host/API takeover
can expose decrypt capability; this protects database-only leakage, not host
compromise. Demo must never reuse this endpoint or store.

Backend е внедрен: GET/PUT за статус/замяна на достъп по Обект/gateway. Изисква
потвърден текущ администратор; чужд Обект и директен ESP достъп се отказват.
Hardware topology/config администрацията е само за администратор. Целият SSH
достъп е криптиран AES-256-GCM с Site/gateway/version/time AAD извън SQL. Master
ключът е в отделен volume с 0400 и read-only API mount; данни 0700/0600. Пътищата
са в единния .env. Няма secret-read HTTP endpoint. Има изрично потвърждение,
version check, no-store и audit без тайни. 22 API теста минават.

Profile формата е реализирана; lint/Pages build минават, публикация и реален
browser тест предстоят. Пълният tsc е блокиран от съществуващи gateway/overview/
supported/worker/dependency грешки, не от новата форма. Реален credential още не
е записан; няма SSH изпълнение, heartbeat worker, OTA queue или fresh-auth/MFA
одобрение. Fingerprint се изисква, но не е проверен с връзка; key input се
валидира само структурно. Vault е за един API процес, не distributed writers.
Отделен криптиран offline backup/rotation на master key и restore тренировка
са задължителни преди production; SQL backup не възстановява ключовете.
Превзет host/API може да дешифрира; защитата е срещу database-only изтичане.
Демото никога не ползва този endpoint/store.

## Local test inventory / Локален тестов inventory — 2026-09-19

Owner approved a local-only test Site with one ROCK Pi E controller and one
OLIMEX ESP32-EVB lab node, owned through the organization's administrator.
Inventory registered transactionally as commissioning/draft; repeat registration
does not duplicate it. No hardware commands, IP/MAC reassignment, VPN activation,
battery Modbus or physical configuration changes were performed. RS485 battery
port is marked disabled in inventory; this is NOT proof of firmware state.
Demo uses a sanitized illustrative pair, not private inventory IDs or telemetry.
Remaining: publish frontend example, verify authorized topology UI, reconcile
physical identities/config files, ingest heartbeat, then separately implement
opt-in sanitized live demo projection. Other demo simulations are not live data.

Одобрен е локален тестов Обект с един ROCK Pi E контролер и OLIMEX ESP32-EVB
lab нод, собственост чрез администратора на организацията. Inventory е записан
транзакционно като commissioning/draft; повторният старт не го дублира. Няма
хардуерни команди, IP/MAC промени, VPN активация, battery Modbus или физически
конфигурационни промени. RS485 battery портът е disabled в inventory — това НЕ
доказва firmware състоянието. Демото използва обезличена примерна двойка, не
частни ID или телеметрия. Остават публикуване на frontend примера, проверка на
удостоверения topology UI, сверяване на физически identity/config файлове,
heartbeat приемане и отделна opt-in обезличена live demo проекция. Останалите
демо симулации не са реални данни.

## Login recovery / Възстановяване на входа — 2026-09-18

Explicit PKCE login no longer depends on embedded SSO cookie checks. Failed
initialization resets the client so retry is possible. Anonymous API status is
unknown; only authenticated `/me` success marks it online. Identity failures
and API-access failures have separate messages and neither permanently disables
retry. Refresh now requires explicit login (the identity provider may reuse its
session); token refresh and server authorization remain enforced.
Chromium regression passed: login enabled without health/iframe requests and
redirect includes code, S256, state and nonce. Real credentials, site permissions
and public-network reachability still need end-to-end acceptance.

Изричният PKCE вход вече не зависи от скрити SSO cookie проверки. При неуспешна
инициализация клиентът се изчиства за повторен опит. API статусът преди вход е
неизвестен; само успешен удостоверен `/me` го маркира online. Грешките на
идентификацията и API достъпа са отделни и не блокират трайно повторния вход.
След refresh се натиска вход (identity provider може да използва своята сесия);
token refresh и сървърните права продължават да се проверяват.
Chromium regression мина: активен вход без health/iframe заявки и redirect с
code, S256, state и nonce. Реални credentials, права по обекти и публична
мрежова достъпност още изискват цялостен приемателен тест.

## Public OIDC handoff / Публичен OIDC handoff — 2026-09-18

The public runtime defaults now use `https://auth.gridex.tech/auth/realms/gridex`.
Startup no longer makes an unauthenticated request to the intentionally private
backend `/health` path before OIDC; that removed the former login/readiness
circular dependency. No CSS, mobile layout or navigation was changed.

Backend discovery and issuer now use the same public auth hostname. The exact
Keycloak callbacks for `https://gridex.tech` root, `/en/` and
`/silent-check-sso.html` are configured and verified; a foreign callback is
rejected. Next publish this frontend and verify real PKCE sign-in/sign-out. A
master administrator is not a normal portal member: accept only an ordinary
Gridex user with explicit organization/site membership and prove empty/foreign-
site denial. Invitation email delivery through Mailgun remains separately
disabled pending provider commissioning.

Публичните runtime defaults вече ползват
`https://auth.gridex.tech/auth/realms/gridex`. При стартиране вече няма заявка
без удостоверяване към умишлено частния backend `/health` преди OIDC; така е
премахнат предишният цикъл вход/готовност. Няма промяна по CSS, mobile layout
или навигация.

Backend discovery и issuer вече използват същото публично auth име. Точните
Keycloak callbacks за `https://gridex.tech` root, `/en/` и
`/silent-check-sso.html` са конфигурирани и проверени; чужд callback се отказва.
Следва публикуване на frontend и реален PKCE вход/изход. Master admin не е
нормален portal member: приеми само обикновен Gridex user с изрично членство в
организация/обект и докажи отказ при липсващо/чуждо членство. Поканите по
Mailgun остават отделно изключени до provider commissioning.

## Active access-management backlog / Активен план за достъп — 2026-09-15

Owner selected Mailgun REST API, not SMTP. Follow [the coordinated plan](docs/ACCESS_MANAGEMENT_PLAN.md):
BE-01 delivery integration, BE-02 delivery reliability, BE-03 admin lists,
BE-04 membership mutations, BE-05 invitation lifecycle, FE-01 menus/forms,
SEC-01 identity hardening, QA-01 end-to-end acceptance. 0/8 full milestones accepted.
Backend owns canonical plan; frontend carries an identical copy. Keep both in sync.
Existing foundation is not complete registration; keep enrollment disabled.
Next: Mailgun compatibility/provider work, then admin APIs and menus. SMTP next-actions
below are historical. No runtime, email, DNS or UI changes in this documentation task.

Избран е Mailgun REST API, не SMTP. Следвай [общия план](docs/ACCESS_MANAGEMENT_PLAN.md):
BE-01 интеграция, BE-02 надеждност, BE-03 списъци, BE-04 членства, BE-05 покани,
FE-01 менюта/форми, SEC-01 сигурност, QA-01 целият процес. 0/8 пълни етапа приети.
Backend е водещ, frontend пази идентично копие; обновявай и двете заедно.
Наличната основа не е готова регистрация; остава изключена. Следва Mailgun provider,
после admin API и менюта. Старите SMTP задачи са исторически. Тук няма промени
в runtime, имейли, DNS или интерфейс.

## Invitation forms / Форми за покани — 2026-09-15

Profile/sign-in now show invitation acceptance and organisation-admin invitation
forms. Uses database membership from /me, not token admin claims. Explicit site
selection and four non-admin roles; no password collection. Sending is disabled
on enrollment 503. A sent invitation can be revoked in the same session; persisted
sent-invitation listing is not yet provided by backend. Anonymous users see the
invite-only instructions. Backend PR #19 is merged/deployed; the old RBAC notes
below are historical. Keycloak setup belongs to antouanbg/gridex-openremote-backend.
SMTP, activation and real user browser tests remain. No mobile CSS/design changes.
Typecheck exposes existing unrelated errors; builds/lint and 11 tests pass.

Профилът/входът вече показват приемане и форма за покана от администратор на
организация. Използва membership от /me, не token admin claims. Изричен избор
на обекти и четири неадминистративни роли; без събиране на пароли. При 503
изпращането е спряно. Изпратена покана може да се отмени в същата сесия;
backend още няма постоянен списък с изпратени покани. Анонимните виждат указания.
Backend PR #19 е merged/внедрен; старите RBAC бележки са исторически. Keycloak
настройките са в antouanbg/gridex-openremote-backend. Остават SMTP, активиране
и реален browser тест. Без мобилни CSS/дизайн промени. Typecheck открива стари
несвързани грешки; builds/lint и 11 теста минават.

## English

Local integration uses vite.local.config.ts (loopback 4173), existing Keycloak
PKCE login and GrideX API proxy. Public runtime config and mobile layout are
unchanged. Before login, backend must allow this exact origin and Keycloak
portal callbacks; an actual test user/membership is still required. Do not
claim OpenRemote admin login proves frontend login. Registration/invitation UI
and backend invitation lifecycle are not implemented by this checkpoint.

Recommended onboarding: organization administrator invites email with expiry
and single-use acceptance; Keycloak handles identity/email verification/password;
GrideX stores membership, per-organization role and optional site grants with
audit. No organization access solely because an account was registered.
Current backend membership filters sites at organization level, while token
roles grant permissions globally. Per-organization role enforcement and
site-specific grants must be implemented/tested before claiming full RBAC.

Proposed roles: viewer (read), operator (approved operational actions),
energy_manager (strategies/configuration), integrator (hardware/device setup),
organization administrator (members/roles within own organization). Platform
administrator is separate; no self-assigned elevated role. All real control
still requires Edge commissioning gates. Next: local callback provisioning,
real browser login/logout and empty-membership UI; then invitation/RBAC API.
Deferred backup/restore belongs to `antouanbg/gridex-openremote-backend` PR #17:
row-content and application-volume/full-stack restore remain outstanding.

## Български

Локалната интеграция ползва vite.local.config.ts (loopback 4173), наличния
Keycloak PKCE вход и GrideX API proxy. Публичната конфигурация и мобилният
дизайн са непроменени. Преди вход backend трябва да разреши точния origin и
Keycloak callbacks; още е нужен реален test user/membership. OpenRemote admin
вход не доказва frontend вход. Регистрация/покани UI и invitation lifecycle
в backend не са реализирани с този checkpoint.

Препоръчано: администратор на организация кани email с еднократно приемане и
срок; Keycloak управлява identity/email verification/password; GrideX пази
membership, роля по организация и евентуални site grants с audit. Самата
регистрация не дава достъп до организация. Backend филтрира обектите по
организация, но token ролите дават глобални permissions. Роли по организация
и индивидуални site grants изискват реализация/тест преди заявяване на пълен RBAC.

Предложени роли: viewer (четене), operator (одобрени оперативни действия),
energy_manager (стратегии/конфигурация), integrator (хардуер/устройства),
администратор на организация (членове/роли само в своята организация).
Platform administrator е отделен; без самоназначаване на висока роля.
Реалното управление изисква Edge commissioning gates. Следва: local callbacks,
истински browser вход/изход и UI без membership; после invitation/RBAC API.
Отложеният restore е в `antouanbg/gridex-openremote-backend` PR #17:
row-content и app-volume/full-stack restore остават незавършени.
# 2026-09-30 — „Пазар“ показва отделно API проверка и пълен дневен набор

Живият ENTSO-E A44 отговор за BG на 2026-09-30 съдържа 96 × 15-минутни
интервала; за 2026-10-01 сутринта само 4. Старият екран изчисляваше
„API активно“ от `lastSuccessAt` (последния пълен утрешен набор), затова
след полунощ изглеждаше сякаш API е спрял, въпреки часовите успешни проверки.
Екранът вече ползва `lastAttemptAt` плюс `status` за активността, показва
отделно последен опит/последен пълен ден/дата на доставка и пояснява
частичния утрешен отговор. Не показва непълните стойности като завършен ден,
не променя права или клиентски ценови данни. Тестът за супер администратора
покрива `partial`, ISO дата и refresh. Публикуването е отделна стъпка;
провери live `/market/` след merge.
