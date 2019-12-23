var game;
Object.defineProperty(window, 'DEBUG', {
    get: function() { return this.value;},
    set: function(value) { 
        this.value = value;
        if (game)
            game.renderHitboxes();
    }
})
class Game {
    constructor(props) {
        tryCount = 0;
        $('.game').append('\
            <div id="field">\
                <div id="map"></div>\
                <div id="car"></div>\
                <div id="game-message"></div>\
            </div>'
        );
        $('#map').css({
            backgroundImage: `url(img/game/${props.image}`,
            height: `${props.height}px`,
            width: `${props.width}px`,
        });
        this.width = props.width;
        this.height = props.height;
        $('#map').append(`<div id="loader"></div>`);
        $('#loader').append(`<div style='background-image: url("./img/game/win.png");'></div>`)
        $('#loader').append(`<div style='background-image: url("./img/game/lose.png");'></div>`)
        this.posX = props.posX;
        this.posY = props.posY;

        this.speed = 0;
        this.maxSpeed = 1;
        this.minSpeed = 0.3;
        this.angle = - 0;
        this.isRotateLeft = this.isRotateRight = false;
        this.player = new Car(props.player);

        this.center = [350 - this.posX, 350 - this.posY];

        this.exit = new Exit(props.exit);

        const trees = props.trees;
        this.tree = [];
        for (let i = 0; i < trees.length; i++) {
            if (!trees[i].ignore)
                this.tree.push(new Tree(trees[i]));
            else 
                new Tree(trees[i]);
        }

        this.person = [];
        for (let i = 0; i < props.person.length; i++) {
            this.person[i] = new Person(props.person[i]);
        }

        this.line = [];
        for (let i = 0; i < props.line.length; i++) {
            this.line[i] = new Line(props.line[i]);
        }

        this.engine = setInterval(() => {
            this.move();
            this.render();
            this.player.angle = this.angle;
            this.player.render();
            this.checkColapse();
            this.exit.getAngle(this.center[0], this.center[1], this.angle);
            for (let i = 0; i < this.person.length; i++) {
                this.person[i].render();
            }
        }, 0);

        $(document).keydown((e) => {
            switch(e.keyCode) {
                case 37:
                    this.as = 0.008;
                    break;
                // up
                case 38:
                    this.a = 0.01;
                    break;
                // right
                case 39:
                    this.as = -0.008;
                    break;
                // down
                case 40:
                    this.a = -0.005;
                    break;
                // space
                case 32:
                    this.isStop = true;
                    break;
            }
        }).keyup((e) => {
            switch(e.keyCode) {
                case 37:
                    this.as = 0;
                    break;
                case 38:
                    this.a = 0;
                    break;
                case 39:
                    this.as = 0;
                    break;
                case 40:
                    this.a = 0;
                    break;
                case 32:
                    this.isStop = false;
                    break;
            }
        })
    }

    renderHitboxes() {
        this.player.renderHitbox(DEBUG);
        for (let i = 0; i < this.tree.length; i++) {
            this.tree[i].renderHitbox(DEBUG);
        }
        for (let i = 0; i < this.person.length; i++) {
            this.person[i].renderHitbox(DEBUG);
        }
    }

