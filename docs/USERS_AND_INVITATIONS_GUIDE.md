# Users & invitations / Потребители и покани

Status / Статус: prepared guide for the unpublished
`/customers/users/` submenu. This page is not evidence that the feature is
available on `gridex.tech`.

## Български

**Път:** „Клиенти и договори → Потребители и покани“; постоянен адрес
`/customers/users/`. Менюто е за влязъл администратор на организация. В демо
режим се показва само обяснение и не се изпраща поща. Получателят вижда и
приема чакащите покани в „Профил“, не в административния екран.

За покана на член избери организацията, въведи имейла, избери роля от падащото
меню и маркирай поне един разрешен Обект. Наличните роли са „Наблюдател“
(четене), „Оператор“ (оперативни действия), „Енергиен мениджър“ (стратегии и
конфигурация) и „Интегратор“ (настройки на устройства). Сегашният поток не
позволява делегиране на роля „Администратор на организация“. Показват се само
Обектите, до които администраторът има достъп; backend проверява това преди
създаване на поканата и повторно при приемането ѝ. Самото изпращане не дава
членство — то започва след успешно приемане. Изпратената покана може да се
отмени в същата сесия; постоянен списък на изпратените покани още липсва.

При „Зареждане“ изчакай проверката на права, Обекти и покани. Ако няма
достъпни Обекти, изпращането остава недостъпно. При грешка или недостъпна
услуга не приемай, че писмото е изпратено; обнови и провери състоянието.
Невлязъл потребител и потребител без администраторски права не могат да
изпращат покани. Глобалната покана за първи администратор на **нова**
организация още не е активна: новата организация трябва да има собствен
OpenRemote realm, чието провизиране и multi-realm вход предстоят.

## English

**Path:** Customers & contracts → Users & invitations; stable URL
`/customers/users/`. The menu is for signed-in organisation administrators.
Demo shows an explanation only and sends no email. Recipients view and accept
pending invitations in Profile, not on the administrative screen.

To invite a member, choose the organisation, enter an email, select a role
from the dropdown and check at least one permitted Site. Available roles are
Viewer (read), Operator (operational actions), Energy manager (strategies and
configuration), and Integrator (device configuration). The current flow cannot
delegate the organisation-administrator role. Only Sites available to the
administrator are displayed, and the backend validates that scope both before
creating the invitation and again at acceptance. Sending alone grants no
membership; acceptance is required. A sent invitation can be revoked in the
same session. A persistent sent-invitation list is not available yet.

Wait for rights, Sites and invitations to load. With no available Sites,
sending is disabled. On an error or unavailable service, do not assume email
was sent; refresh and verify state. Anonymous and non-admin users cannot send
invitations. The global invitation for the first administrator of a **new**
organisation is not active yet: every new organisation requires its own
OpenRemote realm, and provisioning/multi-realm login remain to be implemented.
