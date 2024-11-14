phina.define('TitleController', {
    'superClass': 'DisplayElement',
    'init': function(params) {
        this.superInit();
        
        params = params || {};
        
        //タイトルロゴ
        this.logo = PixelSprite('logo').addChildTo(this);
        this.logo.scale.set(PIXEL_SCALE, PIXEL_SCALE);
        this.logo.position.set(
            CANVAS_WIDTH / 2, 
            -this.logo.height / 2 * PIXEL_SCALE,
        );
        
        //STARTボタン
        this.startLabel = CommonLabelButton({
            'text': 'スタート'
        }).addChildTo(this);
        this.startLabel.position.set(
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2 + (8 * PIXEL_SCALE)
        );
        this.startLabel.setSize(40 * PIXEL_SCALE, 12 * PIXEL_SCALE);
        this.startLabel.onPushed = function() {
            this.getParent().gameStart();
        }
        this.startLabel.setInteractive(false);
        this.startLabel.hide();
        
        //あそびかたボタン
        this.tutorialLabel = CommonLabelButton({
            'text': 'あそびかた',
        }).addChildTo(this);
        this.tutorialLabel.position.set(
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2 + (30 * PIXEL_SCALE)
        );
        this.tutorialLabel.setSize(50 * PIXEL_SCALE, 12 * PIXEL_SCALE);
        this.tutorialLabel.onPushed = function() {
            this.getParent().showTutorialWindow();
        }
        this.tutorialLabel.setInteractive(false);
        this.tutorialLabel.hide();
        
        //ハイスコア記録済みなら表示
        let highScore = Cookie.Get('high_score');
        if (highScore) {
            
            //ハイスコアの王冠アイコン
            this.highScoreIcon = PixelSprite('crown').addChildTo(this);
            this.highScoreIcon.origin.set(0, 0);
            this.highScoreIcon.scale.set(PIXEL_SCALE, PIXEL_SCALE);
            this.highScoreIcon.position.set(2 * PIXEL_SCALE, 3 * PIXEL_SCALE);
            this.highScoreIcon.hide();

            //ハイスコアラベル
            this.highScoreLabel = CommonLabel({
                'text': highScore,
                'fontSize':10 * PIXEL_SCALE
            }).addChildTo(this);
            this.highScoreLabel.position.set(10 * PIXEL_SCALE, 0);
            this.highScoreLabel.origin.set(0, 0);
            this.highScoreLabel.hide();
        }
        
        if (params.twitter) {

            // this.creditButton = CreditButton().addChildTo(this);
            // this.creditButton.position.set(
            //     CANVAS_WIDTH - this.creditButton.width / 2,
            //     CANVAS_HEIGHT - this.creditButton.height / 2
            // );
            // this.creditButton.onPushed = function(){
            //     this.creditButton.tweener.wait(1).call(function(){
            //         this.creditWindow.RotFavorite();
            //         this.creditWindow.show();
            //     }.bind(this)).play();
            // }.bind(this);
            // this.creditButton.setInteractive(false);
            // this.creditButton.hide();

            // this.creditWindow = CreditWindow().addChildTo(this);
            // this.creditWindow.hide();
        }
        
        this.tutorialWindow = TutorialWindow().addChildTo(this);
        this.tutorialWindow.position.set(
            -CANVAS_WIDTH / 2, 
            CANVAS_HEIGHT / 2
        );
        this.tutorialWindow.hide();
        
        //ロゴ移動
        let logoy = CANVAS_HEIGHT / 2 - (50 * PIXEL_SCALE);
        this.logo.tweener
            .to({'y':logoy}, 600)
            .set({'y':logoy - (2 * PIXEL_SCALE)}).wait(10)
            .set({'y':logoy}).wait(10)
            .set({'y':logoy - (2 * PIXEL_SCALE)}).wait(10)
            .set({'y':logoy})
            .play();
        
        //少し待ってからボタン表示
        this.tweener.wait(1200).call(function(){
            let self = this.target;
            self.startLabel.show();
            self.startLabel.setInteractive(true);
            self.tutorialLabel.show();
            self.tutorialLabel.setInteractive(true);
            
            if (self.highScoreIcon) {
                self.highScoreIcon.show();
            }
            
            if (self.highScoreLabel) {
                self.highScoreLabel.show();
            }

            if (self.creditButton) {
                self.creditButton.show();
                self.creditButton.y = CANVAS_HEIGHT + self.creditButton.height / 2;
                self.creditButton.tweener.wait(200)
                .to({'y':CANVAS_HEIGHT - self.creditButton.height / 2}, 200)
                .set({'interactive':true});
            }
        });
        
    },
    
    'update': function(app) {
        
    },
    
    'gameStart': function() {
        if (this.tutorialWindow.visible) return;
        if (this.creditWindow && this.creditWindow.visible) return;
        this.getParent().nextPhase();
    },
    
    'showTutorialWindow': function() {
        if (this.tutorialWindow.visible) return;
        if (this.creditWindow && this.creditWindow.visible) return;
        this.tutorialWindow.show();
        this.tutorialWindow.setPage(0);
        this.tutorialWindow.tweener.to({'x':CANVAS_WIDTH / 2}, 400, 'swing').play();
        
    }
})

