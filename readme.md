# Lightweight Undo Manager

## Table of Contents

1. [Introduction](#introduction)
2. [Install](#install)
3. [Usage](#usage)
4. [Tutorials](#tutorials)
    1. [Draggable Circle](#draggable-circle)

## Introduction
Implementing undo system is always a challenge because it's hard to grasp the idea at first. Especially if you are developing editing apps its almost mandatory to provide reliable undo system to users. This library is intended to get over this challenge easily.

## Install 
For nodejs application it can be installed from npm:
```shell
$ npm install undokit
```

Then it can be imported with require:
```javascript
const {SetValueCmd, UndoKit} = require("undokit")
```

Or it can be directly imported from the path:
```javascript
const {SetValueCmd, UndoKit} = require("./path-to-module/undoKit.cjs")
```


For web, it can also be imported from path. UndoKit relies on ES modules, any script that references it must use type="module" as shown below:
```javascript
<script type="module">
    import {SetValueCmd, UndoKit} from "./path-to-module/undoKit.mjs"
</script>
```


## Usage

Let's take a look at following nodejs app example.
```javascript
const { SetValueCmd, UndoKit } = require("undokit")

let undoKit = new UndoKit()

let myCar = {
    value: "$15,000"
}

let myCmd = new SetValueCmd(myCar, "$20,000")
undoKit.push(myCmd)

console.log(myCar.value)
// Output: $20,000

undoKit.undo()
console.log(myCar.value)
// Output: $15,000
```

On this example, we'll create a simple object with 'value' attribute. We'll modify this value couple times then try to undo and redo these actions. Let's start with creating our object with 'value' property.

```javascript
let myCar = {
    value: "$15,000"
}
```

UndoKit comes with SetValueCmd command out of the box. It's ready to use with any object with any properties. We can create any custom command as well but we'll do it later. We"ll keep it simple for this example.

We first need to create a command to be able to undo or redo objects by passing our object and our new value. Commands look for a property named 'value' in the object as default if any other property was not specified. We'll see how to make any other property undoable later.

```javascript
let myCmd = new SetValueCmd(myCar, "$20,000")
```

If we print current value, we can see our object still has same value, nothing changed yet.

```javascript
console.log(myCar.value)
// Output: $15,000
```

As a next step we need to push this command where everything starts working.

```javascript
undoKit.push(myCmd)
```

As soon as we add our command to the UndoKit, it updates our object with new value. We never manually update the our object. Let's try to print value again.

```javascript
console.log(myCar.value)
// Output: $20,000
```

And revert back to its original value by doing undo.

```javascript
undoKit.undo()
console.log(myCar.value)
// Output: $15,000
```

That's all. We successfuly undone our changes. Now try to make things little bit more complicated.

```javascript
myCar.color = "yellow"

let myColorCmd = new SetValueCmd(myCar, "green", "color");

undoKit.push(myCmd);
undoKit.push(myColorCmd);
console.log(JSON.stringify(myCar));
// Output: {"value":"$20,000","color":"green"}

undoKit.undo();
undoKit.undo();
console.log(JSON.stringify(myCar));
// Output: {"value":"$15,000","color":"yellow"}

undoKit.push(myCmd, myColorCmd);
console.log(JSON.stringify(myCar));
// Output: {"value":"$20,000","color":"green"}

undoKit.undo();
console.log(JSON.stringify(myCar));
// Output: {"value":"$15,000","color":"yellow"}

undoKit.redo();
console.log(JSON.stringify(myCar));
// Output:{"value":"$20,000","color":"green"}
```

We start by adding a 'color' property to our car object.
```javascript
myCar.color = "yellow";
```

Now create a new command that changes the color property. This time we pass our new property name 'color' as third parameter. Now UndoKit will know which property to track on this command.

```javascript
let myColorCmd = new SetValueCmd(myCar, "green", "color")
```

Steps are almost same until here. But what if we want to change both value and color together? If we add our commands one by one to UndoKit we'll need to undo twice to get back.

```javascript
undoKit.push(myCmd);
undoKit.push(myColorCmd);
console.log(JSON.stringify(myCar));
// Output: {"value":"$20,000","color":"green"}

undoKit.undo();
undoKit.undo();
console.log(JSON.stringify(myCar));
// Output: {"value":"$15,000","color":"yellow"}
```

But we might want to modify many properties together and undo all at once. In this case we push all commands together that we want to undo at once.
```javascript
undoKit.push(myCmd, myColorCmd);
console.log(JSON.stringify(myCar));
// Output: {"value":"$20,000","color":"green"}

undoKit.undo();
console.log(JSON.stringify(myCar));
// Output: {"value":"$15,000","color":"yellow"}
```

Now try to redo our last action.
```javascript
undoKit.redo();
console.log(JSON.stringify(myCar));
// Output: {"value":"$20,000","color":"green"}
```

That's all. We successfully undone and redone multiple properties together. It's the main idea lies behind the UndoKit. Now we try to implement our own command. Start with clearing any undo history left from previous examples.

```javascript
undoKit.clearHistory()
```

Let's say we have an array and we want to add elemets with undo support. So anytime we add a new element we'll be able to undo or redo these actions. All we need to do is create a class with undo and redo methods.

```javascript
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
```

Redo is always the actual the operation that we want to do. UndoKit executes redo method when any command pushed to history. That's why we never update our objects manually if we want to use undo properly. Undo is the exact opposite of what we do in the redo. 

Starting with redo makes rest easier and straightforward. In this example we want to add an element to array. So we do this operation inside of redo function by using push function. Notice that we need an array and a new element to do this. We pass these objects in the constructor. Command keeps a reference to this array and the new element. In the undo we just pop the last added element.

Now try to test this command. Start with creating an color array with some default values.
```javascript
let myColors = ["red", "green"]
```

Then create two commands that adds two more color our array.
```javascript
let addBlueCmd = new AddElementCmd(myColors, 'blue')
let addYellowCmd = new AddElementCmd(myColors, 'yellow')
```

Add these commands to our UndoKit and see how our array changed.
```javascript
undoKit.push(addBlueCmd, addYellowCmd)
console.log(myColors);
// Output: [ 'red', 'green', 'blue', 'yellow' ]
```

Great, we successfully updated our array with undo suport. Now try to undo.
```javascript
undoKit.undo()
console.log(myColors)
// Output: [ 'red', 'green' ]
```

As we can see, everything went back to beginning. If we try to do more undo it will warn us that no more undo operation available.
```javascript
undoKit.undo()
// Output: No more undo available.
```

## Tutorials
In this section we'll try to implement real world ui applications and apply undo redo actions.

### Draggable Circle
Let's take a look at following example.
```javascript
import { UndoKit } from "./path-to-module/undoKit-web.js"

let undoKit = new UndoKit()

class SetPosCmd {
    constructor(element, newX, newY) {
        this.element = element;
        this.oldX = this.element.offsetLeft;
        this.oldY = this.element.offsetTop;

        this.newX = newX;
        this.newY = newY;
    }
    undo() {
        this.element.style.left = this.oldX + "px";
        this.element.style.top = this.oldY + "px";
    }
    redo() {
        this.element.style.left = this.newX + "px";
        this.element.style.top = this.newY + "px";
    }
}

document.onkeydown = function (e) {
    var evtobj = window.event ? event : e
    if (evtobj.keyCode == 90 && evtobj.ctrlKey && !evtobj.shiftKey) undoKit.undo();
    if (evtobj.keyCode == 90 && evtobj.ctrlKey && evtobj.shiftKey) undoKit.redo();
};


var circle = document.querySelector("#item");
var container = document.querySelector("#container");

var active = false;
var circleCurrentX;
var circleCurrentY;
var mouesStartX;
var mouesStartY;
var circleStartX;
var circleStartY;

document.body.addEventListener("mousedown", dragStart, false);
document.body.addEventListener("mouseup", dragEnd, false);
document.body.addEventListener("mousemove", drag, false);

function dragStart(e) {
    circleStartX = circle.offsetLeft;
    circleStartY = circle.offsetTop;

    mouesStartX = e.clientX;
    mouesStartY = e.clientY;

    if (e.target === circle) {
        active = true;
    }
}

function dragEnd(e) {
    // change back to start pos
    circle.style.left = circleStartX + "px";
    circle.style.top = circleStartY + "px";

    undoKit.push(new SetPosCmd(circle, circleCurrentX, circleCurrentY))
    active = false;
}

function drag(e) {
    if (active) {
        e.preventDefault();

        circleCurrentX = e.clientX - mouesStartX + circleStartX;
        circleCurrentY = e.clientY - mouesStartY + circleStartY;

        circle.style.left = circleCurrentX + "px";
        circle.style.top = circleCurrentY + "px";
    }
}
```

In this example we'll try to implement simple user app. We'll have a little circle in the screen. Users will be able to drag this circle as many as they want and undo these move operations by ctrl-z and redo by ctrl-shift-z.

We wont go into details the html setup, event listeners, and running server to be able to test index.html here, our main focus will be creating a command that provides undo redo actions.

When you open index.html, you'll see we have three main functions that drive the dragging event, dragStart, drag and dragEnd.

```javascript
function dragStart(e) {
    ...
}

function drag(e) {
    ...
}

function dragEnd(e) {
    ...
}
```

As a simple aproach, we let user to enjoy playing with circle first. As soon as user ends dragging, we remove user action and repeat same action with our custom command. 

To do that, when user finishes dragging, we'll store circle's last position. Then reset circle position to where user start draging, like user never touched it. We'll create a new command with the last position we already stored, and send circle to this last position again by adding this command to UndoKit. 

Let's take a look at dragStart function. First we define our circle start position on the top of startDrag function and we initialize them with circle's start position as soon as user start dragging.
```javascript
var circleStartX;
var circleStartY;
...

function dragStart(e) {
    circleStartX = circle.offsetLeft;
    circleStartY = circle.offsetTop;
    ...
}
```

When user stops, we first send circle back to start position. Then we create SetPosCmd command by passing circle itself and circle's last position that we already calculated in the drag function. As soon as we add this command to UndoKit, it will send circle to new positon again.
```javascript
function dragEnd(e) {
    circle.style.left = circleStartX + "px";
    circle.style.top = circleStartY + "px";

    let posCmd = new SetPosCmd(circle, mosueCurrentX, mosueCurrentY)
    undoKit.push(posCmd)
    ...
}
```

Now let's see how we implemented the SetPosCmd command. To be able to create a custom command that works properly with UndoKit, we need to create a class with undo and redo methods. To keep this implementations simple and straightforward, we always start with the redo. Bacuse redo is the actual operation that we want to do. This way we can easily define what parameters we need to pass to the constructor. And undo is just reverse version of the redo function.
```javascript
class SetPosCmd {
    constructor(...) {
        ...
    }
    undo() {
        ...
    }
    redo() {
        ...
    }
}
```

Redo method is pretty straightforward, we only need to set the new values to the circle. That means we'll need to pass circle itself and new position to the constructor.
```javascript
redo() {
    this.element.style.left = this.newX + "px";
    this.element.style.top = this.newY + "px";
}
```

In the constructor, there is one additional step that we need to do. We store start position too. As you remember, we set circle to start position before we create the command object. This way command object can store start position in the constructor.
```javascript
constructor(element, newX, newY) {
    this.element = element;
    this.oldX = this.element.offsetLeft;
    this.oldY = this.element.offsetTop;

    this.newX = newX;
    this.newY = newY;
}
```

You may ask why we didnt pass start and end position together. We could do that way too. But when things starts geting complicated, you'll start losing track of all commands and their different parameters. We always want to keep functions simple by being consistent and passing as few paramters as possible.

And in the undo, we just set the start values that we already stored in the constructor, that's all.
```javascript
undo() {
    this.element.style.left = this.oldX + "px";
    this.element.style.top = this.oldY + "px";
}
```

Now run index.html and enjoy circle with undo redo support.

#### Summary:
Let user do the task and store user input. Then revert user action back to start state. Repeat same action with command object. Limiting the amount of command parameters and giving each command one job is important. This way all commands stay consistent and can be read much easier when project gets bigger.
