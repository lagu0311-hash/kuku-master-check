// Original soft storybook animals for 九九マスターチェック.
// Preserve the existing animalSvg(type, pose) interface and animation class hooks.
const OUTLINE = '#936540';
const LINE = '#6d432d';
const animals = {
  cat: { fur:'#fff4de', patch:'#f6bc67', inner:'#f8d2ba', cheek:'#f6b8aa', belly:'#fffaf0', nose:'#bd8062' },
  dog: { fur:'#f8d09b', patch:'#e8a96c', inner:'#ffecce', cheek:'#f9af9e', belly:'#fff9e9', nose:'#8c5b40' },
  squirrel: { fur:'#eac38b', patch:'#bd8859', inner:'#ffe7c8', cheek:'#f3b0a1', belly:'#fff1d9', nose:'#9e694d' },
  rabbit: { fur:'#fff3e8', patch:'#f8ccd2', inner:'#f5b5b9', cheek:'#f7b4af', belly:'#fffdf8', nose:'#ba8079' }
};
const shape = (d, fill, width=5, stroke=OUTLINE) => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"/>`;
const line = (d, stroke=LINE, width=4) => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"/>`;

function ears(type,c) {
  if(type==='rabbit') return `
    ${shape('M74 90 C64 65 52 22 69 17 C83 13 95 45 99 76 Z',c.fur)}
    ${shape('M116 77 C118 43 129 13 145 21 C161 29 142 75 141 89 Z',c.fur)}
    <path d="M77 31 Q76 47 89 75 M139 33 Q129 50 129 74" stroke="${c.inner}" stroke-width="11" fill="none" stroke-linecap="round"/>`;
  if(type==='dog') return `
    ${shape('M65 75 C47 38 32 43 32 73 C30 95 46 110 64 98 Z',c.patch)}
    ${shape('M150 73 C168 40 186 46 185 75 C185 97 170 109 152 98 Z',c.patch)}`;
  const left = type==='squirrel' ? 'M56 86 L64 55 Q76 45 89 70 L90 93 Z' : 'M54 94 L58 52 Q60 39 71 43 L100 68 Z';
  const right = type==='squirrel' ? 'M126 71 Q147 43 157 56 L163 94 L132 92 Z' : 'M119 68 L148 40 Q158 37 162 54 L168 95 Z';
  return `${shape(left,c.fur)}${shape(right,c.fur)}
    <path d="M66 64 L66 82 L84 76 Z M151 63 L136 77 L153 83 Z" fill="${c.inner}"/>`;
}

function tail(type,c) {
  if(type==='squirrel') return `
    ${shape('M150 173 C168 141 178 106 197 103 C223 100 225 142 208 165 C227 177 211 206 187 204 C170 203 160 195 149 189 Z',c.fur)}
    ${line('M181 182 Q206 189 205 167 Q198 154 187 168',c.patch,8)}`;
  if(type==='rabbit') return shape('M149 188 Q184 166 184 194 Q181 214 156 204 Z',c.fur);
  if(type==='dog') return shape('M154 183 Q172 181 181 160 Q195 169 184 190 Q172 206 153 200 Z',c.fur);
  return `${shape('M147 190 Q178 196 188 173 Q197 149 180 149 Q168 149 167 163',c.fur)}
    ${line('M179 165 Q190 168 184 180',c.patch,6)}`;
}

function head(type,c) {
  const forehead = type==='cat'
    ? `<path d="M105 57 Q130 48 142 49 Q155 54 161 68 Q141 83 114 79 Q100 72 105 57 Z" fill="${c.patch}" opacity=".94"/>`
    : type==='dog'
    ? `<path d="M55 95 Q49 64 76 56 Q98 49 110 62 Q119 75 109 91 Q90 103 55 95 Z" fill="${c.patch}" opacity=".85"/>`
    : type==='squirrel'
    ? `<path d="M85 61 L92 84 M111 58 L111 83 M134 61 L129 84" stroke="${c.patch}" stroke-width="8" fill="none" stroke-linecap="round"/>`
    : '';
  const cheeks = `<ellipse cx="70" cy="119" rx="12" ry="7" fill="${c.cheek}" opacity=".64"/>
                  <ellipse cx="149" cy="119" rx="12" ry="7" fill="${c.cheek}" opacity=".64"/>`;
  const muzzle = type==='dog' ? `<ellipse cx="110" cy="119" rx="48" ry="31" fill="${c.belly}" opacity=".96"/>` :
    type==='squirrel' ? `<ellipse cx="110" cy="126" rx="47" ry="28" fill="${c.belly}" opacity=".95"/>` : '';
  return `${ears(type,c)}
    ${shape('M51 100 C46 72 69 56 100 56 Q128 51 150 66 C174 84 173 118 159 138 Q143 155 110 157 Q72 156 57 139 C49 130 48 112 51 100 Z',c.fur,5.5)}
    ${forehead}${muzzle}${cheeks}
    ${line('M77 104 Q85 94 93 104',LINE,4.6)}
    ${line('M125 104 Q134 94 142 104',LINE,4.6)}
    <ellipse cx="110" cy="114" rx="5.2" ry="4.3" fill="${c.nose}"/>
    ${line('M110 119 Q107 132 98 125 M110 119 Q115 132 125 125',LINE,3.8)}
    ${type==='cat' ? `${line('M60 118 L48 116 M61 125 L48 129 M159 118 L172 116 M158 125 L172 129',OUTLINE,2.7)}` : ''}`;
}

