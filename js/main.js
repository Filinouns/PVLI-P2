var battle = new RPG.Battle();
var actionForm, spellForm, targetForm;
var infoPanel;

function prettifyEffect(obj) {
    return Object.keys(obj).map(function (key) {
        var sign = obj[key] > 0 ? '+' : ''; // show + sign for positive effects
        return `${sign}${obj[key]} ${key}`;
    }).join(', ');
}

function targets(targetForm){
    var targets = targetForm.getElementsByClassName('choices');//Busca la clase con el nombre indicado dentro de actionForm.
    var options = battle.options.list();
    var render;
    var color;
    targets[0].innerHTML = '';
    for(var i = 0; i < options.length; i++){
        if(battle._charactersById[options[i]].party === 'heroes'){
            render = `<li><label class = heroes><input type="radio" name="option" value="${options[i]}" required>${options[i]}</label></li>`;
            targets[0].innerHTML += render;
        } else {
            render = `<li><label class = monsters><input type="radio" name="option" value="${options[i]}" required>${options[i]}</label></li>`;
            targets[0].innerHTML += render;
        }
    }
}

function spells(spellForm){
    var spells = spellForm.getElementsByClassName('choices');
    var activeChar = battle._activeCharacter;
    var CharParty = battle._activeCharacter.party;
    var options = battle._grimoires[CharParty];
    //var but = spellForm.lastElementChild;
    //but = but.firsChild;
    var but = spellForm.querySelector('button[type=submit]');
    var render;
    spells[0].innerHTML = '';
    if(options.hasOwnProperty('health')){
        if (activeChar.mp > 0){ //Tiene mana
            but.disabled = false;
            for(var i in options){
                render = `<li><label><input type="radio" name="option" value="${i}" required>${i}</label></li>`;
                spells[0].innerHTML += render;
            }
        }
        else { //OOM
            but.disabled = true;
            spells[0].innerHTML += activeChar.name + ' is out of mana (OOM).';
        }
    } else {
        but.disabled = true;
        spells[0].innerHTML += activeChar.name + ' can´t cast spells';
        //Añadir mensaje de "Este personaje no puede lanzar hechizos".
    }
}

//document.querySelector(."examples").styles.backgroundColor = "red";
//styles.display = "block"; para mostrar
//No funciona no entiendo porqueeeeeeeeeeeeeee aaaaajjjjj
/*function randomParty(party){
    var numchar = Math.floor(Math.random ()* (5 - 1) + 1);
    var rnd;
    var chars = [];
    for(var i = 0; i < numchar; i++){
        if (party === 'heroes'){
            rnd = Math.floor(Math.random ()* (3 - 1) + 1);
            switch (rnd){
                case 1:
                    chars[i] = RPG.entities.characters.heroTank;
                    break;
                case 2:
                    chars[i] = RPG.entities.characters.heroWizard;
                    break;
            }
        } else {
            rnd = Math.floor(Math.random ()* (4 - 1) + 1);
            switch (rnd){
                case 1:
                    chars[i] = RPG.entities.characters.monsterSlime;
                    break;
                case 2:
                    chars[i] = RPG.entities.characters.monsterBat;
                    break;
                case 3:
                    chars[i] = RPG.entities.characters.monsterSkeleton;
                    break;
            }
        }
    }
}*/

battle.setup({
    heroes: {
        members: //randomParty('heroes'),
        [
            RPG.entities.characters.heroTank,
            RPG.entities.characters.heroWizard
        ],
        grimoire: [
            RPG.entities.scrolls.health,
            RPG.entities.scrolls.fireball
        ]
    },
    monsters: {
        members: //randomParty('monsters')
        [
            RPG.entities.characters.monsterSlime,
            RPG.entities.characters.monsterBat,
            RPG.entities.characters.monsterSkeleton,
            RPG.entities.characters.monsterBat
        ]
    }
});

battle.on('start', function (data) {
    console.log('START', data);
});

battle.on('turn', function (data) {
    console.log('TURN', data);
    // TODO 1: render the characters

    //console.log('THIS', this);
    //console.log('Object Keys', Object.keys);

    var Stringslist = Object.keys(this._charactersById); //Lista de las listas de personajes
    var charlist = document.querySelectorAll('.character-list'); //Lista de las list en HTML
    var render; //Lo que hay que escribir en pantalla
    var target; //El target que hay que escribir
    var heroes = charlist[0];
    var monsters = charlist[1];
    heroes.innerHTML = '';
    monsters.innerHTML = '';

    for(var i = 0; i < Stringslist.length; i++) {
        target = this._charactersById[Stringslist[i]];
        if(target.hp > 0){
            render = '<li data-chara-id="' + Stringslist[i] + '"> ' + target.name + ' (HP: <strong>' + target.hp + '</strong>/' + target.maxHp + ', MP: <strong>' + target.mp + '</strong>/' + target.maxMp +')</li>';
        } else {
            render = '<li data-chara-id="' + Stringslist[i] + '"class = "dead"> ' + target.name + ' (HP: <strong>' + target.hp + '</strong>/' + target.maxHp + ', MP: <strong>' + target.mp + '</strong>/' + target.maxMp +')</li>';
        }
        if(target.party === "heroes"){
            heroes.innerHTML += render;
        } else {
            monsters.innerHTML += render;
        }
    }

    // TODO 2: highlight current character
    //console.log(data.activeCharacterId);
    var active = document.querySelector(`[data-chara-id='${data.activeCharacterId}']`);
    active.classList.add('active');

    // TODO 3: show battle actions form
    var choices = document.querySelectorAll('.choices');
    var opt = choices[0];
    var list = battle.options.list();
    opt.innerHTML = '';
    actionForm.style.display = "block";

    list.forEach(function(option){
        opt.innerHTML += `<li><label><input type="radio" name="option" value="${option}" required> ${option}</label></li>`;   
    });
});