phina.define('TutorialWindow', {
    'superClass': 'DisplayElement',
    'init': function() {
        this.superInit();
        
        this.pageNo = 0;
        
        this.frame = PixelSprite('button_frame96x126').addChildTo(this);
        this.frame.scale.set(PIXEL_SCALE, PIXEL_SCALE);
        
        this.image = PixelSprite('tutorial1').addChildTo(this);
        this.image.scale.set(PIXEL_SCALE, PIXEL_SCALE);
        this.image.position.set(
            0,
            -24 * PIXEL_SCALE
        )
        
        this.label = CommonLabel({
            'fontSize':8 * PIXEL_SCALE
        }).addChildTo(this)
        this.label.origin.set(0.5, 1);
        this.label.position.set(
            0,
            40 * PIXEL_SCALE
        );
        
        this.nextButton = PixelSpriteButton('button_frame80x16', 'つぎへ').addChildTo(this);
        this.nextButton.position.set(
            0,
            (126 / 2 - 12) * PIXEL_SCALE
        )
        this.nextButton.onPushed = function() {
            this.getParent().nextPage();
        }
        
        this.setPage(0);
    },
    
    'setPage': function(pageNo) {
        this.pageNo = pageNo;
        let data = TutorialWindow.TutorialData[pageNo];
        this.image.setImage(data.image);
        this.nextButton.label.text = this.pageNo == TutorialWindow.TutorialData.length - 1 ? 'とじる' : 'つぎへ';
        this.label.text = data.text;
    },
    
    'nextPage': function() {
        if (this.pageNo + 1 < TutorialWindow.TutorialData.length) {
            this.setPage(this.pageNo + 1);
            this.tweener.set({'y':this.y + (2 * PIXEL_SCALE)}).wait(50)
                    .set({'y':this.y}).wait(50).play();
        } else {
            this.close();
        }
    },
    
    'close': function() {
        if (this.tweener.playing) return;
        this.tweener.to({'x':-CANVAS_WIDTH / 2}, 300, 'swing')
            .set({'visible':false}).play();
    },
    
    _static: {
        
        'TutorialData': [
            {
                'image':'tutorial1',
                'text':'タップで\nブロックを壊す！'
            },
            
            {
                'image':'tutorial2',
                'text':'同じ色のブロックは\nまとめて壊れるぞ！'
            },
            
            {
                'image':'tutorial3',
                'text':'1ゲーム30秒！\nたくさん壊して、\nめざせ！タツジン級！'
            },
        ]
        
    }
    
})