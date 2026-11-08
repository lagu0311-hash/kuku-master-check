// Original, self-contained storybook animal illustrations; no external assets.
const colors = {
  cat: { body:'#fff2df', ear:'#ffd4d8', patch:'#f4c896', cheek:'#f8acb5', nose:'#d68d91' },
  dog: { body:'#f6dfb8', ear:'#be926a', patch:'#fff4dd', cheek:'#f3ada0', nose:'#9e7561' },
  squirrel: { body:'#efd0a6', ear:'#ffc9bd', patch:'#fff0cf', cheek:'#f3af9c', nose:'#a97969' },
  rabbit: { body:'#fff0eb', ear:'#ffc7d9', patch:'#fff8f1', cheek:'#f0afbb', nose:'#d88f9b' }
};
const path = (d, fill, stroke='#a77e74', sw=3) => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
export function animalSvg(type='cat', pose='jump') {
  const c=colors[type] || colors.cat;
  const ear = type==='rabbit'
    ? `${path('M80 69 Q64 9 77 7 Q97 9 100 68',c.body)}${path('M125 67 Q120 5 137 9 Q153 20 143 76',c.body)}${path('M84 59 Q73 20 79 18 Q88 21 93 61',c.ear,'none',0)}${path('M132 61 Q126 20 135 19 Q146 25 139 62',c.ear,'none',0)}`
    : type==='dog'
    ? `${path('M82 74 Q36 39 49 104 Q54 116 79 99',c.ear)}${path('M130 73 Q170 34 164 96 Q161 114 138 100',c.ear)}`
    : `${path('M67 87 L69 41 Q72 34 81 42 L99 67',c.body)}${path('M123 68 L146 40 Q152 35 155 47 L155 88',c.body)}${path('M75 50 L78 76 L92 68 Z',c.ear,'none',0)}${path('M141 50 L135 76 L148 73 Z',c.ear,'none',0)}`;
  const tail = type==='squirrel' ? `${path('M150 168 Q212 177 184 106 Q166 69 175 65 Q205 62 204 107 Q225 178 177 201 Q153 209 143 184',c.body)}`:
    type==='dog'?`${path('M145 161 Q176 146 167 129', 'none','#a77e74',7)}`:
    type==='rabbit'?`${path('M152 174 Q177 162 171 187 Q158 198 150 189',c.body)}`:
      `${path('M149 169 Q176 191 180 170 Q181 159 170 164','none','#b78c77',9)}`;
  const accessory = pose==='star' ? `<path d="M153 56 l7 13 14 2 -11 11 3 14 -13 -7 -12 7 3 -14 -10 -11 14 -2z" fill="#ffcf66" stroke="#d7a44d" stroke-width="2"/>`:
    pose==='coach' ? `<path d="M70 82 Q111 59 150 81" fill="none" stroke="#91bde5" stroke-width="10" stroke-linecap="round"/><path d="M139 73 l23 -13 -7 29" fill="#91bde5"/>` : '';
  const weights = pose==='weights' || pose==='coach' ? `<g class="dumbbell"><path d="M40 147 H83" stroke="#6c8da8" stroke-width="6" stroke-linecap="round"/><rect x="35" y="133" width="9" height="28" rx="4" fill="#a4b4c9" stroke="#738da9" stroke-width="2"/><rect x="75" y="133" width="9" height="28" rx="4" fill="#a4b4c9" stroke="#738da9" stroke-width="2"/></g>`:'';
  const jump=pose==='jump'||pose==='spin'||pose==='clap'||pose==='star';
  return `<svg class="animal animal-${type} pose-${pose}" viewBox="0 0 220 238" role="img" aria-label="${({cat:'ねこ',dog:'いぬ',squirrel:'りす',rabbit:'うさぎ'})[type]}のイラスト" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="111" cy="218" rx="55" ry="9" fill="#b7c5df" opacity=".23"/>
    <g class="animal-friend">
    ${tail}
    ${path('M82 174 Q71 201 92 205 L107 195 L120 205 Q144 203 137 174',c.body)}
    ${path('M79 155 Q55 165 61 188 Q81 205 94 186 L130 188 Q151 199 158 179 Q159 165 145 152 Q138 124 112 123 Q86 124 79 155',c.body)}
    <ellipse cx="110" cy="174" rx="24" ry="24" fill="${c.patch}" opacity=".68"/>
    <g class="arm-left">${path(jump?'M87 148 Q53 142 48 113 Q41 99 34 112 Q29 131 47 153 Q65 164 88 166': 'M85 152 Q53 163 44 143 Q34 135 30 147 Q29 161 55 174 Q72 182 90 169',c.body)}</g>
    <g class="arm-right">${path(jump?'M134 148 Q164 137 175 113 Q182 100 187 115 Q190 135 166 155 Q151 165 131 167':'M132 153 Q161 148 174 130 Q184 126 188 138 Q188 154 167 170 Q148 180 129 169',c.body)}</g>
    ${ear}
    ${path('M62 106 Q60 63 109 59 Q163 61 159 109 Q160 156 110 157 Q60 155 62 106',c.body)}
    ${type==='cat'?`<path d="M90 65 Q95 73 97 79 M109 62 Q110 72 111 76 M127 65 Q127 72 124 78" stroke="#dfba93" stroke-width="4" fill="none" stroke-linecap="round"/>`:''}
    ${type==='squirrel'?`<ellipse cx="106" cy="121" rx="35" ry="26" fill="${c.patch}"/>`:''}
    <path d="M82 106 Q91 97 100 107 M122 107 Q132 97 140 106" fill="none" stroke="#765c5b" stroke-width="3.8" stroke-linecap="round"/>
    <ellipse cx="78" cy="120" rx="11" ry="7" fill="${c.cheek}" opacity=".62"/><ellipse cx="142" cy="120" rx="11" ry="7" fill="${c.cheek}" opacity=".62"/>
    <path d="M104 117 Q110 111 117 117 Q111 125 104 117" fill="${c.nose}"/>
    <path d="M111 123 Q103 137 97 126 M111 123 Q119 137 126 126" stroke="#765c5b" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    ${type==='cat'?`<path d="M82 126 l-19 -3 M84 132 l-17 6 M137 126 l18 -3 M136 132 l17 6" stroke="#ba9b90" stroke-width="2" fill="none" stroke-linecap="round"/>`:''}
    <ellipse cx="103" cy="191" rx="5" ry="3" fill="#f9f4e9"/><ellipse cx="122" cy="192" rx="5" ry="3" fill="#f9f4e9"/>
    ${accessory}${weights}
    </g>
  </svg>`;
}
