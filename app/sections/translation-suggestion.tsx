"use client";
import { useEffect, useState } from 'react';

const copy = {
  fr: { title:'Vous préférez le français ?', help:'Comment traduire', dismiss:'Non merci', body:'GrideX est disponible en bulgare et en anglais. Pour une traduction automatique, ouvrez le menu de votre navigateur et choisissez « Traduire », puis « Français ». Cette option dépend du navigateur.', warning:'La traduction peut transmettre le texte au fournisseur du navigateur. Vérifiez les valeurs et les consignes avant toute action sur un équipement. Aucun texte n’est envoyé automatiquement par GrideX.' },
  es: { title:'¿Prefieres español?', help:'Cómo traducir', dismiss:'No, gracias', body:'GrideX está disponible en búlgaro e inglés. Para una traducción automática, abre el menú del navegador y selecciona « Traducir » y después « Español ». Esta opción depende del navegador.', warning:'La traducción puede enviar texto al proveedor del navegador. Comprueba los valores y las instrucciones antes de actuar sobre un equipo. GrideX no envía texto automáticamente.' },
  de: { title:'Lieber auf Deutsch?', help:'So übersetzen Sie', dismiss:'Nein, danke', body:'GrideX ist auf Bulgarisch und Englisch verfügbar. Öffnen Sie für eine automatische Übersetzung das Browsermenü und wählen Sie „Übersetzen“, dann „Deutsch“. Die Verfügbarkeit hängt vom Browser ab.', warning:'Bei der Übersetzung kann Text an den Browseranbieter gesendet werden. Prüfen Sie Werte und Hinweise vor jeder Geräteaktion. GrideX sendet keine Texte automatisch.' },
  it: { title:'Preferisci l’italiano?', help:'Come tradurre', dismiss:'No, grazie', body:'GrideX è disponibile in bulgaro e inglese. Per una traduzione automatica, apri il menu del browser e scegli « Traduci », poi « Italiano ». La disponibilità dipende dal browser.', warning:'La traduzione può inviare testo al fornitore del browser. Controlla valori e istruzioni prima di intervenire sui dispositivi. GrideX non invia testo automaticamente.' },
};
type SuggestedLanguage = keyof typeof copy;
const dismissedKey='gridex.translation-suggestion.dismissed.v1';

export function TranslationSuggestion() {
  const [language,setLanguage]=useState<SuggestedLanguage|null>(null);
  const [expanded,setExpanded]=useState(false);
  useEffect(()=>{
    try { if(localStorage.getItem('gridex.ui-language')||localStorage.getItem(dismissedKey))return; } catch { /* Storage is optional. */ }
    if(window.location.pathname.startsWith('/en'))return;
    for(const locale of navigator.languages || [navigator.language]) {
      const base=locale.toLowerCase().split('-')[0];
      if(base==='en'||base==='bg')return;
      // Browser-only hint is deliberately absent from the server-rendered HTML.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if(base in copy){setLanguage(base as SuggestedLanguage);return;}
    }
  },[]);
  if(!language)return null;
  const text=copy[language];
  return <aside className="card translation-suggestion" lang={language} translate="no" aria-label={text.title}>
    <strong>{text.title}</strong>
    <div className="translation-actions">
      <button className="secondary-btn" type="button" aria-expanded={expanded} aria-controls="translation-guidance" onClick={()=>setExpanded(v=>!v)}>{text.help}</button>
      <button className="secondary-btn" type="button" onClick={()=>{setLanguage(null);try{localStorage.setItem(dismissedKey,'1');}catch{/* Storage is optional. */}}}>{text.dismiss}</button>
    </div>
    {expanded&&<div id="translation-guidance"><p>{text.body}</p><p>{text.warning}</p></div>}
  </aside>;
}
