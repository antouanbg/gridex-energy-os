# Sign-in and realm isolation / Вход и изолация на организациите

## English

The generic `/login/` entry asks for the invited email first. The portal API
finds the organisation realm from a valid invitation or accepted membership;
one match continues to that realm's Keycloak sign-in, while multiple matches
offer a choice. Enter the password only in Keycloak, never in the portal.
Unknown emails fall back to the platform realm without confirming whether an
account exists. A customer invitation may still use its explicit `?realm=` link.
The selected realm is kept only
in that browser tab for refresh and route navigation; it is not a browser-wide
default. Signing out clears the tab's realm hint. Opening a new tab for the
platform sign-in does not reuse another customer's realm.
When the customer entry is open in a tab without an active session, its login
page offers a direct link back to the main GrideX account.

On a live page, “Checking session…” means identity and API access have not yet
been verified. It is not a sign-out. “Verification unavailable” means the check
failed; retry when connectivity returns. Only after a confirmed anonymous result
does the UI say “No active session”. A verified user sees only authorised Sites;
an empty Site list does not imply that devices exist elsewhere. Demo data is
never substituted for a live account.

OpenRemote's public Manager is restricted to the platform realm. Customer
action-email links remain available for verification and password setup, but
their unauthenticated login heading uses the neutral GrideX brand. This guide
does not claim a customer browser sign-in has been accepted until tested by the
account holder.

## Български

Общият адрес `/login/` първо иска имейла от поканата. API намира realm-а на
организацията по валидна покана или прието членство: при едно съвпадение
препраща към неговия защитен Keycloak вход, а при повече предлага избор.
Паролата се въвежда само в Keycloak, никога в портала. Непознат имейл се
насочва към платформения realm, без да се потвърждава съществуването на
акаунт. Линкът от клиентска покана може да съдържа изрично `?realm=`.
Избраният realm се пази само в
съответната вкладка за обновяване и преминаване между страници; не става обща
настройка за целия браузър. Изходът изчиства избора. Нова вкладка за вход в
платформата не наследява realm-а на друг клиент.
Когато клиентският вход е отворен без активна сесия, страницата предлага
пряк линк обратно към основния GrideX акаунт.

В реалния портал „Проверка на сесията…“ означава, че самоличността и достъпът
до API още се проверяват, а не че потребителят е излязъл. „Проверката е
недостъпна“ означава неуспешна проверка; опитайте пак при възстановена връзка.
„Няма активна сесия“ се показва само след потвърден анонимен резултат.
Потвърденият потребител вижда само разрешените му Обекти; празният списък не
означава, че има устройства на друго място. Демо данни не заместват реалния
акаунт.

Публичният OpenRemote Manager е ограничен до платформения realm. Клиентските
линкове от писмата остават достъпни за потвърждение и парола, но заглавието
на входа преди удостоверяване е неутралното GrideX. Ръководството не твърди,
че клиентският браузърен вход е приет, преди да се тества от притежателя му.
