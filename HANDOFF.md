# Frontend login handoff

Repository / GitHub: `antouanbg/gridex-energy-os`

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
