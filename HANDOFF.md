# Frontend login handoff

Repository / GitHub: `antouanbg/gridex-energy-os`

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
