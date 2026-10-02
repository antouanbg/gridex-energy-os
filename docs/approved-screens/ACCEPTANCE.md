# Approved-screen checks / Проверки на одобрения екран

Reference: owner-approved member-access and three-role service mockups in this
directory. Personal example identifiers were replaced with example.org before
Git publication; layout and workflow are preserved. These are illustrative
approval references, not screenshots of a live customer's account.

| Contract | Component | Evidence |
| --- | --- | --- |
| Existing URL/menu, actual role only | Invitations | invitation-menu, organisation-access role tests |
| Roster left, selected person right; mobile stacked | OrganisationMembers | desktop/mobile geometry assertions and inspected screenshots |
| Name/email, role, Sites, services, last login | OrganisationMembers | roster/edit tests; live read-only API probe verifies real members/OR links |
| Independent roster/service failure handling | OrganisationMembers | service failure browser regression |
| Five rows and visible disabled actions with no grants | adminServiceRows, both organisation editors | zero-grant browser regression; live catalogue probe |
| Review then save role/Sites | OrganisationMembers | member edit browser regression |
| Separate invitations, sent/resend, accepted history | Invitations | invitation-menu tests; no change to recipient acceptance contract |
| Organisation request/cancel only by administrator | OrganisationServiceMembers | request/cancel browser test; backend permission guards |
| Member grant only after organisation grant | OrganisationMembers | organisation-access approved/unapproved test and backend tests |
| No member layout change or administrator controls | Profile/ServiceCatalog | viewer denial and existing service catalogue tests |
| Corresponding BG/EN help | docs and public Docusaurus organisations guide | Docusaurus build/typecheck; live publication checkpoint in HANDOFF |

75 browser tests and 29 unit tests passed. TypeScript, Pages build and lint
passed (four pre-existing image warnings). API migration/deployment and real
read-only two-organisation checks passed. A browser fixture is not a real
customer login: owner acceptance of the published editor, real service request
and delivered notification remains open. Do not fabricate a grant to make
an unapproved service appear active. Publication/deployment are recorded in
HANDOFF separately from owner acceptance.

Български: референциите са одобрените макети; личните примерни идентификатори
са заменени с example.org преди публикуване. Не са реални клиентски снимки.
Таблицата свързва меню/роля, двуколонен и мобилен изглед, хора/Обекти/услуги,
независими грешки, петте видими реда без права, преглед/запис, покани,
организационна заявка/отмяна, лично разрешение след организационно право и
непроменен потребителски екран с компонентите и тестовете. 75 браузърни и
29 unit теста минаха; typecheck/build/lint също (четири стари image warning).
Живият API и реалните проверки само за четене в двете организации минаха.
Остават реален browser тест от собственика, заявка и доставено уведомление.
Без фиктивни права; публикация и приемане се отчитат отделно в HANDOFF.
