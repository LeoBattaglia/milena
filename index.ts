//Constants
import {getInputTypes} from "./lib/functions";

const ansi = require("./lib/ansi");
const config = require("./lib/config.json");
const func = require("./lib/functions");
const readline = require("readline");
const stdin = process.stdin;

//Exports
export {getInputDataTypes, getInputTypes} from "./lib/functions";

//Emit Keypress-Events
readline.emitKeypressEvents(process.stdin);

//Class
export class Prompt{
    //Constructor
    constructor(){
    }

    //Methods
    clear(){
        console.clear();
    }

    close(exitProcess:boolean){
        func.closeStdin();
        if(exitProcess){
            process.exit(0);
        }
    }

    async choose(output:string, charTrue:string, charFalse:string, msgTrue:string, msgFalse, abortOnWrongChar:Boolean){
        charTrue = charTrue.length > 1 ? charTrue.substring(0, 1) : charTrue;
        charFalse = charFalse.length > 1 ? charFalse.substring(0, 1) : charFalse;
        charTrue = charTrue.toLowerCase();
        charFalse = charFalse.toLowerCase();
        func.log(output + config.colors.command + " (" + charTrue + "|" + charFalse + ")", config.colors.input, false);
        stdin.setRawMode(true);
        let inputStream = new Promise((resolve) => {
            stdin.on("keypress", (str, key) => {
                try{
                    let input:string = key.name.toString();
                    input = func.removeTabsAndBreaks(input);
                    if(abortOnWrongChar){
                        resolve(func.getChoose(input, charTrue, charFalse));
                    }else{
                        if(func.getChoose(input, charTrue, charFalse) !== undefined){
                            resolve(func.getChoose(input, charTrue, charFalse));
                        }
                    }
                }catch(e){
                    resolve(undefined);
                }
            });
        });
        let result = await inputStream;
        stdin.setRawMode(false);
        stdin.removeAllListeners("keypress");
        ansi.left(5);
        ansi.clearLineToEnd();
        func.printChoose(result, msgTrue, msgFalse);
        return result;
    }

    async input(output:string){
        func.log(output + " ", config.colors.command, false);
        ansi.log(config.colors.input);
        let inputStream = new Promise((resolve) => {
            stdin.once("data", function(input){
                resolve(input);
            });
        });
        let result = await inputStream;
        let input:string = result.toString();
        input = func.removeTabsAndBreaks(input);
        //input.trim();
        input = input.length > 1 ? input.trim() : input;
        ansi.up(1);
        ansi.right(output.length + 1)
        func.log(input, config.colors.selected, false);
        ansi.nextLine(1);
        return input;
    }

    async multiSelect(output:string, options:string[], min:number){
        func.log(output + " ", config.colors.command, true);
        func.printOptions(options, false);
        let selected:Boolean[] = [];
        options.forEach(() => {
            selected.push(false);
        })
        ansi.previousLine(options.length - 1);
        ansi.right(1);
        stdin.setRawMode(true);
        let position:number = options.length - 1;
        let inputStream = new Promise((resolve) => {
            stdin.on("keypress", (str, key) => {
                let index:number;
                switch(key.name){
                    case "down":
                        if(position > 0){
                            position = func.multiSelectNextLine(false, options, selected, position);
                        }
                        break
                    case "up":
                        if(position < options.length - 1){
                            position = func.multiSelectNextLine(true, options, selected, position);
                        }
                        break;
                    case "return":
                        index = options.length - position - 1;
                        if(position > 0){
                            ansi.nextLine(position);
                        }
                        ansi.right(options[0].length);
                        ansi.log("\n");
                        let result:string[] = [];
                        for(let i:number = 0; i < options.length; i++){
                            if(selected[i]){
                                result.push(options[i]);
                            }
                        }
                        resolve(result);
                        break;
                    case "space":
                        ansi.beginOfLine(0);
                        index = options.length - position - 1;
                        let row:string;
                        if(selected[options.length - position - 1]){
                            selected[options.length - position - 1] = false;
                            row = "[ ] " + options[options.length - position - 1];
                            func.log(row, config.colors.option, false);
                        }else{
                            selected[options.length - position - 1] = true;
                            row = "[X] " + options[options.length - position - 1];
                            func.log(row, config.colors.selected, false);
                        }
                        ansi.beginOfLine(1);
                        break;
                }
            });
        });
        let result = await inputStream;
        stdin.setRawMode(false);
        stdin.removeAllListeners("keypress");
        return result;
    }

    print(output):void{
        func.print(output);
    }

    printColorBlack(output):void{
        func.log(output, config.colors.black, true);
    }

    printColorBlue(output):void{
        func.log(output, config.colors.blue, true);
    }

    printColorCyan(output):void{
        func.log(output, config.colors.cyan, true);
    }

    printColorGreen(output):void{
        func.log(output, config.colors.green, true);
    }

    printColorMagenta(output):void{
        func.log(output, config.colors.magenta, true);
    }

    printColorRed(output):void{
        func.log(output, config.colors.red, true);
    }

    printColorWhite(output):void{
        func.log(output, config.colors.white, true);
    }

    printColorYellow(output):void{
        func.log(output, config.colors.yellow, true);
    }

    printCommand(output):void{
        func.printCommand(output);
    }

    printError(output):void{
        func.printError(output);
    }

    printInput(output):void{
        func.printInput(output);
    }

    printLine():void{
        func.printLine();
    }

    printOption(output):void{
        func.printOption(output);
    }

    printSelected(output):void{
        func.printSelected(output);
    }

    printTitle(output):void{
        func.printTitle(output);
    }

    async select(output:string, options:string[]){
        func.log(output + " ", config.colors.command, true);
        func.printOptions(options, true);
        ansi.previousLine(options.length - 1);
        ansi.right(1);
        stdin.setRawMode(true);
        let position:number = options.length - 1;
        let inputStream = new Promise((resolve) => {
            stdin.on("keypress", (str, key) => {
                switch(key.name){
                    case "down":
                        if(position > 0){
                            position = func.selectNextLine(false, options, position);
                        }
                        break
                    case "up":
                        if(position < options.length - 1){
                            position = func.selectNextLine(true, options, position);
                        }
                        break;
                    case "return":
                        let index:number = options.length - position - 1;
                        if(position > 0){
                            ansi.nextLine(position);
                        }
                        ansi.right(options[0].length);
                        ansi.log("\n");
                        resolve(options[index]);
                        break;
                }
            });
        });
        let result = await inputStream;
        stdin.setRawMode(false);
        stdin.removeAllListeners("keypress");
        return result;
    }
}