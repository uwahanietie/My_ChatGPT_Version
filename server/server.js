//This will import express that will serve as a bridge to hep our communication between the frontend and the backend
import express, { response } from 'express';

//This package will enable us make use of secret keys that exist in our env file
import * as dotenv from 'dotenv';

//This helps us validate the requests we intend to send to an api
import cors from 'cors';

//This will enable us setup our OpenAI by specifying our secret key and what model we want to use from openAI
import { Configuration,OpenAIApi } from 'openai';

//This activates all the keys in our .env file
dotenv.config();

//Setting up the configuration of our OpenAI by passing in our secret key to it

const configuration = new Configuration({
    apiKey:process.env.OPENAI_API_KEY,
})
console.log(process.env.OPENAI_API_KEY)
//Initiating a new openai class that we will later setup to determine which model we intend to use with it
const openai = new OpenAIApi(configuration);

//This will enable us startup our application by using express as a server
const app = express();

//This is how we tell our application to mae use of cors
app.use(cors());

//This enables us make meaning out of the information that we get back from openAI
app.use(express.json());

//This just lets anybody that visits our application to have a view of what our application is all about by sending a message that will be displayed on their browser
app.get('/', async(req,res)=>{
    res.status(200).send({message:"Hello from my application"})
})
app

//This is the procedure where we will accept whatever request that we get from the frontend, send it to openAI's API and then issue back a response to the frontend of our application
app.post('/', async(req,res)=>{
    try{
        //This is gotten from the frontend which is the query that the user has entered in our application
        const prompt = req.body.prompt;
        const response = await openai.createCompletion({
            //This specifies what model we are using
            model:'text-davinci-003',
            //This is the prompt that we send across
            prompt:`${prompt}`,
            temperature:0,
            //The maxmimum number of characters that we can get as a response
            max_tokens:3000,
            top_p:1,
            //The possibility of getting the exact same request each time
            frequency_penalty:0.5,
            presence_penalty:0,
        });
        //This is the response that we will send across the frontend after we are done getting the response
        res.status(200).send({bot:response.data.choices[0].text});

    }catch(error){
        //In the event that the request was not send across successfully, this is the error we intend to display
        console.log(error);
        res.status(500).send({error});
    }
})


//This is how we are able to get our application up and running
app.listen(3000,()=> console.log("Server is running"))