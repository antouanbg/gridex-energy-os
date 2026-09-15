# Identity and access delivery plan / План за регистрация и достъп

Canonical owner / Водещо репо: `antouanbg/gridex-openremote-backend`
UI owner / Интерфейс: `antouanbg/gridex-energy-os`
Date / Дата: 2026-09-15

## English

### Status and scope

This is an implementation backlog, not a completed feature report. Existing:
backend invitation create/accept/revoke, database organisation role/site checks,
local Keycloak email policy and frontend basic forms. Still unproven:
real email delivery, end-to-end invited-user login, persistent admin management.
Keep enrollment disabled until acceptance. Mailgun REST API is the owner's
selected transport; earlier SMTP setup next-actions are superseded, not an
instruction to silently use Mailgun SMTP. No runtime changes in this planning task.

### Planned menus

- **Profile → Access**: own organisations, role and permitted sites; pending
  invitations with organisation/site names, expiry, accept/decline; sign-in,
  password recovery and MFA links handled by Keycloak.
- **Organisation → People and access** (current organisation administrator only):
  tabs **Members**, **Invitations**, **Audit**.
- **Members**: name/email, role, selected sites, active/suspended state, membership
  revision; filters and pagination. Detail panel: change role/sites, suspend,
  restore or remove membership. Show last sign-in only when backed by real data.
- **Invitations**: recipient, inviter, role, sites, expiry, acceptance state and
  separate delivery state; create, inspect, resend, cancel. Refresh must retain
  the list. No fabricated success, no raw action link or token in the table.
- **Audit**: actor, time, organisation, affected membership/invitation, action,
  result, before/after scope and reason. Never include passwords or email tokens.
- **My security**: Keycloak password/MFA/session actions. Organisation admins
  cannot see passwords or globally disable an identity used by another tenant.

### Administrator and recipient workflow

1. Bootstrap the first organisation administrator via an explicit, audited
   operator procedure for a verified identity; never promote the first registrant.
2. Choose organisation → invite → email → role → explicit sites → review summary.
   Validate selected sites server-side and show the permissions before sending.
3. Persist a pending invitation, request a Keycloak-generated email action link
   through the selected Mailgun REST delivery integration. No membership yet.
4. Recipient verifies email, sets password if new, authenticates and explicitly
   accepts. Check subject, verified matching email, expiry, inviter authority
   and current site ownership atomically. Never overwrite existing membership.
5. Grant only the reviewed role/sites; refresh /me and site list. For existing
   users preserve passwords and other memberships. Joining another organisation
   must not modify the first one's role or access.
6. Show a truthful failure/recovery path for unavailable provider, expired link,
   email mismatch, revoked invitation, existing membership and lost permission.

### Role policy

| Role | Scope |
| --- | --- |
| viewer | Read permitted sites/assets/strategies |
| operator | Read plus approved operational actions and strategy drafts/simulation |
| energy_manager | Operator capabilities plus configuration and strategy activation |
| integrator | Read plus device/hardware configuration |
| organisation administrator | Membership/invitation administration inside own organisation |
| platform administrator | Separate operator role; no implicit unrestricted customer access |

All device commands still require commissioning and Edge safety gates.
Ordinary invitations cannot assign administrator. Administrator promotion is a
separate step-up/MFA-confirmed, audited flow. Prevent removal, suspension or
demotion of the last active administrator, including concurrent requests.
Require explicit confirmation and a reason for destructive access changes.
Email changes require Keycloak re-verification, not editing a database address.

### Lifecycle, data and contract proposals

Keep invitation acceptance state separate from delivery: queued, provider
accepted, delivered, temporary failure, permanent failure, suppressed. Provider
acceptance is not delivery; delivery is not membership acceptance. Expiry is
server-calculated (currently 24 hours). Resend must invalidate the old invitation
generation and prevent old links from accepting a renewed grant. Prove the
Keycloak action-link behaviour rather than assuming an admin API returns links.

Planned additive PostgreSQL fields/tables: membership state/revision/updated
actor; invitation generation/revision, delivery reference, retry timing;
bounded delivery events and audited access changes. Define retention and PII
minimisation before rollout. Do not store plaintext credentials or action tokens.

Proposed endpoints, to finalise against existing contracts:
- GET organisation members/invitations/audit with pagination and tenant checks.
- PATCH membership role/sites/state using If-Match; stale revision → 412.
- POST invitation resend/decline; existing create/accept/revoke kept compatible.
- GET enrollment capability with honest availability, no secret configuration.
- Mailgun event receiver only after authenticated, replay-safe design approval.

Mutations require transactionally rechecked authority, audit and idempotency.
Suspension/removal blocks subsequent site requests even with a valid old token;
already-authorised in-flight actions need explicit limits, not promises of recall.
Reactivation never silently restores obsolete sites. Organisation changes must
not revoke a user's unrelated organisation access or global Keycloak account.

