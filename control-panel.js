var ctrlPanelCanvas = document.getElementById("ControlPanel");
var button1x = ctrlPanelCanvas.width/60;
var button2x = ctrlPanelCanvas.width/10;
var button3x = ctrlPanelCanvas.width/5.45;
var button4x = ctrlPanelCanvas.width/3.75;
var button5x = ctrlPanelCanvas.width/2.85;
var button6x = ctrlPanelCanvas.width/2.30;
var button7x = ctrlPanelCanvas.width/1.93;
var button8x = ctrlPanelCanvas.width/1.67;
var button9x = ctrlPanelCanvas.width/1.43;
var button10x = ctrlPanelCanvas.width/1.2;
var lastModified='';
var bty=40;

function renderCtrlPanel() {
    ctx.font = '18pt Calibri';
    ctx.fillStyle = 'black';
    ctx.fillText('CONTROL PANEL', 5, 15);

    ctx.font='11pt Calibri';
    ctx.fillText(lastModified, ctrlPanelCanvas.width/2.5, 10);

    ctx.fillStyle = 'red';
    ctx.fillRect(button1x, bty, 30, 60);// pulsante 's'
    ctx.fillStyle = 'green';
    ctx.fillRect(button2x, bty, 30, 60);// pulsante 'w'

    ctx.font = '8pt Calibri';
    ctx.fillStyle = 'black';
    ctx.fillText('Inc. acc.', button3x, 40);
    ctx.fillRect(button3x, bty+10, 30, 30);// pulsante increase acc.
    ctx.fillText('Dec. acc.', button4x, 40);
    ctx.fillRect(button4x, bty+10, 30, 30);// pulsante decrease acc.

    ctx.fillText('Inc. facing-grip', button5x-20, 90);
    ctx.fillRect(button5x, bty+10, 30, 30);// pulsante increase facing grip
    ctx.fillText('Dec. facing-grip', button6x-20, 40);
    ctx.fillRect(button6x, bty+10, 30, 30);// pulsante decrease facing grip

    ctx.fillText('Inc. x-grip', button7x, 40);
    ctx.fillRect(button7x, bty+10, 30, 30);// pulsante increase x-grip
    ctx.fillText('Dec. x-grip', button8x, 40);
    ctx.fillRect(button8x, bty+10, 30, 30);// pulsante decrease x-grip

    ctx.fillStyle = 'black';
    ctx.fillRect(button9x, bty+10, 60, 30);// pulsante 'a'
    ctx.fillRect(button10x, bty+10, 60, 30);// pulsante 'd'

    ctx.fillStyle = 'blue';
    ctx.font='11pt Calibri';
    ctx.fillText('TOGGLE ENVIRONMENT MAPPING', button9x-20, 15);
    ctx.fillRect(button10x+80, 0, 30, 30);
}

var accStep=0.001, gripStep=0.05;
function ctrlPanelClick(e){
    var event = {keyCode:undefined};
    var coordX = e.pageX - (ctrlPanelCanvas.offsetLeft+5);//c'e' un margine di default di 5px
    var coordY = e.pageY - (ctrlPanelCanvas.offsetTop+5);
    
    if(coordX>button1x && coordX<button1x+30 && coordY>bty && coordY<bty+60){
       //pulsante s premuto
       event.keyCode=83;
       if(e.type=='mousedown') doKeyDown(event);
       else doKeyUp(event);
       return;
    }
    if(coordX>button2x && coordX<button2x+30 && coordY>bty && coordY<bty+60){
       //pulsante w premuto
       event.keyCode=87;
       if(e.type=='mousedown') doKeyDown(event);
       else doKeyUp(event);
       return;
    }
    if(coordX>button9x && coordX<button9x+60 && coordY>bty+10 && coordY<bty+10+30){
       //pulsante a premuto
       event.keyCode=65;
       if(e.type=='mousedown') doKeyDown(event);
       else doKeyUp(event);
       return;
    }
    if(coordX>button10x && coordX<button10x+50 && coordY>bty+10 && coordY<bty+10+30){
       //pulsante d premuto
       event.keyCode=68;
       if(e.type=='mousedown') doKeyDown(event);
       else doKeyUp(event);
       return;
    }

    if(coordX>button3x && coordX<button3x+30 && coordY>bty+10 && coordY<bty+10+30){
        //pulsante inc. acc. premuto
        if(e.type=='mousedown'){
            currentAcc=accMax;
            currentAcc+=accStep;
            if(currentAcc<=0.01) accMax=currentAcc;
            lastModified="Current acceleration: "+accMax;
        }
        return;
     }
     if(coordX>button4x && coordX<button4x+30 && coordY>bty+10 && coordY<bty+10+30){
        //pulsante dec. acc. premuto
        if(e.type=='mousedown'){
            currentAcc=accMax;
            currentAcc-=accStep;
            if(currentAcc>=0) accMax=currentAcc;
            lastModified="Current acceleration: "+accMax;
        }
        return;
     }
     if(coordX>button5x && coordX<button5x+30 && coordY>bty+10 && coordY<bty+10+30){
        //pulsante inc. facing-grip premuto
        if(e.type=='mousedown'){
            currentGrip=grip;
            currentGrip+=gripStep;
            if(currentGrip<1)grip=currentGrip;
            lastModified="Current facing grip: "+grip;
        }
        return;
     }
     if(coordX>button6x && coordX<button6x+30 && coordY>bty && coordY<bty+10+30){
        //pulsante dec. facing-grip premuto
        if(e.type=='mousedown'){
            currentGrip=grip;
            currentGrip-=gripStep;
            if(currentGrip>0.02)grip=currentGrip;
            lastModified="Current facing grip: "+grip;
        }
        return;
     }
     if(coordX>button7x && coordX<button7x+30 && coordY>bty+10 && coordY<bty+10+30){
        //pulsante inc. x-grip premuto
        if(e.type=='mousedown'){
            currentGrip=attritoX;
            currentGrip+=gripStep;
            if(currentGrip<1)attritoX=currentGrip;
            lastModified="Current x grip: "+attritoX;
        }
        return;
     }
     if(coordX>button8x && coordX<button8x+30 && coordY>bty+10 && coordY<bty+10+30){
        //pulsante dec. x-grip premuto
        if(e.type=='mousedown'){
            currentGrip=attritoX;
            currentGrip-=gripStep;
            if(currentGrip>0)attritoX=currentGrip;
            lastModified="Current x grip: "+attritoX;
        }
        return;
     }
     if(coordX>button10x+80 && coordX<button10x+80+30 && coordY>0 && coordY<30){
      //pulsante toggle env. map
      if(e.type=='mouseup'){
          envMapping==0?envMapping=1:envMapping=0;
      }
      return;
   }
 }