function scarf(type) {
  if(type==='cat') return `
    ${shape('M72 144 Q109 155 148 144 L126 175 Q113 167 104 160 L88 170 Z','#8fc5ef',3.6)}
    <path d="M83 150 L96 165 M99 153 L112 166 M116 151 L131 164 M78 158 Q107 157 139 154" stroke="#fff9ed" stroke-width="4" fill="none" opacity=".83"/>
    ${shape('M76 148 Q67 154 72 165 Q82 172 88 162 L86 152 Z','#79b7e6',3.1)}`;
  if(type==='dog') return `
    ${shape('M76 143 Q109 153 145 143 L121 173 L108 164 L94 173 Z','#ed8d73',3.6)}
    <circle cx="100" cy="155" r="4" fill="#fff7e7"/><circle cx="119" cy="155" r="4" fill="#fff7e7"/><circle cx="112" cy="165" r="3" fill="#fff7e7"/>`;
  if(type==='rabbit') return `
    ${shape('M131 145 Q154 133 162 147 Q160 162 145 158 L152 171 Q144 181 133 159 Z','#ec9fad',3.3)}
    <circle cx="138" cy="153" r="5" fill="#ffdbe1"/>`;
  return `${shape('M74 143 Q110 154 147 144 L124 167 Q111 157 102 160 L84 166 Z','#f4c85c',3.6)}`;
}

function limbs(pose,c) {
  const up = ['jump','spin','star'].includes(pose);
  const clap = pose==='clap';
  const lift = pose==='coach';
  if(clap) return `
    <g class="arm-left">${shape('M76 148 Q86 149 98 160 Q106 149 113 158 Q120 176 107 184 Q93 184 77 168 Z',c.fur,4.4)}</g>
    <g class="arm-right">${shape('M144 148 Q134 149 123 160 Q116 149 110 158 Q103 176 116 184 Q129 184 144 168 Z',c.fur,4.4)}</g>`;
  if(up || lift) return `
    <g class="arm-left">${shape('M77 146 C62 140 54 128 49 117 C42 107 32 113 34 125 C38 145 54 164 82 168 Z',c.fur,4.4)}</g>
    <g class="arm-right">${shape('M140 147 C153 136 164 125 169 114 Q175 102 183 112 Q190 121 184 137 Q169 164 138 168 Z',c.fur,4.4)}</g>`;
  return `
    <g class="arm-left">${shape('M78 148 Q60 150 47 154 Q34 154 36 167 Q39 182 60 180 L86 168 Z',c.fur,4.4)}</g>
    <g class="arm-right">${shape('M141 148 Q158 150 171 154 Q184 154 182 167 Q179 182 158 180 L133 168 Z',c.fur,4.4)}</g>`;
}

function extra(type,pose) {
  if(pose==='star') return `
    ${shape('M170 69 L178 84 L195 86 L183 99 L186 116 L170 108 L155 116 L158 99 L146 86 L163 84 Z','#ffcd61',3.4,'#d8a14c')}`;
  if(pose==='weights' || pose==='coach') return `
    <g class="dumbbell">
      ${line('M28 160 H62','#7898a7',6)}
      <rect x="25" y="146" width="10" height="28" rx="4" fill="#8bb6d0" stroke="${OUTLINE}" stroke-width="2.5"/>
      <rect x="53" y="146" width="10" height="28" rx="4" fill="#8bb6d0" stroke="${OUTLINE}" stroke-width="2.5"/>
      ${line('M161 160 H195','#7898a7',6)}
      <rect x="159" y="146" width="10" height="28" rx="4" fill="#8bb6d0" stroke="${OUTLINE}" stroke-width="2.5"/>
      <rect x="189" y="146" width="10" height="28" rx="4" fill="#8bb6d0" stroke="${OUTLINE}" stroke-width="2.5"/>
    </g>`;
  if(type==='squirrel') return `
    ${shape('M104 160 Q109 148 122 158 L126 178 Q117 189 105 178 Z','#b77942',3)}
    ${shape('M103 158 Q115 139 126 159 Z','#e8aa56',2.8)}
    <path d="M115 153 L115 167" stroke="${OUTLINE}" stroke-width="2.5"/>`;
  return '';
}

export function animalSvg(type='cat', pose='jump') {
  const kind = Object.hasOwn(animals,type) ? type : 'cat';
  const c = animals[kind];
  const names = {cat:'ねこ',dog:'いぬ',squirrel:'りす',rabbit:'うさぎ'};
  return `<svg class="animal animal-${kind} pose-${pose}" viewBox="0 0 220 238" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${names[kind]}のイラスト">
    <ellipse cx="109" cy="225" rx="62" ry="9" fill="#dbe1a4" opacity=".64"/>
    <g class="animal-friend">
      ${tail(kind,c)}
      ${shape('M77 143 Q89 137 110 140 Q136 138 146 151 Q153 173 153 197 Q155 208 142 212 Q125 215 117 205 Q107 215 95 207 Q86 217 72 208 Q65 199 68 182 Q69 154 77 143 Z',c.fur,5)}
      <ellipse cx="111" cy="185" rx="27" ry="25" fill="${c.belly}" opacity=".66"/>
      <path d="M91 204 L89 209 M132 204 L134 209" stroke="${OUTLINE}" stroke-width="3.1" stroke-linecap="round"/>
      ${limbs(pose,c)}
      ${head(kind,c)}
      ${scarf(kind)}
      ${extra(kind,pose)}
    </g>
  </svg>`;
}
