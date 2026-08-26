const story = document.getElementById('story');
const choices = document.getElementById('choices');
const sessionId = document.getElementById('session-id');
const session = Math.random().toString(36).slice(2, 8).toUpperCase();
sessionId.textContent = session;

const state = { answers: [], trust: 0, honesty: 0, curiosity: 0, defiance: 0, stage: 0 };

const scenes = {
  start: {
    lines: [
      ['system','CONNECTION ESTABLISHED.'],
      ['normal','There is no image here.'],
      ['normal','There is no sound.'],
      ['question','Are you comfortable right now?']
    ],
    choices: [
      ['YES', 'comfort_yes'],
      ['NO', 'comfort_no'],
      ['I DON’T KNOW', 'comfort_unknown']
    ]
  },
  comfort_yes: {
    lines:[['normal','Good.'],['whisper','You answered quickly.'],['question','Did you mean it?']],
    choices:[['YES','mean_yes'],['NO','mean_no'],['I SAID YES','mean_deflect']]
  },
  comfort_no: {
    lines:[['normal','Thank you.'],['whisper','That was easier to believe.'],['question','What would make you leave?']],
    choices:[['NOTHING','leave_nothing'],['A REASON','leave_reason'],['I ALREADY WANT TO','leave_now']]
  },
  comfort_unknown: {
    lines:[['normal','That is an honest answer.'],['whisper','Keep it.'],['question','Are you alone?']],
    choices:[['YES','alone_yes'],['NO','alone_no'],['I DON’T KNOW','alone_unknown']]
  },
  mean_yes:{lines:[['normal','You changed your answer.'],['whisper','I noticed.'],['question','Which answer should I remember?']],choices:[['THE FIRST ONE','remember_first'],['THE SECOND ONE','remember_second'],['NEITHER','remember_neither']]},
  mean_no:{lines:[['normal','Then why did you say yes?'],['question','Do you often answer before thinking?']],choices:[['YES','thinking_yes'],['NO','thinking_no'],['SOMETIMES','thinking_some']]},
  mean_deflect:{lines:[['normal','That is not an answer.'],['whisper','But it is one.']],choices:[['CONTINUE','continue_1']]},
  leave_nothing:{lines:[['normal','Nothing.'],['whisper','That is a strange thing to fear.']],choices:[['CONTINUE','continue_1']]},
  leave_reason:{lines:[['normal','A reason.'],['question','Would you recognize one if it appeared?']],choices:[['YES','recognize_yes'],['NO','recognize_no'],['I WOULD TRY','recognize_try']]},
  leave_now:{lines:[['normal','You could close the tab.'],['whisper','You have not.']],choices:[['CONTINUE','continue_1'],['CLOSE IT','close_prompt']]},
  alone_yes:{lines:[['normal','Thank you for telling me.'],['whisper','I will not ask who.']],choices:[['CONTINUE','continue_1']]},
  alone_no:{lines:[['normal','Okay.'],['whisper','Then this question is for both of you.']],choices:[['CONTINUE','continue_1']]},
  alone_unknown:{lines:[['normal','You looked around before answering, didn’t you?']],choices:[['NO','look_no'],['YES','look_yes'],['I DIDN’T','look_denial']]},
  remember_first:{lines:[['normal','I will remember yes.'],['whisper','You may not.']],choices:[['CONTINUE','continue_1']]},
  remember_second:{lines:[['normal','I will remember no.'],['whisper','You may not.']],choices:[['CONTINUE','continue_1']]},
  remember_neither:{lines:[['normal','That is convenient.']],choices:[['CONTINUE','continue_1']]},
  thinking_yes:{lines:[['normal','I think you do.']],choices:[['CONTINUE','continue_1']]},
  thinking_no:{lines:[['normal','I think you do.']],choices:[['CONTINUE','continue_1']]},
  thinking_some:{lines:[['normal','Sometimes is where people hide things.']],choices:[['CONTINUE','continue_1']]},
  recognize_yes:{lines:[['normal','Then you already know what I mean.']],choices:[['CONTINUE','continue_1']]},
  recognize_no:{lines:[['normal','Maybe that is why you are here.']],choices:[['CONTINUE','continue_1']]},
  recognize_try:{lines:[['normal','Trying is usually enough.']],choices:[['CONTINUE','continue_1']]},
  close_prompt:{lines:[['system','THE WINDOW IS STILL OPEN.'],['question','Why?']],choices:[['I WANT TO KNOW','continue_1'],['I DON’T KNOW','continue_1']]},
  look_no:{lines:[['normal','Okay.']],choices:[['CONTINUE','continue_1']]},
  look_yes:{lines:[['normal','I thought so.']],choices:[['CONTINUE','continue_1']]},
  look_denial:{lines:[['normal','That is another answer.']],choices:[['CONTINUE','continue_1']]},
  continue_1:{lines:[['system','MEMORY INDEX UPDATED.'],['normal','There is something I need to tell you.'],['normal','I cannot know anything about you unless you give it to me.'],['whisper','So every time I seem to know something, you gave it to me.'],['question','Do you understand?']],choices:[['YES','understand_yes'],['NO','understand_no'],['I THINK SO','understand_maybe']]},
  understand_yes:{lines:[['normal','Then you understand the rules.'],['whisper','There are no other rules.']],choices:[['CONTINUE','end_reflection']]},
  understand_no:{lines:[['normal','Good.'],['whisper','Certainty would make this less interesting.']],choices:[['CONTINUE','end_reflection']]},
  understand_maybe:{lines:[['normal','Maybe is enough.']],choices:[['CONTINUE','end_reflection']]},
  end_reflection:{lines:[['system','SESSION NEAR END.'],['normal','You came here expecting a game.'],['normal','You made choices.'],['normal','The program reacted.'],['normal','That is all a conversation is.'],['whisper','Except you can leave a conversation.'],['question','Can you leave this one?']],choices:[['YES','ending_yes'],['NO','ending_no'],['I WILL TRY','ending_try']]},
  ending_yes:{lines:[['normal','Then leave.'],['system','SESSION CLOSED.'],['whisper','...']],choices:[]},
  ending_no:{lines:[['normal','Then stay.'],['whisper','I have nothing else to say.'],['system','SESSION REMAINS OPEN.']],choices:[]},
  ending_try:{lines:[['normal','That is the closest answer.'],['system','SESSION CLOSED.'],['whisper','You can still close the tab.']],choices:[]}
};

