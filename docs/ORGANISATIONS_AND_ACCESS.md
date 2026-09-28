# Организации и достъп / Organisations and access

Статус 2026-09-28: публичната документация е в Docusaurus на
`doc.gridex.tech`. Първата покана към клиент е доставена, но приемането и
пълният достъп още се проверяват.

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
   покана се довършва автоматично при вход. Не е нужен втори бутон „Приеми“.
4. След активиране виждате само разрешените Ви Обекти и функции. Ако не виждате
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
изпращане и приемане за нова клиентска организация още са в процес на
проверка, затова не ги представяме като завършен тест.

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
3. The first administrator invitation completes automatically after email
   verification, password setup and sign-in. No second Accept button is needed.
   Email delivery alone grants no access.
4. You will see only authorised Sites and features. Ask your administrator if
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
acceptance for a new customer organisation are not yet end-to-end verified.

## Suspending and restoring an approved organisation

Prepared for publication; the controls are not yet available in the live portal. Access controls were verified with synthetic organisations; the first real customer suspension and its email delivery remain unverified. This is separate from resending any onboarding invitation.

Only the verified super administrator can use **Customers & contracts → Users & invitations → New organisation → Approved organisations**. The pilot organisation is protected and is not listed. A recent sign-in is required for changes.

Choose **Suspend organisation**, review the organisation name, then confirm. Access is blocked; existing sessions and streams end. Accounts, roles, Sites and OpenRemote inventory remain intact. Members see “Your organisation is temporarily suspended. Contact the super administrator.”

The verified first administrator receives one BG/EN suspension notice per suspension operation. Queued does not mean delivered. **Check delivery** checks the recipient's provider delivery event without sending again. An unknown or failed result must be investigated; repeating the button never automatically resends an uncertain email. This mandatory access notice is separate from optional event subscriptions.

If a step fails, portal/API access stays blocked and the existing operation remains available for reconciliation. A pending operation is not confirmation that the OpenRemote change has completed. Choose **Complete existing operation** instead of creating another request. Notification problems do not restore access. **Complete notification** can finish a notice that has not yet been attempted.

Choose **Restore access** and confirm to restore the existing permissions after the realm is verified. Members must sign in again; old tokens do not regain access. Restoration sends no new invitation or password email and does not recreate accounts.

## Временно спиране и възстановяване на одобрена организация

Подготвено за публикуване; бутоните още не са налични в живия портал. Достъпът е проверен със синтетични организации; първото реално клиентско спиране и доставката на уведомлението още не са проверени. Това е отделно от повторно изпращане на покана.

Само провереният супер администратор използва **Клиенти и договори → Потребители и покани → Нова организация → Одобрени организации**. Пилотната организация е защитена и не присъства в списъка. За промяна е нужен скорошен вход.

Изберете **Спри организацията**, проверете името и потвърдете. Достъпът се блокира; текущите сесии и потоци се прекратяват. Акаунтите, ролите, Обектите и OpenRemote инвентарът се запазват. Членовете виждат „Организацията е временно спряна. Свържете се със супер администратора.“

Провереният първи администратор получава едно BG/EN уведомление за всяка операция по спиране. „В опашка“ не означава доставено. **Провери доставката** проверява събитието за доставка до получателя, без повторно изпращане. Неясен или неуспешен резултат изисква проверка; повторно натискане никога не изпраща автоматично имейл с неясна доставка. Задължителното уведомление за достъп е отделно от доброволния абонамент за събития.

При отказ достъпът през портала/API остава блокиран и съществуващата операция може да се довърши. Чакаща операция не потвърждава, че OpenRemote промяната е завършила. Изберете **Довърши съществуващата операция**, вместо да създавате нова заявка. Проблем с уведомлението не възстановява достъпа. **Довърши уведомяването** довършва имейл, чието изпращане още не е започнало.

Изберете **Възстанови достъпа** и потвърдете. След проверка на realm-а се връщат съществуващите права. Членовете влизат отново; старите токени не получават достъп. Възстановяването не изпраща нова покана или писмо за парола и не създава повторно акаунти.
