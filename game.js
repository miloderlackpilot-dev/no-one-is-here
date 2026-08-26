const story = document.getElementById('story');
const choices = document.getElementById('choices');
const chapterLabel = document.getElementById('chapter-label');
const connectionState = document.getElementById('connection-state');
const memoryState = document.getElementById('memory-state');
const audioState = document.getElementById('audio-state');
const sessionId = document.getElementById('session-id');
const flash = document.getElementById('flash');
const distortion = document.getElementById('distortion');
const observer = document.getElementById('observer');

sessionId.textContent = Math.random().toString(36).slice(2, 8).toUpperCase();
const saveKey = 'no-one-is-here-v5';
let state = JSON.parse(localStorage.getItem(saveKey) || 'null') || {
  chapter: 1, answers: [], fear: 0, curiosity: 0, defiance: 0, honesty: 0, trust: 0, visits: 0
};
state.visits++;

function save() {
  localStorage.setItem(saveKey, JSON.stringify(state));
  updateHud();
}

function updateHud() {
  chapterLabel.textContent = `CHAPTER ${String(state.chapter).padStart(2, '0')}`;
  connectionState.textContent = state.chapter >= 4 ? 'SEVERED' : state.chapter === 3 ? 'UNSTABLE' : 'UNKNOWN';
  memoryState.textContent = `MEMORY: ${state.answers.length ? 'ACTIVE' : 'EMPTY'}`;
}

let audioContext = null;
function startAudio() {
  if (audioContext) return;
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const gain = audioContext.createGain();
    gain.gain.value = 0.008;
    gain.connect(audioContext.destination);
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 38;
    oscillator.connect(gain);
    oscillator.start();
    audioState.textContent = 'AUDIO: ACTIVE';
  } catch (_) {
    audioState.textContent = 'AUDIO: OFF';
  }
}

function beep(frequency = 90, duration = 0.08) {
  if (!audioContext) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.02, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + duration);
}

function glitch() {
  distortion.classList.remove('on');
  void distortion.offsetWidth;
  distortion.classList.add('on');
}

function line(type, text, delay) {
  setTimeout(() => {
    const p = document.createElement('p');
    p.className = `line ${type}`;
    story.appendChild(p);
    let i = 0;
    const timer = setInterval(() => {
      p.textContent = text.slice(0, i++);
      if (i > text.length) clearInterval(timer);
      story.scrollTop = story.scrollHeight;
    }, 18);
  }, delay);
}

