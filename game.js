kaboom({
    global : true,
    fullscreen : true,
    scale : 2,
    debug : true,
    clearColor : [0,0,0,1]
})
let score = 0;
let isJumping = true;
const Speed = 120;
const Jump = 400;
const ENEMY_SPEED = 30;
const FALL_DEATH = 400;
const WIN_POS = 1000;
// loadRoot('https://imgur.com/')
loadSprite("block", 'block.png')
loadSprite("coin", 'Coin.png')
loadSprite("evil", 'evil.png')
loadSprite("hero", 'hero.png')
loadSprite("mushroom", 'mushroom.png')
loadSprite("mystry", 'mystry.png')
loadSprite("pipe", 'pipe.png')
loadSprite("coin-?",'mystry.png')
loadSprite("mushroom-?",'mystry.png')


scene("game",()=>{
    layers(['bg','obj','ui'],'obj');

    const map = [
        '                                             ',
        '                                             ',
        '                                             ',
        '                                             ',
        '             c c                               ',
        '     *   =*=/=   c                            ',
        '                   c                    /       ',
        '                     c                  e        c==',
        '                    e   e    p        e    e  c  ',
        '==============================   =============     ',
    ];

    const levelCfg = {
        width : 20,
        height : 20,
        '=' : [sprite('block'), solid()],
        'c' : [sprite('coin'),'coin'],
        'm' : [sprite('mushroom'),'mushroom',solid(),body()],
        'p' : [sprite('pipe'),solid(), scale(0.5)],
        'e' : [sprite('evil'),'evil',solid(),body()],
        '?' : [sprite('mystry'),solid(),'mystry'],
        '*' : [sprite('coin-?'),solid(),'coin-surprise'],
        '/' : [sprite('mushroom-?'),solid(),'mushroom-surprise']
        
    }

    const gameLevel = addLevel(map, levelCfg)

    const scoreLabel = add([
        text(score),
        pos(30,6),
        layer('ui'), // this is because we want to add the text to the ui layer
        {
            value : score
        }
    ])

    function big(){
        let timer = 0;
        let isBig = 0;
        return {
            update(){
                if(isBig){
                    timer -= dt()// dt is delta time its a kaboom method
                    if(timer<=0){
                        this.smallify();
                    }
                }
            },
            isBig(){
                return isBig;
            },
            smallify(){
                this.scale = vec2(1); // vec2 is used to adjust the scale 
                timer = 0;
                isBig = false;
            },
            biggify(time){
                this.scale = vec2(2);
                timer = time;
                isBig = true;
            }
        }
    }

    const player = add([
        sprite('hero'),solid(),
        pos(30,0),
        big(),
        body(),
        origin('bot')
    ])

    player.on("headbump", (obj) => {
        if (obj.is('coin-surprise')) {
          gameLevel.spawn('c', obj.gridPos.sub(0, 1))
          destroy(obj)
          gameLevel.spawn('=', obj.gridPos.sub(0,0))
        }
        if (obj.is('mushroom-surprise')) {
          gameLevel.spawn('m', obj.gridPos.sub(0, 1))
          destroy(obj)
          gameLevel.spawn('=', obj.gridPos.sub(0,0))
        }
      })

      player.collides('mushroom', (m) => {
        destroy(m)
        player.biggify(6)
      })

      player.collides('coin',(c)=>{
        destroy(c)
        scoreLabel.value++
        scoreLabel.text = scoreLabel.value
      })

      player.collides('evil',(e)=>{
        if(!isJumping || !player.grounded()){
            go('lose', { score: scoreLabel.value})
        }
        else {
            destroy(e);
        }
      })
    
      
      player.action(()=>{
        if(player.grounded()) {
            isJumping = false
        }
      })

      action('evil', (d) => {
        d.move(-ENEMY_SPEED, 0)
      })

    action('mushroom',(m)=>{
        m.move(10,0);
    })

    player.action(() => {
        if(player.pos.x > WIN_POS){
            go("win" , {score: scoreLabel.value});
        }
        camPos(player.pos)// The cam pos function helps to shift the background of the game 
        if (player.pos.y >= FALL_DEATH) {
          go('lose', { score: scoreLabel.value})
        }
        if(!player.grounded()){
            isJumping = true;
        }
    })
    
    keyDown("left",()=>{
        player.move(-Speed,0) // (x axis,y axis)
    })

    keyDown("right",()=>{
        player.move(Speed,0); // this is to move right
    })

    keyPress("up",()=>{
        if(player.grounded()){
            player.jump(Jump); // .grounded is a method in kaboom which checks whether or not the player is grounded or not
            isJumping = true;
        }  
    })

})

scene('lose', ({ score }) => {
    add([text(score, 32), origin('center'), pos(width()/2, height()/ 2)])
  })

scene('win',({score})=>{
    add([text("YOU WIN", 32),origin('center'),pos(width()/2 , height()/2)])
})

start("game")