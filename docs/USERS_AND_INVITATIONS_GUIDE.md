# Users & invitations / Потребители и покани

Status / Статус: guide for the staged `/customers/users/` submenu. The
new-organisation form remains disabled until dedicated realm setup and email
delivery are configured and accepted in a real session. This page is not
evidence that the feature is available on `gridex.tech`.

## Български

**Път:** „Клиенти и договори → Потребители и покани“; постоянен адрес
`/customers/users/`. Менюто е за влязъл администратор на организация. В демо
режим се показва само обяснение и не се изпраща поща. Получателят вижда и
приема чакащите покани в „Профил“, не в административния екран.

Глобалният администратор вижда допълнителна форма „Нова организация“ тук.
Въвежда име, уникален кратък код (realm) и имейл на първия администратор.
Ако сървърът не е подготвен, полетата са изключени. При успешно изпращане
се създава отделен OpenRemote realm, но организацията и правата НЕ се
активират, преди поканеният да потвърди имейла, да влезе в своя realm и
да приеме поканата от „Профил“. Нужен е скорошен вход на глобалния админ.
„Последни покани“ показва състояния и позволява отмяна на чакаща покана.
При грешка не изпращайте нова покана с друг код, преди съгласуване.

За покана на член избери организацията, въведи имейла, избери роля от падащото
меню и по желание маркирай разрешени Обекти. Ако организацията още няма Обекти,
поканата дава членство без достъп до Обекти; правата се добавят изрично по-късно.
Наличните роли са „Наблюдател“
(четене), „Оператор“ (оперативни действия), „Енергиен мениджър“ (стратегии и
конфигурация) и „Интегратор“ (настройки на устройства). Сегашният поток не
позволява делегиране на роля „Администратор на организация“. Показват се само
Обектите, до които администраторът има достъп; backend проверява това преди
създаване на поканата и повторно при приемането ѝ. Самото изпращане не дава
членство — то започва след успешно приемане. Изпратената покана може да се
отмени в същата сесия; постоянен списък на изпратените покани още липсва.

При „Зареждане“ изчакай проверката на права, Обекти и покани. Ако няма
достъпни Обекти, може да се изпрати покана без достъп до Обекти. При грешка или недостъпна
услуга не приемай, че писмото е изпратено; обнови и провери състоянието.
Невлязъл потребител и потребител без администраторски права не могат да
изпращат покани. Глобалната покана за първи администратор на **нова**
организация е подготвена в кода, но реално изпращане и приемане още не са
потвърдени с нова организация.

## English

**Path:** Customers & contracts → Users & invitations; stable URL
`/customers/users/`. The menu is for signed-in organisation administrators.
Demo shows an explanation only and sends no email. Recipients view and accept
pending invitations in Profile, not on the administrative screen.

A platform administrator sees an additional “New organisation” form here:
organisation name, unique short realm code and first administrator's email.
It stays disabled until dedicated setup and email delivery are ready. Sending
creates a separate OpenRemote realm, but organisation and rights become active
only after the recipient verifies their email, signs in to that realm and
accepts in Profile. A recent admin sign-in is required. “Recent invitations”
shows state and can revoke a pending request. If delivery fails, do not retry
under another realm code before reconciliation.

To invite a member, choose the organisation, enter an email, select a role
from the dropdown and optionally select permitted Sites. When an organisation
has no Sites yet, the invitation grants membership with no Site access;
access must be granted explicitly later. Available roles are
Viewer (read), Operator (operational actions), Energy manager (strategies and
configuration), and Integrator (device configuration). The current flow cannot
delegate the organisation-administrator role. Only Sites available to the
administrator are displayed, and the backend validates that scope both before
creating the invitation and again at acceptance. Sending alone grants no
membership; acceptance is required. A sent invitation can be revoked in the
same session. A persistent sent-invitation list is not available yet.

Wait for rights, Sites and invitations to load. With no available Sites,
the member may still be invited without Site access. On an error or unavailable service, do not assume email
was sent; refresh and verify state. Anonymous and non-admin users cannot send
invitations. The global invitation for the first administrator of a **new**
organisation is staged, but real delivery and acceptance with a new tenant
remain unverified.
