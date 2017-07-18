Bot created for Tecnicas de Enfermería de El Ejijo.
This bot is able to answer different questions.
User can talk with the bot through console or MS Bot Framework (check EMULATOR variable in .env file).  


## Requirements

* **NodeJS libraries:** Specified in __package.json__ file. Install them using npm command.

* **BotFramework-Emulator:** Download from https://github.com/Microsoft/BotFramework-Emulator


## Environment variables

Before running, check variables in _.env_ file:
* **HTTPS_PROXY:** if you are using the App behind a firewall
* **PORT:** 3978 is the default port when using MS Bot Framework Emulator
* **EMULATOR:** "YES" if using MS Bot Framework Emulator, "NO" if using console
* **LUIS_MODEL_URL:** URL from trained LUIS application, includes subscription-key from Azure
* **MICROSOFT_APP_ID:** Application ID when you publish your app
* **MICROSOFT_APP_PASSWORD:**  Application password when you publish your app
* **MICROSOFT_BING_KEY:** API Key for Bing search
* **MICROSOFT_BING_URI:** URI for Bing services
* **MICROSOFT_BING_MAX_RESULTS:** Max results for searches with Bing
* **MICROSOFT_BING_SKIP_RESULTS:** If you want to skip the first results 
* **MICROSOFT_BING_TEXT_DECORATIONS:** Text decorators from Bing services
* **MICROSOFT_BING_ADULT:** Restrict adult content as it is an app for student


## Running

```bash
$ node app.js
```


## Code Structure

* __./app.json__: Main program  
* __./package.json__: Program name, version and dependencies  
* __./.env__: Environment variables
* __./model/__: JSON file corresponding to the LUIS application that should be used to recognise intents (can be imported to create a new LUIS application in case the one trained for this exercise is removed)  
* __./intents/__: Dialogs launched when a particular intent is detected  
* __./customLocale/__: One folder per language accepted by bot, all bot sentences are included in these JSON files (*index.json* is the file used by main file (*app.json*), the rest of sentences are grouped by intent dialog or common dialog).


## Language Support

User can change bot language typing 'change language' or 'select language', however, one LUIS application should be trained per language to understand intents in the selected language. _PENDING_


## Intents recognized
- Greeting --> Bot answers "Hello!"
- End Conversation --> Bot answers "Ok... Goodbye"
- Thanking --> Bot answers "Glad I could help"
- SelectLanguage --> Bot asks about preferred language, shows a list of available languages, waits for user to select one (typing number option or writing language name), and confirms change
- Intent not found --> "I'm sorry I didn't understand. Could you please rephrase that?"


## Example Conversation Flow
___User___ Hola
___Bot___ Hola!
___User___ asdfasdf            
___Bot___ Lo siento no te he entendido, podrías repetirme con otras palabras? si quieres que busque por ti responde buscar 
___User___ Puedo cambiar el idioma? 
___Bot___ ¿Cual es tu idioma preferido? 1. English, 2. Español
___User___ English  
___Bot___ Your preferred language is now English. I am learning english please speak at me in Spanish 
___User___ Thanks  
___Bot___ Glad I could help  
___User___ Bye Bye  
___Bot___ Ok… Goodbye.
