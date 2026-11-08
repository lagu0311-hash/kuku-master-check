// Approved watercolor character artwork, cropped directly from the selected illustration.
// Preserve animalSvg(type, pose) and the established animation hooks.
// No code-drawn substitutes: the visible animal pixels are sourced from the approved image.
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
export function animalSvg(type='cat',pose='jump') {
  const kind=Object.hasOwn(SPRITES,type)?type:'cat';
  const validPose=['home','jump','spin','clap','star','weights','coach'].includes(pose)?pose:'jump';
  const file=SPRITES[kind][validPose]??SPRITES[kind].default;
  return `<span class="animal animal-${kind} pose-${validPose}" role="img" aria-label="${NAMES[kind]}のイラスト">
    <span class="animal-friend"><img src="./assets/characters/${file}" alt="" draggable="false"></span>
  </span>`;
}