    testCornors() {
        const hitbox = this.player.getHitboxCornors(this.center[0], this.center[1]);
        if (DEBUG) {
            for (let i = 0; i < hitbox.length; i++)
                $('#map').append(`<div style="background: #f00;
                width: 10px; 
                height: 10px; 
                transform: translate(-50%, -50%); 
                position: absolute; 
                top: ${hitbox[i][1]}px;
                left: ${hitbox[i][0]}px;"></div>
                `)
        }
        console.log(hitbox);
        console.log(this.tree[0].getLength(hitbox[0]));
        console.log(this.tree[0].getLength(hitbox[1]));
        console.log(this.tree[0].getLength(hitbox[2]));
        console.log(this.tree[0].getLength(hitbox[3]));
    }
    fault(message) {
        $(document).off();
        clearInterval(this.engine);
        this.speed = 0;
        new Message({message: message, status: 'Поражение', statusBool: false});
    }
    win(message) {
        $(document).off();
        clearInterval(this.engine);
        this.speed = 0;
        new Message({message: message, status: 'Победа!', statusBool: true});
    }
    checkColapse() {
        console.log(this.person);
        // Check win        
        if (this.exit.check(this.center) && Math.abs(this.speed) < 0.05) {
            if (DEBUG)
                console.log('win');
            else 
                this.win("Вы прошли этот уровень!");
            return;
        }

        let cornors = this.player.getHitboxCornors(this.center[0], this.center[1]);
        // Check borders
        for (let i = 0; i < cornors.length; i++) {
            const cornor = cornors[i];
            
            if (cornor[0] < 0 || cornor[1] < 0 || cornor[0] > this.width || cornor[1] > this.height) {
                if (DEBUG)
                    console.log('out')
                else 
                    this.fault('Не выезжайте за пределы карты!');
                return;
            }
        }

        
        // Check trees
        for (let i = 0; i < cornors.length; i++) {
            const cornor = cornors[i];
            for (let j = 0; j < this.tree.length; j++) {
                if (this.tree[j].check(cornor)) {
                    if (DEBUG)
                        console.log('hit');
                    else 
                        this.fault(this.tree[j].message);
                    return;
                }
            }
        }

        // Check small objects
        // cornors.push(...this.player.getHitboxCenters(cornors));
        for (let i = 0; i < cornors.length; i++) {
            const cornor = cornors[i];
            for (let j = 0; j < this.person.length; j++) {
                if (this.person[j].checkCornor(cornor)){
                    if (DEBUG) 
                        console.log('hit');
                    else 
                        this.fault(this.person[j].message);
                    return;
                }
            }
        }
    }
    move() {
        if (this.isStop) {
            const stop = 0.04;
            if (this.speed > stop) {
                this.speed -= stop;
            }
            else if (this.speed < - stop) {
                this.speed += stop;
            } else {
                this.speed = 0;
            }
        } else {
            if (this.a)
                this.speed += this.a;
            if (this.speed > this.maxSpeed) {
                this.speed = this.maxSpeed;
            }
            if (this.speed < this.maxSpeed / 2 * -1) {
                this.speed = this.maxSpeed / 2 * -1;
            }

            if (this.speed > this.minSpeed || this.speed < -this.minSpeed) {
                if (this.as) {
                    if (this.speed > 0)
                        this.angle += this.as;
                    if (this.speed < 0)
                        this.angle -= this.as;
                }
            }
            else {
                if (this.as) {
                    const as = this.as * Math.abs(this.speed * 1.5);
                    if (this.speed > 0) {
                        this.angle += as;
                    }
                    else {
                        this.angle -= as;
                    }
                }
                
            }
            
        }

        let dx = this.speed * Math.cos(- this.angle);
        let dy = this.speed * Math.sin(- this.angle);

        this.posX -= dx;
        this.posY -= dy;

        this.center = [350 - this.posX, 350 - this.posY];


    }
    render() {
        $('#map').css({
            left: `${this.posX}px`,
            top: `${this.posY}px`,
        })
    }
    
    clear() {
        $('.game').text('');
    }
    restart() {
        $('.game').text('');
        game = new Game(gameProps[0]);
    }
}

