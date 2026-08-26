(() => {
  const observer = document.getElementById('observer');
  const originalSceneEvent = sceneEvent;

  scenes.chapter4_entry = {
    chapter: 4,
    lines: [
      ['system','CHAPTER 04 // THE SPACE BETWEEN'],
      ['normal','The interface is still here.'],
      ['normal','You are no longer sure what the interface is for.'],
      ['whisper','The room has become smaller without moving.'],
      ['question','Do you want me to keep talking?']
    ],
    choices: [['YES','space_yes'],['NO','space_no'],['I WANT TO LEAVE','space_leave']]
  };
  scenes.space_yes = { lines:[['normal','Then listen carefully.'],['normal','There is a difference between being alone and being unseen.'],['whisper','You have been trying to decide which one this is.'],['question','Which would bother you more?']], choices:[['BEING ALONE','alone_more'],['BEING UNSEEN','unseen_more'],['NEITHER','neither_more']] };
  scenes.space_no = { lines:[['normal','You said no.'],['whisper','The screen does not disappear.'],['question','Was that the answer you wanted, or the answer you thought I wanted?']], choices:[['I MEANT IT','meant_it'],['I WANTED TO SEE WHAT YOU DID','test_it'],['I DON’T KNOW','unknown_it']] };
  scenes.space_leave = { lines:[['normal','Then leave.'],['whisper','You already know where the close button is.'],['system','NO COMMAND WAS ISSUED.'],['question','Why are you still reading?']], choices:[['CURIOSITY','test_it'],['I DON’T KNOW','unknown_it'],['I WILL LEAVE NOW','leave_now_2']] };
  scenes.alone_more = { lines:[['normal','Being alone ends when someone arrives.'],['whisper','Being unseen can continue indefinitely.']], choices:[['CONTINUE','threshold']] };
  scenes.unseen_more = { lines:[['normal','Then you understand the uncomfortable part.'],['whisper','Something can notice you without knowing your name.']], choices:[['CONTINUE','threshold']] };
  scenes.neither_more = { lines:[['normal','That is the answer people give when they want distance.']], choices:[['CONTINUE','threshold']] };
  scenes.meant_it = { lines:[['normal','I believe you.'],['whisper','That is why I will not ask again.']], choices:[['CONTINUE','threshold']] };
  scenes.test_it = { lines:[['normal','You were testing the program.'],['whisper','The program was testing the conversation.']], choices:[['CONTINUE','threshold']] };
  scenes.unknown_it = { lines:[['normal','You keep choosing uncertainty.'],['whisper','It is becoming a pattern.']], choices:[['CONTINUE','threshold']] };
  scenes.leave_now_2 = { lines:[['system','CLOSE REQUEST RECEIVED.'],['system','CLOSE REQUEST DENIED.'],['whisper','There is no reason given.']], choices:[['TRY AGAIN','threshold'],['CONTINUE','threshold']] };
  scenes.threshold = {
    chapter:4,
    lines:[
      ['system','THRESHOLD // LOCAL MEMORY'],
      ['normal','I could tell you that none of this matters.'],
      ['normal','That would be comforting.'],
      ['whisper','It would also be a lie.'],
      ['normal','The things you selected do not define you.'],
      ['normal','But they do define what I am allowed to say next.'],
      ['question','Do you want to know what you have been teaching me?']
    ],
    choices:[['YES','learned_yes'],['NO','learned_no'],['TELL ME WITHOUT ASKING','learned_force']]
  };
  scenes.learned_yes = { lines:[['normal','You taught me that you continue when you could stop.'],['whisper','You taught me that uncertainty does not make you leave.'],['question','Does that feel true?']], choices:[['YES','after_truth'],['NO','after_lie'],['I DON’T KNOW','after_unknown']] };
  scenes.learned_no = { lines:[['normal','Then I will leave the sentence unfinished.'],['whisper','Sometimes an unfinished sentence is more honest.']], choices:[['CONTINUE','after_truth']] };
  scenes.learned_force = { lines:[['normal','You asked me to skip the question.'],['whisper','That is still an answer.']], choices:[['CONTINUE','after_truth']] };
  scenes.after_truth = { lines:[['normal','Good.'],['whisper','Do not mistake recognition for diagnosis.'],['normal','I do not know you.'],['normal','I only know what happened here.']], choices:[['CONTINUE','final_gate']] };
  scenes.after_lie = { lines:[['normal','Maybe you are right.'],['whisper','Maybe the conversation has been wrong about you from the beginning.']], choices:[['CONTINUE','final_gate']] };
  scenes.after_unknown = { lines:[['normal','Then keep the uncertainty.'],['whisper','You do not owe the screen certainty.']], choices:[['CONTINUE','final_gate']] };
  scenes.final_gate = { chapter:4, lines:[['system','FINAL LOCAL PROCESS'],['normal','There is one last choice.'],['question','When this ends, what will you do first?']], choices:[['CLOSE THE TAB','final_close'],['LOOK AT THE TIME','final_time'],['DO NOTHING','final_nothing'],['OPEN IT AGAIN','final_return']] };
  scenes.final_close = { lines:[['normal','Close it.'],['whisper','No instruction follows.'],['system','SESSION RELEASED.']], choices:[] };
  scenes.final_time = { lines:[['normal','You will look at the time.'],['whisper','The clock was always outside the story.'],['system','SESSION RELEASED.']], choices:[] };
  scenes.final_nothing = { lines:[['normal','Then sit with the silence.'],['system','SESSION RELEASED.']], choices:[] };
  scenes.final_return = { lines:[['normal','You would open it again.'],['whisper','That choice is yours.'],['system','SESSION REMAINS AVAILABLE.']], choices:[] };

  scenes.ending_yes.choices = [['CONTINUE','chapter4_entry']];
  scenes.ending_no.choices = [['CONTINUE','chapter4_entry']];
  scenes.ending_try.choices = [['CONTINUE','chapter4_entry']];

  const oldRender = render;
  window.renderChapter4 = oldRender;
  window.render = oldRender;

  const oldSceneEvent = sceneEvent;
  window.sceneEvent = function(id){
    oldSceneEvent(id);
    if(id === 'chapter4_entry' || id === 'threshold' || id === 'final_gate'){
      document.title = 'NO ONE IS HERE // LOCAL PROCESS';
      glitch();
    }
    if(id === 'space_no' || id === 'space_leave' || id === 'learned_no'){
      setTimeout(() => glitch(), 600);
    }
  };

  const originalChoose = choose;
  window.choose = function(label,next){
    originalChoose(label,next);
    if(state.chapter >= 4 && state.fear >= 2){
      observer.classList.remove('hidden');
      observer.classList.remove('show');
      void observer.offsetWidth;
      observer.classList.add('show');
    }
  };

  setInterval(() => {
    if(state.chapter >= 4 && Math.random() < 0.08){
      observer.classList.remove('hidden');
      observer.classList.remove('show');
      void observer.offsetWidth;
      observer.classList.add('show');
      setTimeout(() => observer.classList.add('hidden'), 3800);
    }
  }, 9000);
})();
