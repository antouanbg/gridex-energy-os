# Change review workflow / Процес за преглед на промени

## English

GrideX uses GitHub Discussions, Issues and Pull Requests as three distinct stages:

```text
Discussion (idea) -> Issue (defined request) -> Pull Request (reviewable implementation)
                                      |
                                      +-> Owner decision -> merge or decline
```

Project monitoring reviews new or updated Discussions, Issues and Pull Requests and prepares a recommendation for the project owner. The review states the goal, affected layer, benefits, risks, safety/security impact, test evidence and recommended next action. Monitoring does not merge, close, or change external contributions automatically.

Use `status: triage` for a new request. Use `status: owner-decision` only when an informed product, architecture or safety decision is required from the owner.

## Български

GrideX използва GitHub Discussions, Issues и Pull Requests като три отделни етапа:

```text
Discussion (идея) -> Issue (оформена заявка) -> Pull Request (реализация за преглед)
                                         |
                                         +-> Решение на собственика -> сливане или отказ
```

Мониторингът на проекта преглежда новите или обновени Discussions, Issues и Pull Requests и подготвя препоръка към собственика. Тя описва целта, засегнатия слой, ползите, рисковете, влиянието върху безопасността/сигурността, тестовете и предложената следваща стъпка. Мониторингът не слива, затваря или променя външни предложения автоматично.

За нова заявка се използва `status: triage`. `status: owner-decision` се използва само когато е необходимо информирано продуктово, архитектурно или безопасностно решение от собственика.
