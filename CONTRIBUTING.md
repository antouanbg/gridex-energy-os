# Contributing to GrideX Energy OS

## English

Thank you for helping improve GrideX Energy OS. The project accepts product ideas, bug reports, documentation improvements and code contributions through GitHub.

### Where to propose something

| Purpose | Use | Expected result |
| --- | --- | --- |
| Early idea, integration question or architecture discussion | [GitHub Discussions](https://github.com/antouanbg/gridex-energy-os/discussions) | Shared product and technical decision |
| Clearly scoped feature request or defect | [GitHub Issues](https://github.com/antouanbg/gridex-energy-os/issues) | Traceable request with acceptance criteria |
| Finished, reviewable implementation | Pull Request linked to an Issue or Discussion | Code review and an owner decision |

Please do not push directly to `main`. Start with a Discussion for an unscoped idea, then create an Issue once the desired outcome is clear.

### Review path

1. A maintainer checks scope, affected layer, safety, security and license implications.
2. Requests that require a product decision receive the `status: owner-decision` label.
3. The project owner receives a concise recommendation: benefit, cost/risk, affected components, test evidence and proposed next step.
4. Only after approval may a Pull Request be accepted. No external contribution is merged automatically.

### Engineering and safety requirements

- Link every Pull Request to its Issue or Discussion.
- Add or update tests and documentation when behaviour changes.
- Do not include passwords, tokens, private keys, customer data or real site-network details.
- Never introduce an automatic write to live electrical equipment without explicit project approval, safety limits and test evidence.
- Follow [AGENTS.md](AGENTS.md) and the repository architecture documents.

## Български

Благодарим за помощта по GrideX Energy OS. Проектът приема продуктови идеи, доклади за проблеми, документация и код чрез GitHub.

### Къде се предлага промяна

| Цел | Място | Резултат |
| --- | --- | --- |
| Ранна идея, въпрос за интеграция или архитектурна дискусия | [GitHub Discussions](https://github.com/antouanbg/gridex-energy-os/discussions) | Общо продуктово и техническо решение |
| Добре описана функционалност или дефект | [GitHub Issues](https://github.com/antouanbg/gridex-energy-os/issues) | Проследима заявка с критерии за приемане |
| Завършена реализация за преглед | Pull Request, свързан с Issue или Discussion | Code review и решение на собственика |

Не се правят директни промени в `main`. За неоформена идея започнете с Discussion, а след уточняване на резултата създайте Issue.

### Процес на преглед

1. Поддръжката преглежда обхвата, засегнатия слой, безопасността, сигурността и лицензионните последствия.
2. Заявките, за които е нужно продуктово решение, получават етикет `status: owner-decision`.
3. Собственикът получава кратка препоръка: полза, цена/риск, засегнати компоненти, тестове и предложена следваща стъпка.
4. Pull Request се приема само след одобрение. Външни промени не се сливат автоматично.

### Инженерни и безопасни изисквания

- Всеки Pull Request трябва да е свързан с Issue или Discussion.
- При промяна на поведение се обновяват тестовете и документацията.
- Не добавяйте пароли, токени, частни ключове, клиентски данни или реални мрежови данни за обекти.
- Не добавяйте автоматично управление на реално електрическо оборудване без изрично одобрение, лимити за безопасност и тестови доказателства.
- Следвайте [AGENTS.md](AGENTS.md) и архитектурните документи в хранилището.
