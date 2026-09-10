# Next version backlog / Следваща версия

## Planned implementation

1. **Portal module split and lazy loading** — extract the monolithic
   `app/page.tsx` sections into independently loaded modules so the initial
   JavaScript payload contains only the shell and active screen.
2. **Full browser test suite** — add Playwright checks for all 19 portal
   sections at 360, 390 and 430 px: no horizontal overflow, language switching,
   touch targets, range input updates and demo/live state behaviour.
3. **PV project configuration UI** — implement the versioned project form for
   coordinates, multiple arrays, DC kWp, tilt, azimuth, PR, temperature
   coefficient and shading losses; connect it to the canonical BFF contract in
   `docs/integration/PV_PROJECT_CONFIGURATION_AND_OPENREMOTE.md`.

## Completion rule

Each item requires a reviewed pull request, successful lint/build/tests and an
updated `CODEX_STATE.md`. PV configuration activation must be validated by the
backend and applied through OpenRemote; the public frontend must never write
OpenRemote assets directly.

## Български

Следващата версия включва: разделяне на големия `app/page.tsx` на lazy-loaded
модули; пълен Playwright тест за всички 19 секции и телефонни ширини; и форма
за PV проектна конфигурация с координати, масиви, DC kWp, наклон, азимут, PR,
температурен коефициент и засенчване. Всеки елемент минава през PR, проверки и
актуализация на `CODEX_STATE.md`. Активирането на PV конфигурацията се валидира
от backend-а и се синхронизира с OpenRemote през BFF.
