//リザルト管理
phina.define('ResultController', {
    'superClass': 'DisplayElement',
    'init': function(params) {
        params = params || {};
        
        this.superInit();
        this.scores = {
            'red': 0,
            'blue': 0,
            'yellow': 0,
            'total': 0,
            'high':0
        }
        this.phase = ResultController.Phases.Ready;
        this.quakeTweener = Tweener().attachTo(this);
        this.quakeTweener.wait(1).play();
        
        if (params.scores) {
            this.scores = params.scores;
        }
        
        //黒背景
        this.bg = RectangleShape({
            'width': CANVAS_WIDTH,
            'height': CANVAS_HEIGHT + (12 * PIXEL_SCALE),
            'fill': '#000',
        }).addChildTo(this);
        this.bg.position.set(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        this.bg.alpha = 0;
        this.bg.setInteractive(true);
        this.bg.onpointend = function() {
            let self = this.getParent();
            
            //画面のどこかをタッチしたら次に進む
            if (self.phase >= ResultController.Phases.Red &&
                self.phase <= ResultController.Phases.Total) {
                self.nextPhase();
            }
        }
        
        //赤ブロックアイコン
        this.redIcon = PixelSprite('blocks').addChildTo(this);
        this.redIcon.position.set(
            CANVAS_WIDTH / 2 - (24 * PIXEL_SCALE),
            CANVAS_HEIGHT / 2 - (64 * PIXEL_SCALE)
        );
        this.redIcon.scale.set(PIXEL_SCALE, PIXEL_SCALE);
        this.redIcon.setSize(16, 16);
        this.redIcon.srcRect.set(16 * 0, 0, 16, 16);
        this.redIcon.setVisible(false);
        
        
        //赤ブロックスコアラベル
        this.redLabel = CommonLabel({
            'text':'0',
            'fontSize':12 * PIXEL_SCALE,
            'align': 'right'
        }).addChildTo(this);
        this.redLabel.position.set(
            CANVAS_WIDTH / 2 + (32 * PIXEL_SCALE),
            CANVAS_HEIGHT / 2 - (64 * PIXEL_SCALE)
        );
        this.redLabel.setVisible(false);
        
        
        //青ブロックアイコン
        this.blueIcon = PixelSprite('blocks').addChildTo(this);
        this.blueIcon.position.set(
            this.redIcon.x,
            this.redIcon.y + (20 * PIXEL_SCALE)
        );
        this.blueIcon.scale.set(PIXEL_SCALE, PIXEL_SCALE);
        this.blueIcon.setSize(16, 16);
        this.blueIcon.srcRect.set(16 * 1, 0, 16, 16);
        this.blueIcon.setVisible(false);
        
        
        //青ブロックスコアラベル
        this.blueLabel = CommonLabel({
            'text':'0',
            'fontSize':12 * PIXEL_SCALE,
            'align': 'right'
        }).addChildTo(this);
        this.blueLabel.position.set(
            this.redLabel.x,
            this.blueIcon.y
        );
        this.blueLabel.setVisible(false);
        
        
        //黄ブロックアイコン
        this.yellowIcon = PixelSprite('blocks').addChildTo(this);
        this.yellowIcon.position.set(
            this.blueIcon.x,
            this.blueIcon.y + (20 * PIXEL_SCALE)
        );
        this.yellowIcon.scale.set(PIXEL_SCALE, PIXEL_SCALE);
        this.yellowIcon.setSize(16, 16);
        this.yellowIcon.srcRect.set(16 * 2, 0, 16, 16);
        this.yellowIcon.setVisible(false);
        
        
        //黄ブロックスコアラベル
        this.yellowLabel = CommonLabel({
            'text':'0',
            'fontSize':12 * PIXEL_SCALE,
            'align': 'right'
        }).addChildTo(this);
        this.yellowLabel.position.set(
            this.blueLabel.x,
            this.yellowIcon.y
        );
        this.yellowLabel.setVisible(false);
        
        //合計スコアアイコン
        this.totalIcon = CommonLabel({
            'text':'TOTAL',
            'fontSize':14 * PIXEL_SCALE,
        }).addChildTo(this);
        this.totalIcon.position.set(
            this.yellowIcon.x,
            this.yellowIcon.y + (24 * PIXEL_SCALE)
        )
        this.totalIcon.setVisible(false);
        
        
        //合計スコアラベル
        this.totalLabel = CommonLabel({
            'text':'0',
            'fontSize':14 * PIXEL_SCALE,
            'align': 'right'
        }).addChildTo(this);
        this.totalLabel.position.set(
            this.yellowLabel.x,
            this.totalIcon.y
        )
        this.totalLabel.setVisible(false);
        
        this.totalFlash = FlashLabel({
            'text':'0',
            'fontSize':14 * PIXEL_SCALE,
            'align': 'right'
        }).addChildTo(this.totalLabel);
        this.totalFlash.setVisible(false);
        
        //「HIGH SCORE!」のラベル
        this.highScoreLabel = CommonLabel({
            'text':'HI-SCORE!',
            'fontSize':6 * PIXEL_SCALE,
            'fill':'#ff2a2a',
            'align':'right'
        }).addChildTo(this);
        this.highScoreLabel.position.set(
            this.totalLabel.x,
            this.totalLabel.y + 10 * PIXEL_SCALE
        );
        this.highScoreLabel.setVisible(false);
        
        //「ウデマエ」文字
        this.udemaeIcon = CommonLabel({
            'text': 'ウデマエ',
            'fontSize':8 * PIXEL_SCALE,
        }).addChildTo(this);
        this.udemaeIcon.position.set(
            this.totalIcon.x,
            this.totalIcon.y + (24 * PIXEL_SCALE)
        )
        this.udemaeIcon.setVisible(false);
        
        //ウデマエ名ラベル
        let udemae = this.getUdemae(this.scores.total);
        this.udemaeLabel = CommonLabel({
            'text': udemae.name,
            'fill': udemae.textFill,
            'fontSize': 12 * PIXEL_SCALE
        }).addChildTo(this);
        this.udemaeLabel.position.set(
            CANVAS_WIDTH / 2,
            this.udemaeIcon.y + (16 * PIXEL_SCALE)
        );
        this.udemaeLabel.setVisible(false);
        
        //twitterシェアボタン
        this.twitterButton = PixelSpriteButton('twitter_frame64x16', 'Twitterでシェア！').addChildTo(this);
        this.twitterButton.position.set(
            CANVAS_WIDTH / 2,
            this.udemaeLabel.y + (24 * PIXEL_SCALE)
        );
        this.twitterButton.label.fontSize = 8 * PIXEL_SCALE;
        this.twitterButton.onPushed = function() {
            GA.SendEvent('share');
            let p = this.getParent();
            Twitter.Share(p.shareString(p.scores.total));
        }
        this.twitterButton.setVisible(false);
        this.twitterButton.setInteractive(false);
        
        //リザルト閉じるボタン
        this.exitButton = PixelSpriteButton('button_frame32x16', 'OK').addChildTo(this);
        this.exitButton.position.set(
            CANVAS_WIDTH - (32 / 2 * PIXEL_SCALE),
            CANVAS_HEIGHT - (16 / 2 * PIXEL_SCALE)
        )
        this.exitButton.setVisible(false);
        this.exitButton.onPushed = function() {
            this.getParent().nextPhase();
        }
        
        //爆発エフェクト
        this.explosionController = ExplosionController().addChildTo(this);
        this.explosionController.scale.set(PIXEL_SCALE, PIXEL_SCALE);
        
        //フェードインで登場、完了したらスコア表示開始
        this.bg.tweener
            .wait(300).set({'alpha':0.5})
            .wait(300).set({'alpha':0.7})
            .wait(300).set({'alpha':0.8})
            .wait(300).call(function() {
                this.target.getParent().nextPhase();
            }).play();
    },
    
    'update': function(app) {
        
        switch(this.phase) {
            case ResultController.Phases.Red: {
                let score = Number(this.redLabel.text);
                score += 3;
                this.redLabel.text = String(score);
                if (score >= this.scores.red) {
                    this.nextPhase();
                }
            }
                break;
                
            case ResultController.Phases.Blue: {
                let score = Number(this.blueLabel.text);
                score += 3;
                this.blueLabel.text = String(score);
                if (score >= this.scores.blue) {
                    this.nextPhase();
                }
            }
                break;
                
            case ResultController.Phases.Yellow: {
                let score = Number(this.yellowLabel.text);
                score += 3;
                this.yellowLabel.text = String(score);
                if (score >= this.scores.yellow) {
                    this.nextPhase();
                }
            }
                break;
                
            case ResultController.Phases.Total: {
                let score = Number(this.totalLabel.text);
                score += 3;
                this.totalLabel.text = String(score);
                
                if (this.scores.high > 0 && score >= this.scores.high) {
                    this.highScoreLabel.show();
                }
                if (score >= this.scores.total) {
                    this.nextPhase();
                }
            }
                
                break;
        }
        
    },
    
    //次のフェイズへ
    //MainSceneと同じメソッド名になっちゃった
    'nextPhase': function() {
        if (this.phase === ResultController.Phases.End) return;
        
        this.phase++;
        
        switch(this.phase) {
            case ResultController.Phases.Red:
                this.redIcon.setVisible(true);
                this.redLabel.setVisible(true);
                break;
                
            case ResultController.Phases.Blue:
                this.redLabel.text = String(this.scores.red);
                this.quake();
                this.explosionController.spawn(
                    this.redLabel.x / PIXEL_SCALE - 16,
                    this.redLabel.y / PIXEL_SCALE + 8
                );
                this.tweener.wait(100).call(function(){
                    this.target.explosionController.spawn(
                        this.target.redLabel.x / PIXEL_SCALE,
                        this.target.redLabel.y / PIXEL_SCALE - 8
                    )
                }).play();
                
                this.blueIcon.setVisible(true);
                this.blueLabel.setVisible(true);
                break;
                
            case ResultController.Phases.Yellow:
                this.blueLabel.text = String(this.scores.blue);
                this.quake();
                this.explosionController.spawn(
                    this.blueLabel.x / PIXEL_SCALE - 16,
                    this.blueLabel.y / PIXEL_SCALE + 8
                );
                this.tweener.wait(100).call(function(){
                    this.target.explosionController.spawn(
                        this.target.blueLabel.x / PIXEL_SCALE,
                        this.target.blueLabel.y / PIXEL_SCALE - 8
                    )
                }).play();
                this.yellowIcon.setVisible(true);
                this.yellowLabel.setVisible(true);
                break;
                
            case ResultController.Phases.Total: 
                this.yellowLabel.text = String(this.scores.yellow);
                this.quake();
                this.explosionController.spawn(
                    this.yellowLabel.x / PIXEL_SCALE - 16,
                    this.yellowLabel.y / PIXEL_SCALE + 8
                );
                this.tweener.wait(100).call(function(){
                    this.target.explosionController.spawn(
                        this.target.yellowLabel.x / PIXEL_SCALE,
                        this.target.yellowLabel.y / PIXEL_SCALE - 8
                    )
                }).play();
                this.totalIcon.setVisible(true);
                this.totalLabel.setVisible(true);
                break;
                
            case ResultController.Phases.Udemae: 
                this.totalLabel.text = String(this.scores.total);
                this.totalFlash.show();
                if (this.scores.high > 0 && this.scores.total > this.scores.high) {
                    this.highScoreLabel.show();
                }
                this.quake();
                this.explosionController.spawn(
                    this.totalLabel.x / PIXEL_SCALE - 20,
                    this.totalLabel.y / PIXEL_SCALE + 10
                );
                this.tweener.wait(100).call(function(){
                    this.target.explosionController.spawn(
                        this.target.totalLabel.x / PIXEL_SCALE - 20,
                        this.target.totalLabel.y / PIXEL_SCALE - 10
                    )
                    this.target.explosionController.spawn(
                        this.target.totalLabel.x / PIXEL_SCALE,
                        this.target.totalLabel.y / PIXEL_SCALE + 10
                    )
                }).wait(100).call(function(){
                    this.target.explosionController.spawn(
                        this.target.totalLabel.x / PIXEL_SCALE,
                        this.target.totalLabel.y / PIXEL_SCALE - 8
                    )
                }).play();
                
                this.udemaeIcon.tweener.wait(900).set({'visible': true}).play();
                this.udemaeLabel.tweener.wait(2300).set({'visible': true}).play();
                this.tweener.wait(3300).call(function(){
                    this.target.nextPhase();
                }).play();
                break;
                
            case ResultController.Phases.Free:
                
                this.tweener.call(function(){
                    this.target.twitterButton.show();
                    this.target.twitterButton.setInteractive(true);
                }).wait(300).call(function(){
                    this.target.exitButton.show();
                    this.target.exitButton.setInteractive(true);
                })
                
                break;
                
            case ResultController.Phases.End:
                this.redIcon.setVisible(false);
                this.redLabel.setVisible(false);
                this.blueIcon.setVisible(false);
                this.blueLabel.setVisible(false);
                this.yellowIcon.setVisible(false);
                this.yellowLabel.setVisible(false);
                this.totalIcon.setVisible(false);
                this.totalLabel.setVisible(false);
                this.totalFlash.setVisible(false);
                this.highScoreLabel.setVisible(false);
                this.udemaeIcon.setVisible(false);
                this.udemaeLabel.setVisible(false);
                this.twitterButton.setVisible(false);
                this.twitterButton.setInteractive(false);
                this.exitButton.setVisible(false);
                this.exitButton.setInteractive(false);
                
                this.bg.tweener.wait(100).set({'alpha':0.7})
                    .wait(100).set({'alpha':0.6})
                    .wait(100).set({'alpha':0.5})
                    .wait(100).set({'alpha':0})
                    .play();
                
                this.tweener.wait(600).call(function(){
                    this.target.getParent().nextPhase();
                }).play();
                
                break;
        }
    },
    
    'quake': function() {
        if (this.quakeTweener.playing) return;
        
        let dy = 2 * PIXEL_SCALE;
        let ms = 1;
        
        this.quakeTweener.set({'y':this.y + dy}).wait(ms)
            .set({'y':this.y}).wait(ms)
            .set({'y':this.y + dy}).wait(ms)
            .set({'y':this.y}).wait(ms).play();
        
    },
    
    'getUdemae': function(totalScore) {
        const Udemae = ResultController.Udemae;
        for (let i = Udemae.length - 1; i >= 0; --i) {
            if (totalScore >= Udemae[i].score) return Udemae[i];
        }
        
        return Udemae[0];
    },
    
    'shareString': function(totalScore) {
        let udemae = this.getUdemae(totalScore);
        return 'スコア:' + totalScore + '　ウデマエ「' + udemae.name + '」を獲得したよ！' + 
            'タッチでブロックをたくさん壊す！Twitter上で手軽に遊べるミニゲーム！';
    },
    
    _static : {
        'Phases': {
            'Ready': 0,
            'Red': 1,
            'Blue': 2,
            'Yellow': 3,
            'Total': 4,
            'Udemae': 5,
            'Free': 6,
            'End': 7,
        },
        
        'Udemae': [
            {'score':0, 'name':'ネオチ', 'textFill':'#ffffff'},
            {'score':1, 'name':'アルバイト級', 'textFill':'#ffffff'},
            {'score':100, 'name':'ヒラシャイン級', 'textFill':'#ffffff'},
            {'score':200, 'name':'エリート級', 'textFill':'#ffd800'},
            {'score':250, 'name':'タツジン級', 'textFill':'#ff0000'},
            {'score':300, 'name':'ハカイ神', 'textFill':'#b100ff'},
        ]
    }
})

phina.define('FlashLabel', {
    'superClass': 'DisplayElement',
    'init': function(params) {
        this.superInit();
        params = params || {};
        
        params.$safe({
            'fill':'#333',
            'stroke':'#333'
        });
        
        this.label = CommonLabel(params).addChildTo(this);
        this.label.blendMode = 'lighter';
    },
    
    'update': function() {
        this.label.text = this.getParent().text;
        this.label.setVisible(!this.label.visible);
    }
})