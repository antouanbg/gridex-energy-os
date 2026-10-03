# Canonical layout / Водещ лейаут — 2026-10-02

## Superseding approval — 2026-10-03 / По-ново одобрение

The approved reference is now gridex-docs static/approved/users-three-roles.html
and the BG/EN approved-users-screens guide. Settings → Users is continuous;
five roster columns are Name/email, Role, Sites, Services, Actions. Details
expand below, mobile uses cards. Platform order adds organisation requests
and read-only member inspection before invitation/history/organisation ledger.
Organisation order remains services, invitation, history, roster/editor, requests.
Viewer cannot see Users; direct URL is denied; personal services live in Services.
Older Profile → Services labels and side-by-side editor below are historical.
Cancel/Stop persists only the caller's request/grant. Re-enable requires new
organisation-admin approval. Do not infer runtime support from the mockup.

БГ: новият одобрен шаблон е в gridex-docs static/approved/users-three-roles.html
и BG/EN ръководството approved-users-screens. Една страница Настройки →
Потребители, пет колони и разгъваеми подробности; мобилни карти. Супер админ:
организация, услуги, заявки, преглед на хора, покана, история, организационен
регистър. Организационен админ: услуги, покана, история, хора/редактор, заявки.
Наблюдателят няма Потребители, а личните услуги са в Услуги. Старите имена и
страничен редактор по-долу са история. Отмени/Спри остава с реален запис;
само лично разрешение/заявка, с ново админско одобрение за повторно включване.

Owner approved the recommended continuous screen and the same visual design for
every role. Reference: gridex-three-role-service-screens.html; the older member
editor reference governs only the roster/editor within the page.

| Role | Page order | Actions |
| --- | --- | --- |
| Platform | Organisation selector, five services, new invitation, invitation history, approved organisation ledger | Organisation grants/zone, invitations, suspension, organisation request decisions |
| Organisation administrator | Five services, new member invitation, history, approved members/editor, requests | Own organisation request/cancel; own members' role/Sites/services; member decisions |
| Member | Existing Profile → Services | Own request only; no administrator controls |

Common tokens: white cards, 15px radius, 17px padding; ink #18382c,
muted #63776d, border #dce8df, green #0b4230, soft #eaf4ed.
No tabs, decorative hero or role switcher. Five catalogue rows remain visible
without grants. Desktop roster/editor is two columns; mobile is stacked and
contains controls without horizontal overflow. Existing actions remain guarded.
Invitation history retains accepted entries and filters/pagination.

Tests: invitation-menu checks ordered visible sections and exact style tokens;
organisation-access checks populated platform catalogue, grant/removal, real
prerequisite failure and mobile width. Fixtures and screenshots are not real
owner acceptance; release evidence belongs in HANDOFF.

Български: водещ е макетът с трите роли, с одобрения общ непрекъснат екран.
Старият макет за хора/права важи само за редактора вътре, не за табове.
Супер администратор: избор на организация → пет услуги → нова покана →
история → одобрени организации. Организационен администратор: пет услуги →
нова покана → история → одобрени хора/редактор → заявки. Потребителят пази
съществуващата логика на Профил → Услуги. Единни цветове, карти, бутони и
статуси, без избор на друга роля. Две колони на desktop, една на mobile.
Петте реда остават видими без права, но действията изискват реално разрешение.
Тестовете сверяват реда/стила и действията; приемането с реален акаунт остава
отделно от тестовите снимки и се записва в HANDOFF.