class Tree {
    constructor(treeSetting) {
        this.width = treeSetting.width;
        this.height = treeSetting.height;
        this.image = treeSetting.image ? `url('img/game/${treeSetting.image}')` : 'none';
        this.posX = treeSetting.posX;
        this.posY = treeSetting.posY;

        this.id = treeSetting.element;
        let tree = document.createElement('div');
        tree.id = treeSetting.element;
        document.getElementById('map').appendChild(tree);
        this.element = document.getElementById(treeSetting.element);

        this.hitboxRadius = treeSetting.hitbox;

        this.message = treeSetting.message ? treeSetting.message : '';

        
        this.hitboxId = `${this.id}-hitbox`;
        this.element.innerHTML = `<div id="${this.hitboxId}"></div>`;
        this.hitbox = document.getElementById(this.hitboxId);
        this.c = '#f00';

        this.render();
        this.renderHitbox(DEBUG);
    }
    check(point) {
        const length = Math.sqrt(Math.pow(point[0] - (this.posX + parseInt(this.width) / 2), 2) + Math.pow(point[1] - (this.posY + parseInt(this.height) / 2), 2));
        if (length < this.hitboxRadius) {
            this.c = '#0f0';
            this.render();
            this.renderHitbox(DEBUG);
            return true;
        } else {
            this.c = '#f00';
            this.render();
            this.renderHitbox(DEBUG);
            return false;
        }
    }
    getLength(point) {
        const length = Math.sqrt(Math.pow(point[0] - (this.posX + parseInt(this.width) / 2), 2) + Math.pow(point[1] - (this.posY + parseInt(this.height) / 2), 2));
        return length;
    }
    renderHitbox(deb) {

        this.hitbox.style.position = 'absolute';
        this.hitbox.style.top = '50%';
        this.hitbox.style.left = '50%';
        this.hitbox.style.transform = 'translate(-50%, -50%)';
        this.hitbox.style.width = `${this.hitboxRadius * 2}px`;
        this.hitbox.style.height = `${this.hitboxRadius * 2}px`;
        this.hitbox.style.borderRadius = '50%';
        this.hitbox.style.background = deb ? this.c : 'none';
    }
    render() {
        this.element.style.position = 'absolute';
        this.element.style.top = this.posY + 'px';
        this.element.style.left = this.posX + 'px';
        this.element.style.width = this.width;
        this.element.style.height = this.height;
        this.element.style.backgroundImage = this.image;
        this.element.style.backgroundSize = 'contain';
        this.element.style.backgroundRepeat = 'no-repeat';
        this.element.style.backgroundPosition = '50% 50%';
    }
}
class Car {
    constructor(carSettings) {
        const {width, height, image, element, posX, posY} = carSettings;

        this.width = width;
        this.height = height;
        this.image = image ? 'img/game/' + image : 'none';
        this.element = document.getElementById(element);

        this.posX = posX;
        this.posY = posY;

        const halfW = parseInt(this.width) / 2;
        const halfH = parseInt(this.height) / 2;
        this.diagonal = Math.sqrt(halfW * halfW + halfH * halfH);
        this.insideAngle = Math.atan(halfH / halfW);
        this.render();

        
        let hitbox = `${this.element.id}-hitbox`;
        this.element.innerHTML = `<div id="${hitbox}"></div>`;

        this.hitbox = document.getElementById(hitbox);
        this.renderHitbox(DEBUG);
    }

    renderHitbox(deb) {
        this.hitbox.style.width = this.width;
        this.hitbox.style.height = this.height;
        this.hitbox.style.boxSizing = 'border-box';
        this.hitbox.style.border = deb ? "1px solid #f00" : 'none';
    }

    getHitboxCornors(posx, posy) {
        const a = -this.angle;
        const b = this.insideAngle;

        // right top and left bottom
        const dy1 = Math.sin(a + b) * this.diagonal;
        const dx1 = Math.cos(a + b) * this.diagonal; 

        // right bottom and left top;
        const dy2 = Math.sin(a - b) * this.diagonal;
        const dx2 = Math.cos(a - b) * this.diagonal;

        return [
            [posx + dx1, posy + dy1],  // right top
            [posx - dx2, posy - dy2],  // left top
            [posx - dx1, posy - dy1],  // left bottom
            [posx + dx2, posy + dy2],  // right bottom
        ]
    }
    getHitboxCenters(cornor) {
        let result = [];
        for (let i = 0; i < cornor.length; i++) {
            result.push([(cornor[i][0] + cornor[(i + 1) % 4][0]) / 2, (cornor[i][1] + cornor[(i + 1) % 4][1]) / 2]);
        }
        return result;
    }