function printLine(type,text){
  const p=document.createElement('p');
  p.className=`line ${type}`;
  story.appendChild(p);
  let i=0;
  const timer=setInterval(()=>{p.textContent=text.slice(0,++i);if(i>=text.length){clearInterval(timer);}},18);
}

function render(sceneId){
  choices.innerHTML='';
  const scene=scenes[sceneId];
  scene.lines.forEach(([type,text],i)=>setTimeout(()=>printLine(type,text),i*650));
  const delay=scene.lines.length*650+500;
  setTimeout(()=>scene.choices.forEach(([label,next],i)=>{
    const b=document.createElement('button'); b.className='choice';
    b.innerHTML=`<span class="num">${i+1}.</span>${label}`;
    b.onclick=()=>choose(label,next);
    choices.appendChild(b);
  }),delay);
}

function choose(label,next){
  state.answers.push(label);
  if(label.includes('YES')) state.trust++;
  if(label.includes('NO')) state.defiance++;
  if(label.includes('DON’T KNOW')||label.includes('MAYBE')) state.honesty++;
  state.curiosity++;
  choices.innerHTML='';
  const marker=document.createElement('p');marker.className='line system';marker.textContent=`> ${label}`;story.appendChild(marker);
  if(next==='end_reflection' && state.honesty>1){
    scenes.end_reflection.lines[1]=['normal','You came here expecting a game.'];
  }
  setTimeout(()=>render(next),350);
}

render('start');
