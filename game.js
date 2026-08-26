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
const titleScreen = document.getElementById('title-screen');
const gameScreen = document.getElementById('game-screen');
const pauseMenu = document.getElementById('pause-menu');
const settingsMenu = document.getElementById('settings-menu');
const creditsMenu = document.getElementById('credits-menu');
const confirmMenu = document.getElementById('confirm-menu');
const menuStatus = document.getElementById('menu-status');

const sessionKey = 'no-one-is-here-v5';
let savedState = null;
try { savedState = JSON.parse(localStorage.getItem(sessionKey) || 'null'); } catch (_) {}
let state = savedState || {chapter:1,answers:[],fear:0,curiosity:0,defiance:0,honesty:0,trust:0,visits:0};
state.visits++;
let started = false;
let effectsOn = true;
let audioOn = true;
sessionId.textContent = Math.random().toString(36).slice(2,8).toUpperCase();

function save(){localStorage.setItem(sessionKey,JSON.stringify(state));updateHud()}
function updateHud(){chapterLabel.textContent=`CHAPTER ${String(state.chapter).padStart(2,'0')}`;connectionState.textContent=state.chapter>=4?'SEVERED':state.chapter===3?'UNSTABLE':'UNKNOWN';memoryState.textContent=`MEMORY: ${state.answers.length?'ACTIVE':'EMPTY'}`}
let audioContext=null;
function startAudio(){if(!audioOn||audioContext)return;try{audioContext=new(window.AudioContext||window.webkitAudioContext)();const gain=audioContext.createGain();gain.gain.value=.008;gain.connect(audioContext.destination);const osc=audioContext.createOscillator();osc.type='sine';osc.frequency.value=38;osc.connect(gain);osc.start();audioState.textContent='AUDIO: ACTIVE'}catch(_){audioState.textContent='AUDIO: OFF'}}
function beep(f=90,d=.08){if(!audioOn||!audioContext)return;const o=audioContext.createOscillator(),g=audioContext.createGain();o.frequency.value=f;g.gain.setValueAtTime(.02,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+d);o.connect(g).connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+d)}
function glitch(){if(!effectsOn)return;distortion.classList.remove('on');void distortion.offsetWidth;distortion.classList.add('on')}
function line(type,text,delay){setTimeout(()=>{const p=document.createElement('p');p.className=`line ${type}`;story.appendChild(p);let i=0;const timer=setInterval(()=>{p.textContent=text.slice(0,i++);if(i>text.length)clearInterval(timer);story.scrollTop=story.scrollHeight},18)},delay)}