    render() {
        this.element.style.position = 'absolute';
        this.element.style.top = '50%';
        this.element.style.left = '50%';
        this.element.style.width = this.width;
        this.element.style.height = this.height;
        this.element.style.marginLeft = - parseInt(this.width) / 2 + 'px';
        this.element.style.marginTop =  - parseInt(this.height) / 2 + 'px';
        this.element.style.backgroundImage = `url(${this.image})`;
        this.element.style.backgroundSize = 'contain';
        this.element.style.backgroundRepeat = 'no-repeat';
        this.element.style.backgroundPosition = '50% 50%';
        this.element.style.transform = `rotate(${- this.angle * 180 / Math.PI}deg)`
    }
}
class Exit {
    constructor(props) {
        this.posX = props.posX;
        this.posY = props.posY;

        this.width = props.width;
        this.height = props.height;

        this.render();
    }
    render() {
        $('#map').append('<div id="game-exit"></div>');

        $('#game-exit').css({
            position: 'absolute',
            top: `${this.posY}px`,
            left: `${this.posX}px`,
            width: this.width,
            height: this.height,
            border: '5px solid #9C27B0',
            borderRadius: '10px'
        });

        $('#map').append('<div id="exit-arrow"></div>');
        $('#exit-arrow').css({
            position: 'absolute',
            transformOrigin: '0% 50%',
            height: '8px',
            width: '200px'
        });

        $('#exit-arrow').append('<div id="exit-arrow-content"></div>');
        
    }
    getAngle(posX, posY) {
        const dx = posX - this.posX - parseInt(this.width) / 2;
        const dy = posY - this.posY - parseInt(this.height) / 2;
        
        let angle = 90 - Math.atan(Math.abs(dx) / Math.abs(dy)) * 180 / Math.PI;

        if (dx > 0) angle = 180 - angle;
        if (dy > 0) angle = -angle;

        $('#exit-arrow').css({
            top: `${posY}px`,
            left: `${posX}px`,
            transform: `translateY(-4px) rotate(${angle}deg)`
        })

        if (Math.sqrt(dx * dx + dy * dy) < 250) $('#exit-arrow').hide()
        else $('#exit-arrow').show();
    }
    check(point) {
        return point[0] > this.posX && point[0] < this.posX + parseInt(this.width)
            && point[1] > this.posY && point[1] < this.posY + parseInt(this.height)
    }
}
class Person {
    constructor(props) {
        this.script = props.script;
        if (this.script) this.script = this.script.bind(this);
        this.stepAnimation = props.stepAnimation;
        if (this.stepAnimation) this.stepAnimation = this.stepAnimation.bind(this);
        this.stepAnimationRate = props.stepAnimationRate;
        this.posX = props.posX;
        this.posY = props.posY;
        this.angle = props.angle;
        this.width = props.width;
        this.height = props.height;
        this.angle = props.angle;
        this.speed = props.speed;
        this.hitboxColor = '#f00'
        this.message = props.message ? props.message : '';

        this.stop = false;
        $('#loader').append(`<div style='background-image: url("./img/game/person-step-1.png");'></div>`)
        $('#loader').append(`<div style='background-image: url("./img/game/person-step-2.png");'></div>`)
        $('#loader').append(`<div style='background-image: url("./img/game/person-stop.png");'></div>`)
        this.id = props.id;
        $('#map').append(`<div id="${this.id}"></div>`)
        this.id = `#${this.id}`
        $(this.id).css({
            width: this.width,
            height: this.height,
            position: 'absolute',
            backgroundSize: 'contain',
            transition: 'transform 0.5s',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '50% 50%'
        })
        this.image = props.image ? `url('img/game/${props.image}')` : 'none';

        this.stepIndex = 0;
        this.step = setInterval(this.stepAnimation, this.stepAnimationRate);

        this.render()
        $(this.id).append(`<div id="${props.id}-hitbox"></div>`);
        this.renderHitbox(DEBUG);
    }
    renderHitbox(deb) {
        $(this.id + "-hitbox").css({
            width: `${this.width}`,
            height: `${this.height}`,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            transition: 'inherit'
        })
        if (deb) {
            $(this.id + '-hitbox').css({
                background: this.hitboxColor
            })
        } else {
            $(this.id + '-hitbox').css({
                background: 'none'
            })
        }
    }
    render() {
        this.move();
        if (this.script) this.script()
        $(this.id).css({
            top: `${this.posY}px`,
            left: `${this.posX}px`,
            transform: `rotate(${this.angle * 180 / Math.PI}deg)`,
            backgroundImage: `${this.image}`,
        });
    }
    move() {
        let dx = this.speed * Math.cos(- this.angle);
        let dy = this.speed * Math.sin(- this.angle);

        this.posX += dx;
        this.posY += dy;
    }
    checkCornor(cornor) {
        const x1 = this.posX;
        const y1 = this.posY;
        const x2 = this.posX + parseInt(this.width);
        const y2 = this.posY + parseInt(this.height);

        if (x1 <= cornor[0] && cornor[0] <= x2 && y1 <= cornor[1] && cornor[1] <= y2) {
            this.hitboxColor = '#0f0';
            this.renderHitbox(DEBUG);
            return true;
        }
        else {
            this.hitboxColor = '#f00';
            this.renderHitbox(DEBUG);
            return false;
        }
    }
    checkLines() {
        const lines = this.getHitboxLines();
        
        for (let i = 0; i < lines.length; i++) {
            $('#map').append(`<div style="position: absolute; background: #00f; width: 10px; height: 10px; top: ${lines[i][0][1]}px; left: ${lines[i][0][0]}px"></div>`)
            $('#map').append(`<div style="position: absolute; z-index: 1; background: #f00; width: 5px; height: 10px; top: ${lines[i][1][1]}px; left: ${lines[i][1][0]}px"></div>`)
        }
    }
    getHitboxLines() {
        const w = parseInt(this.width);
        const h = parseInt(this.height);
        return [
            [[this.posX, this.posY], [this.posX + w, this.posY]],
            [[this.posX + w, this.posY], [this.posX + w, this.posY + h]],
            [[this.posX + w, this.posY + h], [this.posX, this.posY + h]],
            [[this.posX, this.posY + h], [this.posX, this.posY]],
        ]
    }
}
class Line {
    constructor(props) {
        this.posX = props.posX;
        this.posY = props.posY;
        this.width = props.width;

        this.angle = props.angle;
        this.id = props.id;

        this.renderHitbox(DEBUG);
    }
    renderHitbox(deb) {
        $('#map').append(`<div id="${this.id}"></div>`);
        $('#' + this.id).css({
            position: 'absolute',
            top: this.posY + 'px',
            left: this.posX + 'px',
            transformOrigin: '0% 50%',
            transform: `rotate(${this.angle}deg)`,
            height: '8px',
            width: this.width,
            marginTop: '-4px'
        });

        if (deb) {
            $('#' + this.id).css({
                background: '#00f'
            })
        } else {
            $('#' + this.id).css({
                background: 'none'
            })
        }
    }
}
class Message {
    constructor(props) {
        this.message = props.message;
        this.mesImage = props.statusBool ? 'win' : 'lose';
        this.status = props.status;
        let options = '<div id="game-restart">начать заново</div><br><div id="game-menu">выйти в меню</div>';
        tryCount++;
        if (tryCount > 5) {
            tryCount = 0;
            this.message += "<br>Повторите теорию и возвращайтесь"
            options = '<br><div id="game-menu">выйти в меню</div>';
        }


        document.getElementById('game-message').innerHTML = 
        `<div>
            <div class="mes-image ${this.mesImage}"></div>
            <div class="mes-content"><h2>${this.status}</h2>${this.message}</div>
            <div class="mes-option">${options}</div>
        </div>`

        $('#field').addClass(this.mesImage);

        $('#game-menu').click(this.exit);
        $('#game-restart').click(this.restart);

    }
    restart() {
        game.restart();
        $('#game-message').text('');
    }
    exit() {
        game.clear();
        $('main').removeClass('ingame');
        $('.state').removeClass('active');
        $('.main-menu').addClass('active');
    }
}
let tryCount = 0;
DEBUG = false;
// game = new Game(gameProps[0])
