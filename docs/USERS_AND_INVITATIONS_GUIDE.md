# Users & invitations / Потребители и покани

Status / Статус 2026-09-26: backend setup and migration 012 are active. The
global form is available to the explicitly authorised platform account in a
recent live session. First real customer delivery, password setup, acceptance
and tenant-isolation test are **not yet verified**. The frontend fix for member
invitations when an organisation has zero Sites is local and unpublished.

## Български

**Път:** „Клиенти и договори → Потребители и покани“; постоянен адрес
`/customers/users/`. Менюто е за влязъл администратор на организация. В демо
режим се показва само обяснение и не се изпраща поща. Получателят вижда и
приема чакащите покани в „Профил“, не в административния екран.

Глобалният администратор вижда допълнителна форма „Нова организация“ тук.
Въвежда име, уникален кратък код (realm) и имейл на първия администратор.
Ако услугата или правата не са готови, формата не изпраща покана. При успешно изпращане
се създава отделен OpenRemote realm, но организацията и правата НЕ се
активират, преди поканеният да потвърди имейла, да влезе в своя realm и
да приеме поканата от „Профил“. Нужен е скорошен вход на глобалния админ.
„Последни покани“ показва състояния и позволява отмяна на чакаща покана.
При грешка не изпращайте нова покана с друг код, преди съгласуване.

За покана на член избери организацията, въведи имейла, избери роля от падащото
меню и по желание маркирай разрешени Обекти. Ако организацията още няма Обекти,
поканата следва да дава членство без достъп до Обекти; frontend поправката за този случай още не е публикувана.
Наличните роли са „Наблюдател“
(четене), „Оператор“ (оперативни действия), „Енергиен мениджър“ (стратегии и
конфигурация) и „Интегратор“ (настройки на устройства). Сегашният поток не
позволява делегиране на роля „Администратор на организация“. Показват се само
Обектите, до които администраторът има достъп; backend проверява това преди
създаване на поканата и повторно при приемането ѝ. Самото изпращане не дава
членство — то започва след успешно приемане. Изпратената покана може да се
отмени в същата сесия; постоянен списък на изпратените покани още липсва.

При „Зареждане“ изчакай проверката на права, Обекти и покани. Ако няма
достъпни Обекти, не приемай, че поканата е възможна в текущо публикувания UI. При грешка или недостъпна
услуга не приемай, че писмото е изпратено; обнови и провери състоянието.
Невлязъл потребител и потребител без администраторски права не могат да
изпращат покани. Глобалната покана за първи администратор на **нова**
организация има включен backend поток, но реално изпращане и приемане още не са
потвърдени с нов клиент.

## English

**Path:** Customers & contracts → Users & invitations; stable URL
`/customers/users/`. The menu is for signed-in organisation administrators.
Demo shows an explanation only and sends no email. Recipients view and accept
pending invitations in Profile, not on the administrative screen.

A platform administrator sees an additional “New organisation” form here:
organisation name, unique short realm code and first administrator's email.
It cannot send if the service or permission check is unavailable. Sending
creates a separate OpenRemote realm, but organisation and rights become active
only after the recipient verifies their email, signs in to that realm and
accepts in Profile. A recent admin sign-in is required. “Recent invitations”
shows state and can revoke a pending request. If delivery fails, do not retry
under another realm code before reconciliation.

To invite a member, choose the organisation, enter an email, select a role
from the dropdown and optionally select permitted Sites. When an organisation
has no Sites yet, the invitation should grant membership with no Site access;
the frontend fix for this case is local and unpublished. Access must be granted
explicitly later. Available roles are
Viewer (read), Operator (operational actions), Energy manager (strategies and
configuration), and Integrator (device configuration). The current flow cannot
delegate the organisation-administrator role. Only Sites available to the
administrator are displayed, and the backend validates that scope both before
creating the invitation and again at acceptance. Sending alone grants no
membership; acceptance is required. A sent invitation can be revoked in the
same session. A persistent sent-invitation list is not available yet.

Wait for rights, Sites and invitations to load. With no available Sites,
do not assume the currently published UI can send the invitation. On an error or unavailable service, do not assume email
was sent; refresh and verify state. Anonymous and non-admin users cannot send
invitations. The global invitation for the first administrator of a **new**
organisation has an active backend path, but real delivery and acceptance with
a new customer remain unverified.