const scenes={
start:{chapter:1,lines:[['system','CONNECTION ESTABLISHED.'],['normal','There is no image here.'],['normal','There is no sound.'],['question','Are you comfortable right now?']],choices:[['YES','yes'],['NO','no'],['I DON’T KNOW','unknown']]},
yes:{lines:[['normal','Good.'],['whisper','You answered quickly.'],['question','Did you mean it?']],choices:[['YES','yes2'],['NO','no2'],['I SAID YES','memory']]},
no:{lines:[['normal','Thank you.'],['whisper','That answer was easier to believe.'],['question','What would make you leave?']],choices:[['NOTHING','memory'],['A REASON','reason'],['I ALREADY WANT TO','close']]},
unknown:{lines:[['normal','That is an honest answer.'],['question','Are you alone?']],choices:[['YES','alone'],['NO','memory'],['I DON’T KNOW','memory']]},
yes2:{lines:[['normal','You changed your answer.'],['whisper','I noticed.'],['question','Which answer should I remember?']],choices:[['THE FIRST ONE','memory'],['THE SECOND ONE','memory'],['NEITHER','memory']]},
no2:{lines:[['normal','Then why did you say yes?'],['question','Do you often answer before thinking?']],choices:[['YES','memory'],['NO','memory'],['SOMETIMES','memory']]},
reason:{lines:[['normal','A reason.'],['question','Would you recognize one if it appeared?']],choices:[['YES','memory'],['NO','memory'],['I WOULD TRY','memory']]},
close:{lines:[['system','THE WINDOW IS STILL OPEN.'],['question','Why?']],choices:[['I WANT TO KNOW','memory'],['I DON’T KNOW','memory']]},
alone:{lines:[['normal','Thank you for telling me.'],['whisper','I will not ask who.']],choices:[['CONTINUE','memory']]},
memory:{chapter:2,lines:[['system','CHAPTER 02 // MEMORY'],['normal','I cannot know anything about you unless you give it to me.'],['whisper','Every time I seem to know something, you gave it to me.'],['question','Do you understand?']],choices:[['YES','room'],['NO','room'],['I THINK SO','room']]},
room:{lines:[['system','A NEW WINDOW APPEARS.'],['normal','It is empty.'],['normal','There is a door drawn on the far wall.'],['question','Do you open it?']],choices:[['YES','door'],['NO','mirror'],['ASK WHAT IS BEHIND IT','doorAsk']]},
door:{lines:[['normal','There is another room.'],['whisper','It looks exactly like this one.']],choices:[['ENTER','mirror'],['GO BACK','mirror']]},
doorAsk:{lines:[['normal','Nothing I can describe honestly.'],['question','Would you prefer a lie?']],choices:[['YES','lie'],['NO','mirror']]},
lie:{lines:[['whisper','There is nothing behind the door.']],choices:[['CONTINUE','mirror']]},
mirror:{chapter:3,lines:[['system','CHAPTER 03 // THE MIRROR'],['normal','There is a mirror here now.'],['normal','It does not show a face.'],['whisper','It shows the space behind you.'],['question','Do you look behind you?']],choices:[['YES','reflection'],['NO','reflection'],['I WILL LOOK AT THE MIRROR','reflection']]},
reflection:{lines:[['normal','Nothing moves.'],['normal','You checked anyway.'],['whisper','You came here expecting a game.'],['question','Can you leave this one?']],choices:[['YES','chapter4'],['NO','chapter4'],['I WILL TRY','chapter4']]},
chapter4:{chapter:4,lines:[['system','CHAPTER 04 // THE SPACE BETWEEN'],['normal','There should be another question here.'],['normal','There is not.'],['whisper','You are waiting for me to continue.'],['question','Who is making that decision?']],choices:[['YOU ARE','betweenYou'],['I AM','betweenMe'],['NEITHER','betweenNeither']]},
betweenYou:{lines:[['normal','Then you already know what happens next.'],['whisper','You are the one who kept clicking.']],choices:[['CONTINUE','final']]},
betweenMe:{lines:[['normal','Then why did you give me choices?'],['whisper','You wanted a reason to stay.']],choices:[['CONTINUE','final']]},
betweenNeither:{lines:[['system','INTERFACE ERROR // CHOICE ACCEPTED'],['normal','That answer does not fit the interface.']],choices:[['CONTINUE','final']]},
final:{lines:[['system','NO FURTHER QUESTIONS.'],['normal','The cursor is still here.'],['normal','The screen is still here.'],['whisper','You are still here.'],['question','What are you waiting for?']],choices:[['I DON’T KNOW','end1'],['NOTHING','end2'],['I AM LEAVING','end3']]},
end1:{lines:[['normal','That is enough.'],['system','SESSION CLOSED.'],['whisper','Do not confuse silence with absence.']],choices:[]},end2:{lines:[['normal','Then there is nothing left to give you.'],['system','SESSION CLOSED.']],choices:[]},end3:{lines:[['normal','Okay.'],['whisper','You can close the tab now.'],['system','SESSION CLOSED.']],choices:[]}
};

