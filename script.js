// global constants
const cluePauseTime = 333; //how long to pause in between clues
const nextClueWaitTime = 1000; //how long to wait before starting playback of the clue sequence
const numberOfButtons = 6;

//Global Variables
var pattern = []; // Array which holds random pattern of sequence
var progress = 0; 
var gamePlaying = false;
var tonePlaying = false;
var volume = 0.5;  //must be between 0.0 and 1.0
var guessCounter = 0;
var clueHoldTime = 1000;
var mistakes = 0;
var countdown = 8;
var isPaused = true;

// Global timer, is set on or off, depending on isPaused boolean
var time = setInterval(function(){ 
    if (!isPaused){
      document.getElementById("timer").innerHTML = "0:0" + countdown;
      if (countdown == 0){
        clearInterval(time);
        loseGame();
        return;
      }
      countdown--;
    }
  }, 1000);


function startGame(){
  //initialize game variables
  pattern = [];
  randomArray(pattern);
  mistakes = 0;
  progress = 0;
  gamePlaying = true;
  // swap the Start and Stop buttons
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");
  playClueSequence();
}

function stopGame(){
  //update game variables
  gamePlaying = true;
  restart();
  // swap the Stop and Start buttons
  document.getElementById("startBtn").classList.remove("hidden");
  document.getElementById("stopBtn").classList.add("hidden");
}

function randomArray(arr){
  // Max size of pattern is 10
  for (let i = 0; i < 10; ++i)
    arr.push((Math.floor(Math.random() * numberOfButtons)) + 1);
}

// Restarts timer artificially
function restart(){
  countdown = 8;
  isPaused = true;
}

function lightButton(btn){
  document.getElementById("btn"+btn).classList.add("lit");
  reveal(btn);
}
function clearButton(btn){
  document.getElementById("btn"+btn).classList.remove("lit");
  hide(btn);
}

function reveal(btn){
  document.getElementById("img"+btn).classList.remove("hidden");
}

function hide(btn){
  document.getElementById("img"+btn).classList.add("hidden");
}

function playSingleClue(btn){
  if(gamePlaying){
    lightButton(btn);
    playTone(btn,clueHoldTime);
    // Sets timeout for function to be called in future
    setTimeout(clearButton,clueHoldTime,btn);
  }
}

function playClueSequence(){
  guessCounter = 0;
  // Adjust hold time of buttons while lit up, faster as game progresses
  if (clueHoldTime > 300) // Limit for how fast hold time is
    clueHoldTime -= progress * 40;
  let delay = nextClueWaitTime; //set delay to initial wait time
  for(let i=0;i<=progress;i++){ // for each clue that is revealed so far
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms")
    setTimeout(playSingleClue,delay,pattern[i]) // set a timeout to play that clue
    delay += clueHoldTime 
    delay += cluePauseTime;
  }
  // Starts timer directly after sequence is played
   setTimeout(function(){ isPaused = false; }, delay - 1100);
}

function guess(btn){
  console.log("user guessed: " + btn);
  if(!gamePlaying){
    return;
  }
  // First checks to see if guess is incorrect & mistakes are counted
  if (pattern[guessCounter] != btn){
    mistakes++;
    if (mistakes == 3)
      loseGame();
    else 
      alert("You have " + (3 - mistakes) + " chance(s) left!")
    return;
  }
  // Guess is correct; proceed to check status of game so far
  if (guessCounter == progress){
    restart();
    // Checks if end of round is also the end of the game
    if (guessCounter == pattern.length - 1){
      winGame();
      return;
    }
    // Getting ready for next round 
    progress++;
    playClueSequence();
  } else { 
    guessCounter++;
  }
}

function loseGame(){
  stopGame();
  restart();
  alert("Game Over! You lost.");
}

function winGame(){
  stopGame();
  alert("Congratulations. You win!");
}

// Sound Synthesis Functions
const freqMap = {
  1: 220,
  2: 260,
  3: 300,
  4: 340,
  5: 380,
  6: 420
}
function playTone(btn,len){ 
  o.frequency.value = freqMap[btn]
  g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
  tonePlaying = true
  setTimeout(function(){
    stopTone()
  },len)
}
function startTone(btn){
  if(!tonePlaying){
    o.frequency.value = freqMap[btn]
    g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
    tonePlaying = true
  }
}
function stopTone(){
    g.gain.setTargetAtTime(0,context.currentTime + 0.05,0.025)
    tonePlaying = false
}

//Page Initialization
// Init Sound Synthesizer
var context = new AudioContext()
var o = context.createOscillator()
var g = context.createGain()
g.connect(context.destination)
g.gain.setValueAtTime(0,context.currentTime)
o.connect(g)
o.start(0)
