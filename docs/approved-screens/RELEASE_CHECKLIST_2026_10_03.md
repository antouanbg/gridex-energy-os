# Approved Users rollout / Внедряване на Потребители

Owner explicitly requested all three approved screens on the live site.
Reference: gridex-docs static/approved/users-three-roles.html.
Current chat Phase3 is authoritative; Phase2 was reviewed for earlier Manager
boundaries, not as authority to restore the old anonymous entry.

| Contract | Implementation | Evidence |
| --- | --- | --- |
| Platform organisation selector → services → requests → selected members → invitation → history → ledger | OrganisationAccessAdmin + OrganisationInvitationAdmin | organisation-access test: selection and order |
| Organisation services → invitation → history → five-column members → requests | Invitations + OrganisationMembers | invitation-menu tests |
| Name/email, role, Sites, services, actions; expandable details | OrganisationMembers | invitation-menu role/Site save, zero grants and outage |
| Collapsed invitation forms; preserved required fields | Invitations / OrganisationInvitationAdmin | invitation-menu fill/send/resend |
| Viewer has no Users menu; direct URL denied | verified navigation + page guard | invitation-menu non-admin; approved-navigation |
| Personal catalogue, request/cancel/stop | ServiceCatalog | personal-service-stop BG/EN |
| Desktop and mobile common appearance | scoped admin styles | screenshots and overflow checks |
| No role switcher, cross-tenant read-only platform list | verified identity + platform member API | backend scope tests + live read-only probe |

Live probe before rollout: both existing active organisations have five catalogue
entries; pilot has one member, customer has two. OpenRemote links and wrong-realm
denial verified. No grants changed or messages sent by the probe.

Regression incident: the first browser run had one test trying to fill the
approved collapsed form before opening it. Test now opens the summary before
filling; all eight invitation tests pass. Sandbox EPERM on local test ports was
resolved by rerunning with authorised local network access, not changing code.
Merge conflicts were additive documentation only; both current account/logout
protections and newer approved navigation decisions are preserved.

БГ: собственикът изрично поиска публикуване на трите одобрени екрана.
Пази се редът на секциите, петте колони, разгъваемите подробности и мобилните
карти. Супер админ избира организация еднократно; списъкът с хора следва избора.
Наблюдателят няма административен регистър. Лична отмяна/спиране не променя
организацията или чуждите права. Реалната проверка само чете двете организации,
OpenRemote връзките и защитата. Първият тест е поправен да отвори сгънатата
форма; конфликтите са само допълнения в документацията, без презапис на код.
Публикуване и приемане с реалните потребители се записват отделно в HANDOFF.