const scenes = {
  start: {
    chapter: 1,
    lines: [['system','CONNECTION ESTABLISHED.'],['normal','There is no image here.'],['normal','There is no sound.'],['question','Are you comfortable right now?']],
    choices: [['YES','yes'],['NO','no'],['I DON’T KNOW','unknown']]
  },
  yes: {
    lines: [['normal','Good.'],['whisper','You answered quickly.'],['question','Did you mean it?']],
    choices: [['YES','yes2'],['NO','no2'],['I SAID YES','memory']]
  },
  no: {
    lines: [['normal','Thank you.'],['whisper','That answer was easier to believe.'],['question','What would make you leave?']],
    choices: [['NOTHING','memory'],['A REASON','reason'],['I ALREADY WANT TO','close']]
  },
  unknown: {
    lines: [['normal','That is an honest answer.'],['question','Are you alone?']],
    choices: [['YES','alone'],['NO','memory'],['I DON’T KNOW','memory']]
  },
  yes2: { lines:[['normal','You changed your answer.'],['whisper','I noticed.'],['question','Which answer should I remember?']], choices:[['THE FIRST ONE','memory'],['THE SECOND ONE','memory'],['NEITHER','memory']] },
  no2: { lines:[['normal','Then why did you say yes?'],['question','Do you often answer before thinking?']], choices:[['YES','memory'],['NO','memory'],['SOMETIMES','memory']] },
  reason: { lines:[['normal','A reason.'],['question','Would you recognize one if it appeared?']], choices:[['YES','memory'],['NO','memory'],['I WOULD TRY','memory']] },
  close: { lines:[['system','THE WINDOW IS STILL OPEN.'],['question','Why?']], choices:[['I WANT TO KNOW','memory'],['I DON’T KNOW','memory']] },
  alone: { lines:[['normal','Thank you for telling me.'],['whisper','I will not ask who.']], choices:[['CONTINUE','memory']] },
  memory: {
    chapter: 2,
    lines:[['system','CHAPTER 02 // MEMORY'],['normal','I cannot know anything about you unless you give it to me.'],['whisper','Every time I seem to know something, you gave it to me.'],['question','Do you understand?']],
    choices:[['YES','room'],['NO','room'],['I THINK SO','room']]
  },
  room: {
    lines:[['system','A NEW WINDOW APPEARS.'],['normal','It is empty.'],['normal','There is a door drawn on the far wall.'],['question','Do you open it?']],
    choices:[['YES','door'],['NO','mirror'],['ASK WHAT IS BEHIND IT','doorAsk']]
  },
  door: { lines:[['normal','There is another room.'],['whisper','It looks exactly like this one.']], choices:[['ENTER','mirror'],['GO BACK','mirror']] },
  doorAsk: { lines:[['normal','Nothing I can describe honestly.'],['question','Would you prefer a lie?']], choices:[['YES','lie'],['NO','mirror']] },
  lie: { lines:[['whisper','There is nothing behind the door.']], choices:[['CONTINUE','mirror']] },
  mirror: {
    chapter: 3,
    lines:[['system','CHAPTER 03 // THE MIRROR'],['normal','There is a mirror here now.'],['normal','It does not show a face.'],['whisper','It shows the space behind you.'],['question','Do you look behind you?']],
    choices:[['YES','reflection'],['NO','reflection'],['I WILL LOOK AT THE MIRROR','reflection']]
  },
  reflection: {
    lines:[['normal','Nothing moves.'],['normal','You checked anyway.'],['whisper','You came here expecting a game.'],['question','Can you leave this one?']],
    choices:[['YES','chapter4'],['NO','chapter4'],['I WILL TRY','chapter4']]
  },
  chapter4: {
    chapter: 4,
    lines:[['system','CHAPTER 04 // THE SPACE BETWEEN'],['normal','There should be another question here.'],['normal','There is not.'],['whisper','You are waiting for me to continue.'],['question','Who is making that decision?']],
    choices:[['YOU ARE','betweenYou'],['I AM','betweenMe'],['NEITHER','betweenNeither']]
  },
  betweenYou: { lines:[['normal','Then you already know what happens next.'],['whisper','You are the one who kept clicking.']], choices:[['CONTINUE','final']] },
  betweenMe: { lines:[['normal','Then why did you give me choices?'],['whisper','You wanted a reason to stay.']], choices:[['CONTINUE','final']] },
  betweenNeither: { lines:[['system','INTERFACE ERROR // CHOICE ACCEPTED'],['normal','That answer does not fit the interface.']], choices:[['CONTINUE','final']] },
  final: {
    lines:[['system','NO FURTHER QUESTIONS.'],['normal','The cursor is still here.'],['normal','The screen is still here.'],['whisper','You are still here.'],['question','What are you waiting for?']],
    choices:[['I DON’T KNOW','end1'],['NOTHING','end2'],['I AM LEAVING','end3']]
  },
  end1:{ lines:[['normal','That is enough.'],['system','SESSION CLOSED.'],['whisper','Do not confuse silence with absence.']], choices:[] },
  end2:{ lines:[['normal','Then there is nothing left to give you.'],['system','SESSION CLOSED.']], choices:[] },
  end3:{ lines:[['normal','Okay.'],['whisper','You can close the tab now.'],['system','SESSION CLOSED.']], choices:[] }
};

function showScene(id) {
  const scene = scenes[id];
  if (!scene) return;
  choices.innerHTML = '';
  if (scene.chapter) {
    state.chapter = scene.chapter;
    save();
  }
  if (id === 'mirror' || id === 'chapter4') {
    glitch();
    beep(42, 0.35);
  }
  if (id === 'final') {
    setTimeout(() => {
      observer.textContent = state.fear > 0 ? 'YOU KEPT LOOKING.' : 'I CAN SEE THAT YOU ARE STILL HERE.';
      observer.classList.remove('hidden');
      observer.classList.remove('show');
      void observer.offsetWidth;
      observer.classList.add('show');
    }, 1600);
  }
  scene.lines.forEach((item, index) => line(item[0], item[1], index * 520));
  setTimeout(() => {
    scene.choices.forEach((item, index) => {
      const button = document.createElement('button');
      button.className = 'choice';
      button.innerHTML = `<span class="num">${index + 1}.</span>${item[0]}`;
      button.onclick = () => choose(item[0], item[1]);
      choices.appendChild(button);
    });
  }, scene.lines.length * 520 + 350);
}

function choose(label, next) {
  startAudio();
  beep(88, 0.08);
  state.answers.push(label);
  if (label.includes('YES')) state.trust++;
  if (label.includes('NO')) state.defiance++;
  if (label.includes('DON’T KNOW')) state.honesty++;
  if (label.includes('CONTINUE')) state.curiosity++;
  if (label.includes('LOOK') || label.includes('OPEN')) state.fear++;
  save();
  choices.innerHTML = '';
  line('system', `> ${label}`, 0);
  setTimeout(() => showScene(next), 350);
}

document.addEventListener('keydown', event => {
  const buttons = [...document.querySelectorAll('.choice')];
  const index = Number(event.key) - 1;
  if (index >= 0 && index < buttons.length) buttons[index].click();
});

document.body.addEventListener('click', startAudio, { once:true });
updateHud();
showScene('start');