### Ordered backlog and acceptance

All eight items below are **pending**, even where foundation code exists.
Track each with PR, commit, tests and deployment evidence; mark done only after
its stated acceptance. Current full-workflow milestones: **0/8 accepted**.

1. **BE-01 Mailgun transport**: confirm EU/US region, verified sender/domain and
   private sending/signing credentials; implement/test Keycloak-compatible REST
   email provider (or reviewed alternative preserving action links). No SMTP
   substitution, no frontend API key. Prove verification/recovery/invitation email.
2. **BE-02 Durable delivery**: bounded retries/backoff, duplicate prevention,
   provider accepted vs delivered, bounce/suppression handling, authenticated
   replay-resistant events if used. No blind retry after ambiguous send outcome.
3. **BE-03 Admin read APIs**: paginated members/invitations/audit, organisation/site
   labels, minimum PII; foreign tenant and unprivileged access denied.
4. **BE-04 Membership mutations**: role/sites/state, revisions, last-admin
   protection, audit and revocation tests, including concurrency and cross-tenant
   identities. New grants default deny; no administrator role in ordinary invite.
5. **BE-05 Invitation follow-up**: resend/expiry/revoke/decline, invalidation of
   superseded generations, idempotency and recipient/organisation rate limits.
6. **FE-01 Management screens**: implement menus above against real APIs; loading,
   empty, forbidden, disabled delivery and conflict states; EN/BG parity and
   accessible forms. Obtain approval before mobile layout/navigation changes.
7. **SEC-01 Identity hardening**: administrator MFA/step-up, least-privilege
   enrollment client, recovery, audit retention and mailbox-change checks.
8. **QA-01 End-to-end acceptance**: two organisations with different roles, new
   and existing user, actual Mailgun email, accept/replay/expiry, change/revoke
   with existing session, provider outage, refresh, EN/BG, logout and recovery.
   Use synthetic sites; never actuate equipment. Only then enable enrollment.

Exact next task: BE-01 provider compatibility spike and private Mailgun setup,
while BE-03 contracts and FE-01 menu implementation can proceed without secrets.
Mailgun delivery requires owner-supplied region/domain/sender and local secrets.
No new public endpoint or DNS change without explicit deployment authorisation.

## Български

### Статус и обхват

Това е план, не отчет за готова функционалност. Налични са backend създаване/
приемане/отмяна на покана, проверки на роли и обекти от базата, локална Keycloak
имейл политика и основни frontend форми. Недоказани са реалната доставка,
целият вход по покана и постоянното администриране. Регистрацията остава
изключена до приемателните тестове. Избраният транспорт е Mailgun REST API;
старите задачи за SMTP се заменят, не означават Mailgun SMTP. Тази задача не
променя работещата среда.

### Планирани менюта

- **Профил → Достъп**: собствени организации, роля, обекти; чакащи покани с
  имена, срок и приемане/отказ; вход, възстановяване и MFA през Keycloak.
- **Организация → Хора и достъп**: само за текущ администратор на съответната
  организация; раздели **Членове**, **Покани**, **Одит**.
- **Членове**: име/имейл, роля, обекти, активен/спрян статус, ревизия; филтри и
  странициране. Детайл: промяна на роля/обекти, спиране, възстановяване, премахване.
  Последен вход се показва само с реални данни.
- **Покани**: получател, канещ, роля, обекти, срок, приемане и отделен статус на
  доставката; създаване, детайл, повторно изпращане, отмяна. Списъкът остава след
  обновяване. Без измислен успех или видими action links/tokens в таблицата.
- **Одит**: кой, кога, организация, засегнат запис, действие, резултат, предишни/
  нови права и причина; никога пароли или имейл tokens.
- **Моята сигурност**: парола/MFA/сесии през Keycloak. Администраторът на една
  организация не вижда пароли и не спира глобално чуждите членства на човека.

### Стъпки на администратора и получателя

1. Първият администратор се назначава изрично, с одит и потвърдена идентичност;
   първият регистриран не се повишава автоматично.
2. Организация → покана → имейл → роля → конкретни обекти → обобщение.
   Backend проверява принадлежността; показват се правата преди изпращане.
3. Записва се чакаща покана; Keycloak генерира защитения линк, избраната Mailgun
   REST интеграция изпраща имейла. Още няма членство.
4. Получателят потвърждава имейл, задава парола ако е нов, влиза и приема.
   Атомарно се проверяват subject, потвърден съвпадащ имейл, срок, канещ и обекти.
   Съществуващо членство не се презаписва.
5. Дават се само прегледаните права/обекти; обновяват се /me и списъкът.
   Съществуващите пароли и членства се запазват. Втора организация не променя първата.
