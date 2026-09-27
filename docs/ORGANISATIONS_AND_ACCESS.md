# Организации и достъп / Organisations and access

Статус 2026-09-27: публичният Docusaurus сайт е `doc.gridex.tech`.
Получаването на първата клиентска покана и входът са докладвани от клиента;
автоматичното завършване след вход е реализирано във frontend тестова версия,
но още не е потвърдено в реалната внедрена среда.

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
2. Влезте в организацията, посочена в поканата.
3. Ако сте първият администратор на нова организация, порталът завършва
   точно Вашата покана след вход и сървърна проверка — без втори бутон.
   Поканите за колеги в съществуваща организация засега се приемат в „Профил“.
   Изпращането на имейл само по себе си не дава достъп.
4. След потвърдено завършване виждате само разрешените Ви Обекти и функции. Ако не виждате
   очакван Обект, поискайте администраторът да провери правата Ви.

Поканите са еднократни и ограничени във времето. Ако линкът е изтекъл или
поканата е отменена, поискайте нова; не опитвайте да се регистрирате повторно
с друг акаунт.

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
2. Sign in to the organisation named in the invitation.
3. For the first administrator of a new organisation, the portal completes
   the matching invitation after sign-in and server verification, without a
   second button. Existing-organisation member invitations still require
   acceptance in Profile. Email delivery alone grants no access.
4. After confirmed completion you will see only authorised Sites and features. Ask your administrator if
   a Site you expect is missing.

Invitations are single-use and expire. Ask for a new invitation if a link has
expired or been revoked; do not create a second identity as a workaround.

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
