const { SetValueCmd, UndoKit } = require("../../dist/undoKit.cjs");
/*
On the following example, we'll create a simple object with 'value' attribute.
We'll modify this value couple times then try to undo and tredo these actions.
Let's start with creating our object with 'value' property.
*/
let undoKit = new UndoKit()

let myCar = {
    value: "$15,000"
};
/*
Undomanager comes with SetValueCmd command out of the box. It's ready to use with any object with any properties.
We can create any custom command as well but we'll do it later. We"ll keep it simple for this example.
We first need to create a command to be able to undo or redo objects by passing our object and our new value.
Commands look for a property named 'value' in the object as default if any other property was not specified.
We'll see how to make any other property undoable later.
*/
let myCmd = new SetValueCmd(myCar, "$20,000");
//If we print current value, we can see our object still has same value, nothing changed yet.
console.log(myCar.value);
// $15,000
//As a next step we need to push this command where everything starts working.
undoKit.push(myCmd);
//Let's try to print value again.
console.log(myCar.value);
// $20,000
//And undo.
undoKit.undo();
console.log(myCar.value);
// $15,000
/*
That's all. We successfuly undone our changes.
So let's try to make things little bit more complicated. Add a 'color' property to our car object.
*/
myCar.color = "yellow";

/*
Now create a new command that changes the color property. This time we pass our new property name 'color' as third parameter. 
Now UndoKit will know which property to track on this command.
*/
let colorCmd = new SetValueCmd(myCar, "green", "color");

/*
Steps are almost same until here. What if we want to change both value and color at the same time?
If we add our commands one by one to UndoKit we'll need to undo twice to get back.
*/
undoKit.push(myCmd);
undoKit.push(colorCmd);
console.log(JSON.stringify(myCar));
//{"value":"$20,000","color":"green"}

undoKit.undo();
undoKit.undo();
console.log(JSON.stringify(myCar));
//{"value":"$15,000","color":"yellow"}

/*
But we might want to modify many properties together and undo all at once. 
In this case we push all commands together that we want to undo at once.
*/
undoKit.push(myCmd, colorCmd);
console.log(JSON.stringify(myCar));
//{"value":"$20,000","color":"green"}

undoKit.undo();
console.log(JSON.stringify(myCar));
//{"value":"$15,000","color":"yellow"}

/*
Now try to redo our last action.
*/
undoKit.redo();
console.log(JSON.stringify(myCar));
//{"value":"$20,000","color":"green"}

/*
That's all. We successfully undone and redone multiple properties together. 
It's the main idea lies behind the UndoKit. Now we try to implement our own command.

Let's say we have an array and we want to add elemets with undo. 
So anytime we add a new element we'll be able to undo or redo these actions. 
All we need to do is creating a class with undo and redo methods.
*/

// Clear any previous history.
undoKit.clearHistory()

class AddElementCmd {
    constructor(array, newElement) {
        this.array = array;
        this.newElement = newElement;
    }
    undo() {
        this.array.pop()
    }
    redo() {
        this.array.push(this.newElement)
    }
}

let myColors = ["red", "green"]

let addBlueCmd = new AddElementCmd(myColors, 'blue')
let addYellowCmd = new AddElementCmd(myColors, 'yellow')

undoKit.push(addBlueCmd, addYellowCmd)
console.log(myColors);

undoKit.undo()
console.log(myColors)
undoKit.undo()