battle.on('info', function (data) {
    console.log('INFO', data);
    // TODO 7: display turn info in the #battle-info panel
    if (data.action === 'attack' && data.success){
        infoPanel.innerHTML = `El ${data.activeCharacterId} a realizado ${data.effect.hp} hp a ${data.targetId} en un ataque demoledor.`;
    } else if (data.action === 'attack' && !data.success){
        infoPanel.innerHTML = `El ${data.activeCharacterId} a fallado al atacar a ${data.targetId}`;
    } else if (data.action === 'cast' && data.success){
        infoPanel.innerHTML = `El ${data.activeCharacterId} a usado el hechizo ${data.scrollName} en ${data.targetId} y a producido ${data.effect.hp} hp`;
    } else if (data.action === 'cast' && !data.success){
        infoPanel.innerHTML = `El ${data.activeCharacterId} a fallado al usar ${data.scrollName}`;
    } else {
        infoPanel.innerHTML = `El ${data.activeCharacterId} se ha defendido, su defensa es ${data.newDefense}`;
    } 
});

battle.on('end', function (data) {
    console.log('END', data);

    // TODO 8: re-render the parties so the death of the last character gets reflected
    var Stringslist = Object.keys(this._charactersById); //Lista de las listas de personajes
    var charlist = document.querySelectorAll('.character-list'); //Lista de las list en HTML
    var render; //Lo que hay que escribir en pantalla
    var target; //El target que hay que escribir
    var heroes = charlist[0];
    var monsters = charlist[1];
    heroes.innerHTML = '';
    monsters.innerHTML = '';

    for(var i = 0; i < Stringslist.length; i++) {
        target = this._charactersById[Stringslist[i]];
        if(target.hp > 0){
            render = '<li data-chara-id="' + Stringslist[i] + '"> ' + target.name + ' (HP: <strong>' + target.hp + '</strong>/' + target.maxHp + ', MP: <strong>' + target.mp + '</strong>/' + target.maxMp +')</li>';
        } else {
            render = '<li data-chara-id="' + Stringslist[i] + '"class = "dead"> ' + target.name + ' (HP: <strong>' + target.hp + '</strong>/' + target.maxHp + ', MP: <strong>' + target.mp + '</strong>/' + target.maxMp +')</li>';
        }
        if(target.party === "heroes"){
            heroes.innerHTML += render;
        } else {
            monsters.innerHTML += render;
        }
    }
    // TODO 9: display 'end of battle' message, showing who won
    infoPanel.innerHTML = `¡Fin de la batalla! Los ganadores son los ${data.winner}`;

    document.body.innerHTML += '<center><form name="reset" style="display:block">' + '<p><button type="submit">---RESTART---</button></p>' + '</form></center>';
});

window.onload = function () {
    actionForm = document.querySelector('form[name=select-action]'); //Defense
    targetForm = document.querySelector('form[name=select-target]'); //Attack
    spellForm = document.querySelector('form[name=select-spell]'); //Cast
    infoPanel = document.querySelector('#battle-info');

    actionForm.addEventListener('submit', function (evt) {
        evt.preventDefault();
        // TODO 4: select the action chosen by the player
        var action = actionForm.elements['option'].value;
        battle.options.select(action);
        //infoPanel;
        // TODO: hide this menu
        actionForm.style.display = 'none';
        // TODO: go to either select target menu, or to the select spell menu
        if(action === 'attack'){
            targets(targetForm);
            targetForm.style.display = 'block';
        } else if (action === 'cast'){
            spells(spellForm);
            spellForm.style.display = 'block';
        }
    });

    targetForm.addEventListener('submit', function (evt) {
        evt.preventDefault();
        // TODO 5: select the target chosen by the player
        var target = targetForm.elements['option'].value;
        battle.options.select(target);
        // TODO: hide this menu
        targetForm.style.display = 'none';
    });

    targetForm.querySelector('.cancel')
    .addEventListener('click', function (evt) {
        evt.preventDefault();
        // TODO: cancel current battle options
        battle.options.cancel();
        // TODO: hide this form
        targetForm.style.display = 'none';
        // TODO: go to select action menu
        actionForm.style.display = 'block';
    });

    spellForm.addEventListener('submit', function (evt) {
        evt.preventDefault();
        // TODO 6: select the spell chosen by the player
        //console.log("Pulsado el boton");
        var spell = spellForm.elements['option'].value;
        battle.options.select(spell);
        //console.log(spell);
        // TODO: hide this menu
        spellForm.style.display = 'none';
        //console.log("Pasado el invisible de spell");
        // TODO: go to select target menu
        var targets = targetForm.getElementsByClassName('choices');//Busca la clase con el nombre indicado dentro de actionForm.
        var options = battle.options.list();
        var render;
        targets[0].innerHTML = '';
        for(var i = 0; i < options.length; i++){
            render = `<li><label><input type="radio" name="option" value="${options[i]}" required>${options[i]}</label></li>`;
            targets[0].innerHTML += render;
        }
        targetForm.style.display = 'block';
    });

    spellForm.querySelector('.cancel')
    .addEventListener('click', function (evt) {
        evt.preventDefault();
        // TODO: cancel current battle options
        battle.options.cancel();
        // TODO: hide this form
        spellForm.style.display = 'none';
        // TODO: go to select action menu
        actionForm.style.display = 'block';
    });

    battle.start();
};