6. Ясни грешки и възстановяване при недостъпен доставчик, изтекъл линк,
   различен имейл, отменена покана, съществуващо членство или загубени права.

### Роли

| Роля | Обхват |
| --- | --- |
| viewer / Наблюдател | Четене на разрешени обекти/активи/стратегии |
| operator / Оператор | Четене, одобрени оперативни действия, чернови/симулации |
| energy_manager / Енергиен мениджър | Оператор плюс конфигурация и активиране на стратегия |
| integrator / Интегратор | Четене плюс устройства/хардуер |
| Администратор на организация | Членства и покани само в собствената организация |
| Platform administrator | Отделна операторска роля, без подразбиращ се достъп до всички клиенти |

Командите остават под commissioning и Edge ограничения. Обикновена покана не
дава администратор. Повишаването е отделно, с MFA/повторно удостоверяване и одит.
Защита на последния активен администратор, включително при паралелни промени.
Потвърждение и причина за отнемане на достъп. Смяна на имейл изисква ново
потвърждение през Keycloak, не само редакция в базата.

### Жизнен цикъл, данни и предложен договор

Приемане и доставка са отделни: опашка, приета от доставчика, доставена,
временна/постоянна грешка, suppressed. Приета от Mailgun не значи доставена,
а доставена не значи прието членство. Срокът е сървърен (сега 24 часа).
Повторно изпращане обезсилва старата версия; стар линк не приема обновените
права. Поведението на Keycloak линковете се доказва, не се предполага, че
Admin API ги връща за директно изпращане.

Планирани PostgreSQL допълнения: статус/ревизия/актьор на членство; версия на
поканата, delivery reference, време за retry; ограничени delivery events и одит.
Retention и минимизиране на личните данни преди пускане. Без plaintext пароли/tokens.

Предложени endpoints за уточняване спрямо наличните:
- GET членове/покани/одит по организация с pagination и tenant проверки.
- PATCH роля/обекти/статус с If-Match; стара ревизия → 412.
- POST resend/decline; запазване на съвместимостта на create/accept/revoke.
- GET реална enrollment availability, без секретни настройки.
- Mailgun event receiver само след одобрен authenticated/replay-safe дизайн.

Промените изискват повторна проверка в транзакция, одит и idempotency.
Спиране/премахване блокира следващи заявки и със стар валиден token; вече
разрешените текущи действия имат изрични ограничения, не обещание за отмяна.
Възстановяването не връща мълчаливо остарели обекти. Не се отнемат други
организации или глобалният Keycloak профил.

### Подредени задачи и приемане

Всичките осем са **чакащи**, независимо от наличната основа. За всяка се пазят
PR, commit, тестове и внедряване. Завършени пълни етапи: **0/8 приети**.

1. **BE-01 Mailgun**: EU/US, потвърден домейн/подател, частни ключове;
   Keycloak-съвместим REST email provider или прегледана алтернатива със защитени
   линкове. Без SMTP замяна/ключ във frontend. Реален тест на трите вида имейли.
2. **BE-02 Доставка**: ограничени retries/backoff, дедупликация, разграничена
   доставка, bounce/suppression; удостоверени събития с replay защита ако се ползват.
   Без сляп retry при неизвестен резултат.
3. **BE-03 Четене за администратор**: членове/покани/одит, pagination, имена,
   минимум лични данни; отказ за чужда организация или недостатъчни права.
4. **BE-04 Членства**: роли/обекти/статус, ревизии, последен администратор,
   одит/отнемане, конкурентни и cross-tenant тестове; default deny за нови grants.
5. **BE-05 Покани**: resend/expiry/revoke/decline, обезсилване на стара версия,
   idempotency и rate limits по получател/организация.
6. **FE-01 Екрани**: описаните менюта с реални API; зареждане, празно, отказ,
   спрян mail и конфликт; EN/BG и достъпни форми. Одобрение преди мобилен редизайн.
7. **SEC-01 Идентичност**: MFA/step-up за администратори, ограничен enrollment
   клиент, recovery, audit retention и смяна на имейл.
8. **QA-01 Целият процес**: две организации с различни роли, нов/съществуващ
   потребител, реален Mailgun имейл, приемане/replay/срок, промяна/отнемане със
   стара сесия, outage, refresh, EN/BG, logout/recovery. Тестови обекти без команди.
   Едва тогава се включва регистрацията.

Точно следващо: BE-01 съвместимост и частна Mailgun конфигурация; BE-03 договори
и FE-01 менюта могат да продължат без secrets. За изпращане собственикът дава
регион/домейн/подател и въвежда ключовете локално. Нов public endpoint или DNS
промяна изисква отделно разрешение за внедряване.