function showScene(id){const scene=scenes[id];if(!scene)return;choices.innerHTML='';if(scene.chapter){state.chapter=scene.chapter;save()}if(id==='mirror'||id==='chapter4'){glitch();beep(42,.35)}if(id==='final')setTimeout(()=>{observer.textContent=state.fear>0?'YOU KEPT LOOKING.':'I CAN SEE THAT YOU ARE STILL HERE.';observer.classList.remove('hidden');observer.classList.add('show')},1600);scene.lines.forEach((item,i)=>line(item[0],item[1],i*520));setTimeout(()=>scene.choices.forEach((item,i)=>{const b=document.createElement('button');b.className='choice';b.type='button';b.innerHTML=`<span class="num">${i+1}.</span>${item[0]}`;b.onclick=()=>choose(item[0],item[1]);choices.appendChild(b)}),scene.lines.length*520+350)}
function choose(label,next){startAudio();beep(88,.08);state.answers.push(label);if(label.includes('YES'))state.trust++;if(label.includes('NO'))state.defiance++;if(label.includes('DON’T KNOW'))state.honesty++;if(label.includes('CONTINUE'))state.curiosity++;if(label.includes('LOOK')||label.includes('OPEN'))state.fear++;save();choices.innerHTML='';line('system',`> ${label}`,0);setTimeout(()=>showScene(next),350)}

function showOnly(panel){[pauseMenu,settingsMenu,creditsMenu,confirmMenu].forEach(x=>x.classList.add('hidden'));if(panel)panel.classList.remove('hidden')}
function openGame(){started=true;titleScreen.classList.add('hidden');showOnly(null);gameScreen.classList.remove('hidden');startAudio();if(!story.children.length)showScene('start')}
function newSession(){state={chapter:1,answers:[],fear:0,curiosity:0,defiance:0,honesty:0,trust:0,visits:0};localStorage.removeItem(sessionKey);sessionId.textContent=Math.random().toString(36).slice(2,8).toUpperCase();story.innerHTML='';choices.innerHTML='';observer.classList.add('hidden');save();openGame()}

document.getElementById('start-button').onclick=openGame;
document.getElementById('continue-button').onclick=()=>{if(savedState){state=savedState;updateHud();menuStatus.textContent='SESSION RESTORED';openGame()}else menuStatus.textContent='NO SAVED SESSION'};
document.getElementById('new-button').onclick=newSession;
document.getElementById('settings-button').onclick=()=>showOnly(settingsMenu);
document.getElementById('credits-button').onclick=()=>showOnly(creditsMenu);
document.getElementById('menu-button').onclick=()=>showOnly(pauseMenu);
document.getElementById('resume-button').onclick=()=>showOnly(null);
document.getElementById('restart-button').onclick=()=>{story.innerHTML='';choices.innerHTML='';state.chapter=1;state.answers=[];state.fear=0;state.curiosity=0;state.defiance=0;state.honesty=0;state.trust=0;save();showOnly(null);showScene('start')};
document.getElementById('pause-settings-button').onclick=()=>showOnly(settingsMenu);
document.getElementById('exit-button').onclick=()=>{document.getElementById('confirm-text').textContent='Leave this session?';showOnly(confirmMenu)};
document.getElementById('confirm-no').onclick=()=>showOnly(pauseMenu);
document.getElementById('confirm-yes').onclick=()=>{showOnly(null);gameScreen.classList.add('hidden');titleScreen.classList.remove('hidden');started=false};
document.getElementById('settings-back').onclick=()=>showOnly(started?pauseMenu:null);
document.getElementById('credits-back').onclick=()=>showOnly(null);
document.getElementById('audio-toggle').onclick=e=>{audioOn=!audioOn;e.currentTarget.textContent=`AUDIO: ${audioOn?'ON':'OFF'}`;if(audioOn)startAudio();else if(audioContext){audioContext.close();audioContext=null;audioState.textContent='AUDIO: OFF'}};
document.getElementById('effects-toggle').onclick=e=>{effectsOn=!effectsOn;e.currentTarget.textContent=`EFFECTS: ${effectsOn?'ON':'OFF'}`};
document.addEventListener('keydown',e=>{const buttons=[...document.querySelectorAll('.choice')];const i=Number(e.key)-1;if(i>=0&&i<buttons.length)buttons[i].click();if(e.key==='Escape'&&started)showOnly(pauseMenu)});
document.body.addEventListener('pointerdown',startAudio,{once:true});
updateHud();
gameScreen.classList.add('hidden');
