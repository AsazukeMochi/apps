
const Dir = {
    'Left':{'x':-1, 'y':0},
    'Up':{'x':0, 'y':-1}, 
    'Right':{'x':1, 'y':0}, 
    'Down':{'x':0, 'y':1}
};

function ChainData(type, x, y) {
    return {
        'type':type,
        'dur':0,
        'durMax':type === Block.Type.Bomb ? 2 / 30 : 3 / 30,
        'prevBombs': [{'x':x, 'y':y}],
        'bombs': [{'x':x, 'y':y}],
        'end': false
    }
}

//ゲーム中の進行管理
phina.define('GameController', {
    'superClass': 'DisplayElement',
    'init': function() {
        this.superInit();
        
        this.gameState = GameController.GameState.Ready;
        this.scores = {'red':0, 'blue':0, 'yellow':0};
        this.energy = 0;
        this.energyState = GameController.EnergyState.Normal;
        
        this.timeCnt = GameController.GameTime;
        
        //ブロックを管理
        this.blockController = BlockController({
            'x': CANVAS_WIDTH / 2,
            'y': 156 * PIXEL_SCALE
        }).addChildTo(this);
        
        //画面中央に表示するラベル 321カウントやTIMEUPで使う
        this.centerLabel = CommonLabel({
            'text': '3',
            'fontSize': 12 * PIXEL_SCALE,
        }).addChildTo(this);
        this.centerLabel.fontSize = 12 * PIXEL_SCALE;
        this.centerLabel.position.set(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        this.centerLabel.setVisible(false);
        
        this.timeIcon = PixelSprite('clock').addChildTo(this);
        this.timeIcon.position.set(1 * PIXEL_SCALE, 10 * PIXEL_SCALE);
        this.timeIcon.origin.set(0, 0);
        this.timeIcon.scale.set(PIXEL_SCALE, PIXEL_SCALE);
        
        //残り時間を表示するラベル
        this.timeLabel = CommonLabel({
            'text': GameController.GameTime,
            'fontSize': 9 * PIXEL_SCALE
        }).addChildTo(this);
        this.timeLabel.origin.set(0, 0);
        this.timeLabel.position.set(11 * PIXEL_SCALE, 8 * PIXEL_SCALE);
        
        //ゲージ
        this.gauge = EnergyGauge().addChildTo(this);
        this.gauge.setFillRate(0);
        this.gauge.position.set(0, 0);
        
        //3,2,1,スタートイベント仕込む
        this.tweener.wait(1400).call(function(){
            this.target.centerLabel.show();
            this.target.centerLabel.text = '3';
        }).wait(1000).call(function() {
            this.target.centerLabel.text = '2';
        }).wait(1000).call(function() {
            this.target.centerLabel.text = '1';
        }).wait(1000).call(function() {
            const self = this.target;
            self.centerLabel.hide();
            self.gameState = GameController.GameState.Game;
            self.blockController.onChangeGameState(self.gameState);
        }).play();
    },
    
    'update': function(app) {
        switch(this.gameState) {
            case GameController.GameState.Game:
                this.updateGame();
                break;
                
            default: break;
        }
        
    },
    
    'updateGame': function() {
        
        if (this.energyState === GameController.EnergyState.Full) {
            this.energy -= GameController.EnergyMax / GameController.EnergyMaxDurationTime * Timer.deltaTime();
            if (this.energy <= 0) {
                this.energy = 0;
                this.energyState = GameController.EnergyState.Normal;
                this.gauge.setFlashMode(false);
                this.blockController.onEnergyGaugeEmpty();
            }
            
            this.gauge.setFillRate(this.energy / GameController.EnergyMax);
        }
        
        //のこり時間計測
        this.timeCnt -= Timer.deltaTime();
        this.timeCnt = Math.max(this.timeCnt, 0); //0以下にならない
        this.timeLabel.text = Math.ceil(this.timeCnt);
        
        if (this.timeCnt <= GameController.AlertTime) {
            this.timeLabel.fill = '#ff5050';
        }

        //タイムアップ
        if (this.timeCnt <= 0) {
            this.timeCnt = 0;
            this.gameState = GameController.GameState.TimeUp;
            this.blockController.onChangeGameState(this.gameState);
            
            //TIMEUP表示
            this.centerLabel.show();
            this.centerLabel.text = 'TIME UP!';
            
            //リザルトへ移行
            this.tweener.wait(3000).call(function(){
                this.target.startResult();
            }).play();
        }
        
    },
    
    'quake': function() {
        
        let controller = this.blockController;
        let ground = this.getParent().ground;
        
        if (controller.tweener.playing) return;
        
        const v = 2 * PIXEL_SCALE;
        const ms = 1;
        
        controller.tweener.set({'y':controller.y + v})
            .wait(ms).set({'y':controller.y})
            .wait(ms).set({'y':controller.y + v})
            .wait(ms).set({'y':controller.y})
            .play();
        
        ground.tweener.set({'y':ground.y + v})
            .wait(ms).set({'y':ground.y})
            .wait(ms).set({'y':ground.y + v})
            .wait(ms).set({'y':ground.y})
            .play();
        
    },
    
    'addEnergy': function() {
        if (this.energyState === GameController.EnergyState.Normal) {
            this.energy += 1;
            this.gauge.setFillRate(this.energy / GameController.EnergyMax);
            
            if (this.energy >= GameController.EnergyMax) {
                this.energy = GameController.EnergyMax;
                this.energyState = GameController.EnergyState.Full;
                this.blockController.requestSpawnBomb();
                this.gauge.setFlashMode(true);
            }
        }
    },
    
    'startResult': function() {
        this.gauge.hide();
        this.timeIcon.hide();
        this.timeLabel.hide();
        this.centerLabel.hide();
        
        this.centerLabel.text = 'THANK YOU\nFOR PLAYING!'; //あらかじめ変えちゃう
        
        let params = {
            'scores': {
                'red': this.scores.red,
                'blue': this.scores.blue,
                'yellow': this.scores.yellow,
                'total': this.scores.red + this.scores.blue + this.scores.yellow
            }
        }
        
        this.getParent().nextPhase(params);
    },
    
    'startThankYou': function() {
        this.centerLabel.setVisible(true);
        this.gameState = GameController.GameState.ThankYou;
        
        //ランダムで4種類から演出
        switch(Random.randint(0, 3)) {
            case 0:
                //左から爆発
                this.blockController.startChain(Block.Type.Bomb, 0, 0);
                this.blockController.startChain(Block.Type.Bomb, 0, 6);
                break;
                
            case 1:
                //中心から爆発
                this.blockController.startChain(Block.Type.Bomb, 2, 3);
                this.blockController.startChain(Block.Type.Bomb, 3, 3);
                break;
                
            case 2:
                //下から爆発
                this.blockController.startChain(Block.Type.Bomb, 0, 6);
                this.blockController.startChain(Block.Type.Bomb, 5, 6);
                break;
            case 3:
                //斜めに爆発
                this.blockController.startChain(Block.Type.Bomb, 5, 0);
                this.blockController.startChain(Block.Type.Bomb, 0, 6);
                break;
                
            default:
                break;
        }
        
        this.tweener.wait(3000).call(function(){
            this.target.getParent().nextPhase({'twitter':true});
        }).play();
    },
    
    //ブロックが壊されたときに実行
    'onBombBlock': function(type) {
        if (type != Block.Type.Bomb) {
            this.addEnergy();
            switch (type) {
                case Block.Type.Red:
                    this.scores.red += 1;
                    break;
                case Block.Type.Blue:
                    this.scores.blue += 1;
                    break;
                case Block.Type.Yellow:
                    this.scores.yellow += 1;
                    break;
                    
                default:
                    break;
            }
        } else {
            this.energyState = GameController.EnergyState.Stop;
        }
    },
    
    //連鎖が終わったときに実行
    'onChainEnd': function(chain) {
        if (chain.type === Block.Type.Bomb) {
            this.energyState = GameController.EnergyState.Normal;
            this.energy = 0;
            this.gauge.setFlashMode(false);
            this.gauge.setFillRate(0);
            this.blockController.landingQuakeFlag = true;
        }
    },
    
    _static: {
        'GameTime':30,
        'AlertTime':10,
        'GameState': {'Ready':0, 'Game':1, 'TimeUp':2, 'ThankYou': 3},
        'EnergyMax':60,
        'EnergyMaxDurationTime':10,
        'EnergyState': {'Normal':0, 'Full':1, 'Stop':2},
    }
})

//ブロックを管理
phina.define('BlockController', {
    'superClass': 'DisplayElement',
    'init': function(params) {
        this.superInit(params);
        this.scale.set(PIXEL_SCALE, PIXEL_SCALE);
        
        this.bombSpawnFlag = false;
        this.landingQuakeFlag = true;
        this.blocks = [];
        this.chains = [];
        this.lands = [];
        
        //tweenerの中にあるplayingフラグ、何故か最初trueなのでfalseにしたい
        this.tweener.wait(1).play();
        
        let dx = Math.floor(BlockController.CellCountX * 15 / 2) - 8;
        let dy = BlockController.CellCountY * 15 - 7;
        
        //ブロック配列用意
        for (let y = 0; y < BlockController.CellCountY; ++y) {
            this.blocks.push([]);
            this.lands.push(0);
        }
        
        //ブロック作る
        for (let y = BlockController.CellCountY - 1; y >= 0; --y) {
            for (let x = 0; x < BlockController.CellCountX; ++x) {
                
                let block = Block().addChildTo(this);
                block.position.set(x * 15 - dx, y * 15 - dy);
                block.cell.set(x, y);
                this.blocks[y].push(block);
                
                if (x == 0) {
                    this.lands[y] = block.bottom;
                }
                block.y = -(this.y / PIXEL_SCALE) - 8;
                
            }
        }
        
        //爆発アニメを管理
        this.explosionController = ExplosionController().addChildTo(this);
        
    },
    
    'update': function(app) {
        
        if (this.chains.length >= 1) {
            
            let createFlag = false;
        
            for (let chain of this.chains) {
                chain.dur += Timer.deltaTime();
                if (chain.dur >= chain.durMax) {
                    chain.dur = 0;
                    
                    let bombs = [];

                    for (let prev of chain.prevBombs) {
                        for (let d in Dir) {
                            let x = prev.x + Dir[d].x;
                            let y = prev.y + Dir[d].y;
                            if (this.bombBlock(chain.type, x, y)) {
                                bombs.push({'x':x, 'y': y});
                            }
                        }
                    }
                    
                    if (bombs.length >= 1) {
                        chain.prevBombs = bombs;
                        Array.prototype.push.apply(chain.bombs, bombs);
                    } else {
                        chain.end = true;
                        
                        if (this.getParent().gameState !== GameController.GameState.ThankYou) {
                            createFlag = true;
                        }
                        
                        for (let bomb of chain.bombs) {
                            let block = this.getBlock(bomb.x, bomb.y);
                            block.releaseFlag = true;
                        }
                        
                        this.getParent().onChainEnd(chain);
                    }
                }
            }
            
            if (createFlag) {
                this.chains = this.chains.filter(function(c){return !c.end});
                this.sortBlocks();
                this.createBlocks();
            }
        }
    },
    
    'findUpper': function(x, y) {
        let v = 1;
        while(y - v >= 0) {
            if (!this.blocks[y - v][x].releaseFlag &&
                this.blocks[y - v][x].state != Block.State.Breaked) {
                return this.blocks[y - v][x];
            }
            ++v;
        }
        
        return null;
    },
    
    //releaseFlagついたブロックを上に移動
    'sortBlocks': function() {
        for (let x = 0; x < BlockController.CellCountX; ++x) {
            for (let y = BlockController.CellCountY - 1; y >= 0; --y) {
                if (!this.blocks[y][x].releaseFlag) continue;
                let upper = this.findUpper(x, y);
                if (upper) {
                    this.swapBlock(this.blocks[y][x], upper);
                }
            }
        }
        
        for (let y = 0; y < BlockController.CellCountY; ++y) {
            for (let x = 0; x < BlockController.CellCountX; ++x) {
                this.blocks[y][x].applyImage();
            }
        }
    },
    
    //releaseFlagついたブロックを新しく作り直す
    'createBlocks': function() {
        for (let y = BlockController.CellCountY - 1; y >= 0; --y) {
            for (let x = 0; x < BlockController.CellCountX; ++x) {
                let block = this.blocks[y][x];
                if (block.releaseFlag) {
                    block.onCreate();
                    
                    //爆弾ブロックに上書き
                    if (this.bombSpawnFlag) {
                        block.type = Block.Type.Bomb;
                        block.applyImage();
                        this.bombSpawnFlag = false;
                    }
                    
                    //blockのupdateで勝手に補正される
                    block.y = -(this.y / PIXEL_SCALE) - 8;
                }
            }
        }
        
    },
    
    //連鎖開始
    'startChain': function(type, x, y) {
        this.bombBlock(type, x, y);
        this.chains.push(ChainData(type, x, y));
    },
    
    'bombBlock': function(type, x, y) {
        //範囲外チェック
        if (x < 0 || y < 0 || x >= BlockController.CellCountX || y >= BlockController.CellCountY) return false;
        
        let block = this.blocks[y][x];
        
        //種類チェック
        let typeCheck = (function(){
            if (type === Block.Type.Bomb) return true;
            return type === block.type;
        })();
        
        if (typeCheck &&
            block.state === Block.State.Idle) {
            
            //ブロック爆発
            block.bomb();
            
            //エフェクト発生
            this.explosionController.spawn(block.x, block.y);
            if (type === Block.Type.Bomb) {
                this.getParent().quake();
            }
            
            //通知送る
            this.getParent().onBombBlock(type);
            return true;
        }
        
        return false;
    },
    
    'getLand': function(y) {
        return this.lands[y];
    },
    
    'getBlock': function(x, y) {
        return this.blocks[y][x];
    },
    
    'swapBlock': function(block1, block2) {
        
        let tmp = {
            'position': {'x':block1.x, 'y':block1.y},
            'type':block1.type,
            'state':block1.state,
            'velocity':block1.velocity,
            'releaseFlag':block1.releaseFlag,
            'alpha':block1.alpha
        };
        
        block1.position.set(block2.x, block2.y);
        block1.type = block2.type;
        block1.state = block2.state;
        block1.velocity = block2.velocity;
        block1.releaseFlag = block2.releaseFlag;
        block1.alpha = block2.alpha;
        
        block2.position.set(tmp.position.x, tmp.position.y);
        block2.type = tmp.type;
        block2.state = tmp.state;
        block2.velocity = tmp.velocity;
        block2.releaseFlag = tmp.releaseFlag;
        block2.alpha = tmp.alpha;
        
    },
    
    'onBlockLanding': function() {
        if (this.landingQuakeFlag) {
            this.landingQuakeFlag = false;
            this.getParent().quake();
        }
    },
    
    //外部から爆弾を作る要求を受け取る
    'requestSpawnBomb' : function() {
        this.bombSpawnFlag = true;
    },
    
    //GameSceneのStateが変わった時に実行
    'onChangeGameState': function(state) {
        
        switch(state) {
            case GameController.GameState.Game:
                for (let y = 0; y < BlockController.CellCountY; ++y) {
                    for (let x = 0; x < BlockController.CellCountX; ++x) {
                        this.blocks[y][x].setInteractive(true);
                    }
                }
                break;
                
            case GameController.GameState.TimeUp:
                for (let y = 0; y < BlockController.CellCountY; ++y) {
                    for (let x = 0; x < BlockController.CellCountX; ++x) {
                        this.blocks[y][x].setInteractive(false);
                    }
                }
                break;
        }
        
    },
    
    //ゲージが空になった時に実行
    'onEnergyGaugeEmpty': function() {
        
        //爆誕ブロックを灰色ブロックに変化
        for (let y = 0; y < BlockController.CellCountY; ++y) {
            for (let x = 0; x < BlockController.CellCountX; ++x) {
                let block = this.blocks[y][x];
                if (block.type === Block.Type.Bomb) {
                    block.type = Block.Type.Gray;
                    block.applyImage();
                }
            }
        }
    },
    
    _static: {
        'CellCountX': 6,
        'CellCountY': 7
    }
    
})

//ブロック
phina.define('Block', {
    'superClass': 'PixelSprite',
    'init': function(params) {
        this.superInit('blocks');
        
        this.width = 16;
        this.height = 16;
        
        this.cell = Vector2();
        this.light = BlockLight().addChildTo(this);
        this.light.setVisible(false);
        
        this.onCreate();
    },
    
    'update': function(app) {
        
        switch(this.state) {
            case Block.State.Idle:
                this.updateIdle();
                break;
            case Block.State.Fall:
                this.updateFall();
                break;
        }
    },
    
    'bomb': function() {
        this.state = Block.State.Breaked;
        this.alpha = 0;
    },
    
    'updateIdle': function() {
        if (this.bottom < this.getParent().getLand(this.cell.y)) {
            this.state = Block.State.Fall;
            this.updateFall();
        }
    },
    
    'updateFall': function() {
        
        this.velocity += 14 * Timer.deltaTime();
        this.y += this.velocity;
        
        const land = this.getParent().getLand(this.cell.y);
        
        //下にあるブロックを超えないようにする
        if (this.cell.y != BlockController.CellCountY - 1) {
            let down = this.getParent().getBlock(this.cell.x, this.cell.y + 1);
            if (down.state == Block.State.Fall && down.top <= this.bottom) {
                this.y = down.top - 7;
            }
        }
        
        if (this.bottom >= land) {
            this.y = land - 8;
            this.velocity = 0;
            this.state = Block.State.Idle;
            this.getParent().onBlockLanding();
        }
    },
    
    'applyImage': function() {
        this.srcRect.set(this.type * 16, 0, 16, 16);
        this.light.visible = this.type === Block.Type.Bomb;
    },
    
    'onCreate' : function() {
        this.type = Random.randint(0, 2);
        this.state = Block.State.Idle;
        this.velocity = 0;
        this.alpha = 1;
        this.releaseFlag = false;
        
        this.applyImage();
    },
    
    'onpointend': function(e) {
        if (this.hitTest(e.pointer.x, e.pointer.y)) {
            if (this.state === Block.State.Idle) {
                this.getParent().startChain(this.type, this.cell.x, this.cell.y);
            }
        }
    },
    
    '_static': {
        'Type': {'Red':0, 'Blue':1, 'Yellow':2, 'Bomb':3, 'Gray':4},
        'State': {'Idle':0, 'Fall':1, 'Breaked': 2},
    }
});

//爆弾ブロック用の光
phina.define('BlockLight', {
    'superClass': 'DisplayElement',
    'init': function() {
        this.superInit();
        this.body = PixelSprite('block_ab').addChildTo(this);
        this.body.blendMode = 'lighter';
    },
    
    'update': function() {
        this.body.setVisible(!this.body.visible);
    }
});

//爆発エフェクト
phina.define('BombEffect', {
    'superClass':'DisplayElement',
    'init':function(params) {
        this.superInit();
        
        this.image = PixelSprite('flash').addChildTo(this);
        this.image.width = 32;
        this.image.srcRect.set(0, 0, 32, 32);
        
        this.animCnt = 0;
        this.animNo = 2;
        
    },
    
    'update': function(app) {
        if (!this.visible) return;
        
        if (++this.animCnt >= 2) {
            this.animCnt = 0;
            this.animNo++;
            this.image.srcRect.set(32 * this.animNo, 0, 32, 32);
            
            if (this.animNo >= 7) {
                this.setVisible(false);
            }
        }
    },
    
    'start': function() {
        if (this.visible) return;
        this.setVisible(true);
        this.animCnt = 0;
        this.animNo = 2; //2コマ目から開始
        this.image.srcRect.set(0, 0, 32, 32);
    }
});

//爆発エフェクトを管理
phina.define('ExplosionController', {
    'superClass': 'DisplayElement',
    'init': function() {
        this.superInit();
        
        this.effects = [];
        
        for (let i = 0; i < ExplosionController.NumberOfEffects; ++i) {
            let effect = BombEffect().addChildTo(this);
            effect.setVisible(false);
            this.effects.push(effect);
        }
        
    },
    
    'spawn': function(x, y) {
        for (let i = 0; i < ExplosionController.NumberOfEffects; ++i) {
            if (this.effects[i].visible) continue;
            this.effects[i].start();
            this.effects[i].position.set(x, y);
            break;
        }
    },
    
    '_static': {
        'NumberOfEffects': 30
    }
    
})

//エナジーゲージ
phina.define('EnergyGauge', {
    'superClass': 'DisplayElement',
    'init': function() {
        this.superInit();
        this.scale.set(PIXEL_SCALE, PIXEL_SCALE);
        
        this.frame = PixelSprite('gauge_frame').addChildTo(this);
        this.frame.origin.set(0, 0);
        
        this.fill = PixelSprite('gauge_fill').addChildTo(this);
        this.fill.origin.set(0, 0);
        this.fill.position.set(1, 1);
        
        this.flash = RectangleShape({
            'fill':'#333',
            'padding':0,
            'strokeWidth':0,
            'width':this.fill.width,
            'height': this.fill.height
        }).addChildTo(this.fill);
        this.flash.origin.set(0, 0);
        this.flash.blendMode = 'lighter';
        this.flash.setVisible(false);
        
        this.flashMode = false;
        
    },
    
    'update': function() {
        if (this.flashMode) {
            this.flash.setVisible(!this.flash.visible);
        }
    },
    
    'setFillRate': function(rate) {
        this.fill.width = Math.floor(46 * rate);
        this.flash.width = Math.max(this.fill.width, 1); //0だとバグる
    },
    
    'setFlashMode': function(active) {
        this.flashMode = active;
        
        if (this.flashMode === false) {
            this.flash.setVisible(false);
        }
    }
    
})