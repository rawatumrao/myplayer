import dotenv from "dotenv"

/**
* Loads the Environment variables specified in the TEST_ENV system/command-line variable 
*/
async function globalSetup() {
    if(process.env.TEST_ENV){
        dotenv.config({
        path: `.env.${process.env.TEST_ENV}`,
        override: true
        })
    }
}
export default globalSetup;