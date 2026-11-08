// Approved watercolor character artwork, cropped directly from the selected illustration.
// Keep the original animal pixels unchanged; pose accessories are separate decorations.
const NAMES = {cat:'ねこ',dog:'いぬ',rabbit:'うさぎ',squirrel:'りす'};
const SPRITES = Object.freeze({
  cat:Object.freeze({
    home:'cat-home.webp',jump:'cat-jump.webp',spin:'cat-jump.webp',
    clap:'cat-clap.webp',star:'cat-star.webp',
    weights:'cat-weights.webp',coach:'cat-jump.webp'
  }),
  dog:Object.freeze({default:'dog-home.webp'}),
  rabbit:Object.freeze({default:'rabbit-home.webp'}),
  squirrel:Object.freeze({default:'squirrel-home.webp'})
});
const DOG_WEIGHT = `<svg class="pose-accessory dog-dumbbell" viewBox="0 0 90 46" aria-hidden="true" focusable="false">
  <path d="M20 23 H70" stroke="#ae8266" stroke-width="9" stroke-linecap="round"/>
  <rect x="7" y="9" width="17" height="28" rx="7" fill="#e9ab9c" stroke="#ae8266" stroke-width="3"/>
  <rect x="66" y="9" width="17" height="28" rx="7" fill="#e9ab9c" stroke="#ae8266" stroke-width="3"/>
  <path d="M14 14 Q11 20 14 27 M73 14 Q70 20 73 27" stroke="#ffe4c8" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`;
function poseDecoration(kind,pose) {
  if(kind==='dog'&&pose==='weights')return `<span class="pose-weights" aria-hidden="true">${DOG_WEIGHT}${DOG_WEIGHT}</span>`;
  if(pose==='coach')return '<span class="pose-accessory cheer-bubble" aria-hidden="true">ファイト！</span>';
  return '';
}
export function animalSvg(type='cat',pose='jump') {
  const kind=Object.hasOwn(SPRITES,type)?type:'cat';
  const validPose=['home','jump','spin','clap','star','weights','coach'].includes(pose)?pose:'jump';
  const file=SPRITES[kind][validPose]??SPRITES[kind].default;
  const description=validPose==='weights'?'の筋トレ':validPose==='coach'?'の応援':'のイラスト';
  return `<span class="animal animal-${kind} pose-${validPose}" role="img" aria-label="${NAMES[kind]}${description}">
    <span class="animal-friend"><img src="./assets/characters/${file}" alt="" draggable="false">${poseDecoration(kind,validPose)}</span>
  </span>`;
}
