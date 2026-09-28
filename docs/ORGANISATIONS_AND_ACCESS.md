# Организации и достъп / Organisations and access

Статус 2026-09-28: публичната документация е в Docusaurus на
`doc.gridex.tech`. Първият клиент потвърди получаване на покана и вход;
автоматичното завършване и пълната изолация още се проверяват в реалната среда.

## Български

### Как получавам достъп?

GrideX е платформа с достъп чрез покана. Можете да разгледате демонстрацията
без вход, но тя съдържа примерни, не Ваши данни. Бутонът „Вход“ не създава
самостоятелно акаунт или администраторски права.

Администраторът на платформата изпраща покана до първия администратор на нова
организация. След приемането ѝ този администратор може да кани колеги само в
своята организация. Ако сте служител и нямате покана, потърсете нейния
администратор. Ако представлявате нова организация, свържете се с екипа на
GrideX за първата покана.

### Какво става след поканата?

1. Отворете линка в имейла, потвърдете адреса и задайте парола в защитения
   екран за вход. Никой администратор не трябва да иска паролата Ви.
2. От `gridex.tech` натиснете „Вход“, въведете поканения имейл и продължете
   към защитения екран на съответната организация. Паролата се въвежда само там.
   Линкът от поканата може да отвори и директно правилната организация.
3. След потвърждаване на имейла и задаване на парола първата администраторска
   покана се довършва автоматично при вход и сървърна проверка. Не е нужен
   втори бутон „Приеми“. Поканите за колеги още се приемат от „Профил“.
4. След потвърдено активиране виждате само разрешените Ви Обекти и функции. Ако не виждате
   очакван Обект, поискайте администраторът да провери правата Ви.

Поканите са еднократни и ограничени във времето. Ако поканата за първи
администратор още е със статус „Изпратена“, но линкът е изтекъл, супер
администраторът може да натисне „Изпрати поканата наново“ до „Отмени“ в
„Клиенти и договори → Потребители и покани“. Системата изпраща нов 24-часов
линк за **същия** акаунт и организация, без дублиране. След приемане или
отмяна бутонът липсва. При неясен резултат от изпращането не повтаряйте
автоматично — първо проверете състоянието. Ако забравите вече зададена
парола, използвайте „Забравена парола“ в защитения вход на **правилната**
организация; това е различно от повторно изпращане на покана.

### Кой какво може?

| Роля | Обхват |
| --- | --- |
| Администратор на платформата | Започва създаването на нова организация и кани първия ѝ администратор. Това право не следва само от имейл или надпис „admin“. |
| Администратор на организация | Управлява хората и разрешените Обекти само в своята организация; кани членове с конкретна роля и обхват. |
| Наблюдател | Чете разрешените данни. |
| Оператор | Изпълнява разрешените оперативни действия. |
| Енергиен мениджър | Работи с разрешените стратегии и настройки. |
| Интегратор | Работи с разрешените настройки на устройства. |

Всяка клиентска организация има отделно пространство в OpenRemote. Правата за
Обект се дават изрично; членство без разрешен Обект не показва чужди данни.
Текущият поток за покана на член **не позволява** да се делегира роля
„Администратор на организация“. Служебната идентичност за настройка е само
за backend и не е отделен човешки вход.

### Къде се изпращат покани?

За упълномощените администратори екранът е „Клиенти и договори → Потребители
и покани“ (`/customers/users/`). Нов клиент въвежда своите данни едва след
като получи покана; публичното демо не изпраща имейли. Първото реално
завършване на първата клиентска организация през реалния внедрен портал още
се проверява; не представяме тестовата версия като завършен production тест.

## English

### How do I get access?

GrideX live access is invitation-only. The anonymous demo contains sample
data, not your organisation's data. Sign in does not self-register an account
or create administrator rights. The platform administrator invites the first
administrator of a new organisation. Once accepted, that administrator can
invite colleagues only within their organisation. Ask your organisation
administrator for a member invitation, or contact the GrideX team if yours is
a new organisation.

### What happens next?

1. Open the email link, verify your address and set a password on the secure
   sign-in screen. Do not share your password with an administrator.
2. Select Sign in at `gridex.tech`, enter the invited email and continue to
   the correct organisation's protected login. Enter your password only there.
3. The first administrator invitation completes after verified email, password
   setup, sign-in and server checks, without a second Accept button. Member
   invitations still require acceptance in Profile. Email alone grants no access.
4. After confirmed completion you will see only authorised Sites and features. Ask your administrator if
   a Site you expect is missing.

Invitations are single-use and expire. If a first-administrator invitation is
still **sent**, the platform administrator can use **Resend invitation** beside
**Revoke** in Customers & contracts → Users & invitations. This issues a fresh
24-hour email link for the same user and realm; it does not create another
account or organisation. The button is absent after acceptance or revocation.
If delivery is unconfirmed, the administrator must check its status rather
than retry automatically. A revoked invitation needs administrator review.

### Who can do what?

| Role | Scope |
| --- | --- |
| Platform administrator | Starts a new organisation and invites its first administrator; neither an email match nor an `admin` label grants this right. |
| Organisation administrator | Manages people and permitted Sites only within their organisation; invites members with an explicit role and Site scope. |
| Viewer | Reads authorised data. |
| Operator | Performs authorised operational actions. |
| Energy manager | Works with authorised strategies and settings. |
| Integrator | Works with authorised device settings. |

Each customer organisation has a separate OpenRemote space. Site grants are
explicit; membership without a Site grant does not expose another customer's
data. The current member invitation flow cannot delegate the organisation
administrator role. The setup service identity belongs to the backend and is
not a separate human sign-in.

Authorised administrators use Customers & contracts → Users & invitations at
`/customers/users/`. The demo sends no email. First real delivery and
completion for a new customer organisation is not yet verified on the deployed
portal; a local browser test alone is not production acceptance.
