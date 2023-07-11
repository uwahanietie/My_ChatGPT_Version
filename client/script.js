//The import keyword is important for getting access to files that are are in a different location or file from the one we are working with
import botImage from "./assets/bot.svg";
import userImage from "./assets/user.svg";


//this is the form we created in the html file and we are selecting it so that we will be able to extract its content later on
const form  = document.querySelector("form");

//This is how we will select the chat container that will hold the interactions between the bot and ourselves
const chatContainer = document.querySelector('#chat_container')


//We will initialize a variable that will enable us dispaly dots to signify that we are waiting for a response from openAI API
let loadInterval;

//This function has the responsibility of ensuring that we see the dots every three seconds as we wait for a response from the API
function loader(element){
    //This will ensure that the text of the loading area is initially an empty field
    element.textContent ='';
    //We will be displaying three dots each time we wait for a response to our message
    loadInterval = setInterval(()=>{
        element.textContent += '.'
        //This if condition ensures that once the text content gets to threee, it should start from afresh
        if(element.textContent === '...'){
            element.textContent = ''
        }
    },300);
}

//This will break down our response from the AI into single text characters
function typeText(element, text) {
    let index = 0;
    let interval = setInterval(() => {
      if (index < text.length) {
        //This will get us a text character that is at a specific index
        element.innerHTML += text.charAt(index);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 20);
  }

//This has the duty of generating a unique id for every single message that shows up on our chat screen
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    //To make it more random, we will convert it to a hexadecimal number
    const hexadecimalString = randomNumber.toString(16);
    //This will help us to generae a truly random number
    return `id-${timestamp}-${hexadecimalString}`;
  }
  
  //This function is responsible for distinguishing between the response from the bot and our prompt
  //It will display a different message for the response from the bot and another one for our prompt to it
  function chatStripe(isAi, value,uniqueId){
    return `
    
    <div class='wrapper ${isAi && 'ai'}'>
    <div class='chat'>
    <div class='profile'>
    <img src =${isAi ? botImage : userImage} alt='${isAi ? 'bot' :'user'}'/>
    </div>
    <div class='message' id=${uniqueId}>${value}</div>
    </div>
    </div>
    `
  }

  //This is how we will be handling the submission of the form and the response that we will get from it as well

const submitHandler = async(e) => {
    //The default behaviour of a from is to submit its content but we will disable it as we want to process the content first
e.preventDefault();
//This will get back the data from the form for us
const data = new FormData(form)  

//This is how we will be able to specify that the chat is from the user
chatContainer.innerHTML += chatStripe(false,data.get('prompt'))
//This will wipe out the content of the form after we are done retrieving it
form.reset();

//This will enbale us specify that it is a response from the bot
const uniqueId = generateUniqueId()
//This is how we will add the color and image that is needed for the bot 
chatContainer.innerHTML += chatStripe(true, ' ', uniqueId)
chatContainer.scrollTop = chatContainer.scrollHeight
//This will get the response oof the bot using the unique id that we earlier generated for it
const messageDiv = document.getElementById(uniqueId);
loader(messageDiv);

//This part has to deal with fetching the response from the server and being able to use the response in our application

const response = await fetch('http://localhost:3000/',{
 
    method:'POST',
    headers:{
        "Content-Type": "application/json",
    },
    body:JSON.stringify({
        prompt:data.get('prompt')
    }),
   
  })
  console.log(JSON.stringify({
    prompt:data.get('prompt')
}))
//This deletes the loading dots we displayed previously because we now have a response
clearInterval(loadInterval)
messageDiv.innerHTML = " "
if(response.ok){
  console.log("Sent")
    const data = await response.json()
    const parsedData = data.bot.trim()
    //This will display the message we have gotten from the bot on our screen in a typewriter like manner
    typeText(messageDiv, parsedData)
}else{
    //This handles the situation where we fail to get a successful response
const err = await response.text()
messageDiv.innerHTML = "Something went wrong"
alert(err)
}
}


//This is how we will be able to know that the form has been submitted or that the enter button has been pressed

form.addEventListener('submit', submitHandler)
//This will trigger the submission once the enter button is pressed
form.addEventListener('keypress', e=>{
    if (e.key==="Enter"){
        submitHandler(e)
    }
})