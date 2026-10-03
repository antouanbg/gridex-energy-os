import type {UiLanguage} from '../i18n/messages';

export function InfrastructureCatalogue({lang}:{lang:UiLanguage}) {
  const en=lang==='en';
  const items=en?['ROCK Pi / edge controller','ESP / node controller','Smart meter','Router','Controller / gateway','Sensor','Cloud connector']:['ROCK Pi / edge контролер','ESP / възлов контролер','Електромер','Рутер','Контролер / шлюз','Сензор','Cloud connector'];
  return <details className="card infrastructure-catalogue"><summary>{en?'Infrastructure catalogue':'Каталог на инфраструктурата'}</summary>
    <p>{en?'Infrastructure connects the Site and its energy assets. The catalogue is not proof of a supported driver or an installed component. Registration and permissions remain in OpenRemote.':'Инфраструктурата свързва Обекта и енергийните му активи. Каталогът не означава работещ драйвер или инсталиран компонент. Завеждането и правата остават в OpenRemote.'}</p>
    <ul>{items.map(item=><li key={item}>{item}</li>)}</ul>
  </details>;
}
