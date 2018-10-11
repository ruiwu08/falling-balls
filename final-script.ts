import {
    Sprite,
    Container,
    Application,
    Rectangle,
    Circle,
    Graphics,
    DisplayObject,
    Text,
    interaction,
    Point,
    
} from "pixi.js";

import { print } from "introcs";

let appSize: number = 420;
let ballRadius: number = 3;
let brushSize: number = 15;
let count: number = 0;
let spawnInterval: number = 3;
let spawnAmount: number = 1;
let acceleration: number = 0.2;
let bounceRatio: number = 0.8;

let ballCode: number = 0;
let mouseDown: boolean = false;
const getMousePosition = () => app.renderer.plugins.interaction.mouse.global;

let app: Application = new Application(appSize, appSize * 1.5);
document.body.appendChild(app.view);

function makeRectangle(x: number, y: number, width: number, height: number, backgroundColor: number, borderColor: number, borderWidth: number ) {
    var box = new PIXI.Graphics(); 
    box.beginFill(backgroundColor); 
    box.lineStyle(borderWidth , borderColor); 
    box.drawRect(0, 0, width - borderWidth, height - borderWidth); 
    box.endFill(); box.position.x = x + borderWidth/2; box.position.y = y + borderWidth/2; 
    return box;
};

function makeCircle(x: number, y: number, radius: number, backgroundColor: number) {
    var circle = new PIXI.Graphics();
    circle.beginFill(backgroundColor);
    circle.drawCircle(x, y, radius);
    circle.endFill();
    return circle;
};

let background: Graphics = makeRectangle(0, 0, appSize, appSize * 1.5, 0xFFFFFF, 0x000000, 2);
app.stage.addChild(background);

function distance(x1: number, y1: number, x2: number, y2: number): number {
    let x = x1 - x2;
    let y = y1 - y2;
    return Math.sqrt((x * x) + (y * y));
}

function circleCol(a: Graphics, b: Graphics): boolean{
    let d: number = distance(a.x, a.y, b.x, b.y);
    let r = a.width/2 + b.width/2;
    if(r > d){
        return true;
    } else {
        return false;
    }
}

function ballRemove(b: Ball): void{
    app.stage.removeChild(b.Image);
    let i: number = codeArray.indexOf(b.code);
    ballArray.splice(i, 1);
    codeArray.splice(i, 1);
}

function groundCol(cir: Graphics, ground: Graphics): boolean{
    let bar: number = ground.y;
    return cir.y + cir.height > bar;
}

class Ball {
    code: number;
    vy: number;
    vx: number;
    a: number;
    bounceCount: number;
    life: number;
    stayStill: boolean;
    Image: Graphics;
    constructor(){
        this.code = ballCode;
        ballCode += 1;
        this.vy = 0;
        this.vx = 0;
        this.a = acceleration;
        this.bounceCount = 0;
        this.life = 0;
        this.stayStill = false;
        this.Image =  makeCircle(0, 0, ballRadius, 0x4B9CD3);
        this.Image.position.set(Math.random() * appSize + Math.random() * 5 - Math.random() * 5, 0);
        app.stage.addChild(this.Image);
    }
}

let ballArray: Ball[] = [];
let codeArray: number[] = [];

class Wall {
    Image: Graphics;
    x: number;
    y: number;
    constructor(p: Point, radius: number){
        this.x = p.x;
        this.y = p.y;
        this.Image = makeCircle(0, 0, radius, 0x1a294c);
        this.Image.position.set(p.x, p.y);
        app.stage.addChild(this.Image);
    }
}

let wallArray: Wall[] = [];

window.onmousedown = function(e: MouseEvent): void{
    mouseDown = true;
};
window.onmouseup = function(e: MouseEvent): void{
    mouseDown = false;
}

let mainTicker: PIXI.ticker.Ticker = app.ticker.add(function(delta: number): void{  
    count += 1;
    if(count % spawnInterval === 0){
        for(let i: number = 0; i < spawnAmount; i++){
            let b: Ball = new Ball();
            ballArray.push(b);
            codeArray.push(b.code);
        }
    }
    if(mouseDown){
        let a: Point = getMousePosition();
        let w: Wall = new Wall(getMousePosition(), brushSize);
        wallArray.push(w);
    }
    ballArray.forEach(b => {
        b.Image.y += b.vy;
        b.Image.x += b.vx;
        b.vy += b.a;
        b.life += 1;

        ballArray.forEach(c =>{
            if(circleCol(b.Image, c.Image) && b.code != c.code) {
                let magnitude: number = Math.sqrt((b.vy * b.vy) + (b.vx * b.vx));
                magnitude *= bounceRatio;
                let sinx: number = (b.Image.x - c.Image.x) / (distance(b.Image.x, b.Image.y, c.Image.x, c.Image.y));
                let cosx: number = (b.Image.y - c.Image.y) / (distance(b.Image.x, b.Image.y, c.Image.x, c.Image.y));
                b.vx = magnitude * sinx;
                b.vy = magnitude * cosx;
                b.bounceCount += 1;
            } else {
                b.bounceCount = 0;
            }
        });
        wallArray.forEach(w =>{
            if(circleCol(b.Image, w.Image) && b.bounceCount < 1) {
                let magnitude: number = Math.sqrt((b.vy * b.vy) + (b.vx * b.vx));
                magnitude *= bounceRatio;
                let sinx: number = (b.Image.x - w.Image.x) / (distance(b.Image.x, b.Image.y, w.Image.x, w.Image.y));
                let cosx: number = (b.Image.y - w.Image.y) / (distance(b.Image.x, b.Image.y, w.Image.x, w.Image.y));
                b.vx = magnitude * sinx;
                b.vy = magnitude * cosx;
                b.bounceCount += 1;
            } else {
                b.bounceCount = 0;
            }
        });
        if(b.Image.y + b.Image.height > appSize * 1.5 && b.bounceCount < 1){
            b.vy *= -bounceRatio;
            b.bounceCount += 1;
        } else {
            b.bounceCount = 0;
        }

        if(b.Image.x < 0 && b.bounceCount < 1){
            b.vx *= -1;
            b.bounceCount += 1;
        } else {
            b.bounceCount = 0;
        }

        if(b.Image.x > appSize && b.bounceCount < 1){
            b.vy *= -1;
            b.bounceCount += 1;
        } else {
            b.bounceCount = 0;
        }

        if(b.vy < 0.1 && b.vy > -0.1 && b.bounceCount > 3){
            b.stayStill = true;
            b.vy = 0;
        };
        if(b.vy >= 0.1 || b.vy <= -0.1){
            b.stayStill = false;
        };
        if(b.life > 1000){
            ballRemove(b);
        }

    });
});
