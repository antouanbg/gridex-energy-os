# Handoff — GrideX Energy OS

Repository / GitHub: `antouanbg/gridex-energy-os`

## English

This handoff records portal work that is implemented in branches but not yet
merged to `main`. It contains no credentials, production configuration or
deployment data.

1. **PV project configuration**
   - Current review: draft PR #11.
   - Scope: versioned site and PV-array configuration forms and the frontend
     contract for the GrideX API.
   - Next action: review validation, required PV fields and the backend
     configuration contract; merge only after explicit approval.

2. **Locale-by-region default**
   - Current review: draft PR #12.
   - Scope: default Bulgarian locale for a Bulgarian visitor and English for
     other visitors, while retaining explicit language choice.
   - Next action: review privacy behaviour, fallback handling and the mobile
     user experience; merge only after explicit approval.

3. **Live Edge health presentation**
   - Current review: draft PR #13.
   - Scope: render backend-provided Edge health rather than treating a demo
     timestamp as device evidence.
   - Dependency: backend health ingestion and snapshot contract.
   - Next action: review the API fallback and demo-state wording; merge only
     after explicit approval and backend-contract alignment.

## Български

Този handoff записва portal работа, която е имплементирана в branch-ове, но
още не е merge-ната към `main`. Не съдържа credentials, production
конфигурация или deployment данни.

1. **PV проектна конфигурация**
   - Текущ review: draft PR #11.
   - Обхват: versioned форми за site и PV масиви и frontend договорът за
     GrideX API.
   - Следваща стъпка: review на validation, задължителните PV полета и backend
     configuration договора; merge само след изрично одобрение.

2. **Locale по регион по подразбиране**
   - Текущ review: draft PR #12.
   - Обхват: BG locale по подразбиране за посетител от България и EN за други
     посетители, като се запазва изричният избор на език.
   - Следваща стъпка: review на privacy поведението, fallback-а и mobile user
     experience; merge само след изрично одобрение.

3. **Визуализация на live Edge health**
   - Текущ review: draft PR #13.
   - Обхват: визуализиране на подаденото от backend-а Edge health, вместо demo
     timestamp да се приема за доказателство за устройство.
   - Зависимост: backend health ingestion и snapshot договор.
   - Следваща стъпка: review на API fallback-а и текста в demo режим; merge
     само след изрично одобрение и синхрон с backend договора.
