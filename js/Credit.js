
phina.define('CreditButton', {
    'superClass': 'PixelSpriteButton',
    'init' : function() {
        this.superInit('button_credit');
    },
})

phina.define('CreditWindow', {
    'superClass': 'DisplayElement',
    'init': function() {
        this.superInit();

        //黒背景
        this.background = RectangleShape({
            'fill':'#000',
            'width':CANVAS_WIDTH,
            'height': CANVAS_HEIGHT,
            'stroke':null,
            'strokeWidth':0,
            'padding':0
            
        }).addChildTo(this);
        this.background.alpha = 0.8;
        this.background.origin.set(0, 0);
        this.background.setInteractive(true);
        this.background.onpointstart = function() {
            if (this.visible) {
                this.pushFlag = true;
            }
        }.bind(this);
        this.background.onpointend = function(e) {
            if (this.pushFlag && this.visible && !this.frame.hitTest(e.pointer.x, e.pointer.y)) {
                this.hide();
            }
            this.pushFlag = false;
            return false;
        }.bind(this);

        //「CREDIT」
        this.titleLabel = PixelSprite('text_credits').addChildTo(this);
        this.titleLabel.scale.set(PIXEL_SCALE, PIXEL_SCALE);
        this.titleLabel.position.set(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 48 * PIXEL_SCALE);

        //枠
        this.frame = PixelSprite('button_frame96x80').addChildTo(this);
        this.frame.position.set(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        this.frame.scale.set(PIXEL_SCALE, PIXEL_SCALE);

        //<開発>
        this.developerLabel = Label({
            'text':'【開発】',
            'fontFamily': 'PixelMplus',
            'fontSize': 6 * PIXEL_SCALE,
            'fill': '#444',
            'align':'left',
        }).addChildTo(this);
        this.developerLabel.position.set(
            CANVAS_WIDTH / 2 - 42 * PIXEL_SCALE, 
            CANVAS_HEIGHT / 2 - 30 * PIXEL_SCALE 
        );
        
        
        //アイコン
        this.mouseIcon = PixelSprite('mouse').addChildTo(this);
        this.mouseIcon.scale.set(PIXEL_SCALE, PIXEL_SCALE);
        this.mouseIcon.position.set(
            CANVAS_WIDTH / 2 - 30 * PIXEL_SCALE, 
            CANVAS_HEIGHT / 2 - 12 * PIXEL_SCALE
        );
        
        //「あさづけ」
        this.nameLabel = Label({
            'text':'あさづけ',
            'fontFamily': 'PixelMplus',
            'fontSize': 6 * PIXEL_SCALE,
            'fill': '#444',
            'align':'left',
        }).addChildTo(this);
        this.nameLabel.position.set(
            CANVAS_WIDTH / 2 - 18 * PIXEL_SCALE, 
            CANVAS_HEIGHT / 2 - 20 * PIXEL_SCALE
        );
        
        //好きな＊＊＊
        this.favoLabel = Label({
            'text':'',
            'fontFamily': 'PixelMplus',
            'fontSize': 5.5 * PIXEL_SCALE,
            'fill': '#444',
            'align':'left',
        }).addChildTo(this);
        this.favoLabel.position.set(
            CANVAS_WIDTH / 2 - 18 * PIXEL_SCALE, 
            CANVAS_HEIGHT / 2 - 8 * PIXEL_SCALE
        );
        
        //「Twitterを見る！」
        this.twitterButton = PixelSpriteButton('twitter_frame64x16', 'Twitterを見る！').addChildTo(this);
        this.twitterButton.position.set(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10 * PIXEL_SCALE);
        this.twitterButton.label.fontSize = 6 * PIXEL_SCALE;
        this.twitterButton.onPushed = function() {
            if (!this.visible) return;
            location.href = "https://twitter.com/AsazukeMochi";
        }.bind(this);
        
        //ほかのゲーム
        this.gamesButton = PixelSpriteButton('button_frame80x16', 'ほかのゲームで遊ぶ！').addChildTo(this);
        this.gamesButton.position.set(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 28 * PIXEL_SCALE);
        this.gamesButton.label.fontSize = 6 * PIXEL_SCALE;
        this.gamesButton.onPushed = function() {
            if (!this.visible) return;
            location.href = "../portal";
        }.bind(this);
    },

    'RotFavorite': function() {
        let favos = CreditWindow.Favos;
        
        //連続で同じのが出ないようにする
        let no = Random.randint(0, favos.length - 1);
        while(this.favoNo == no) {
            no = Random.randint(0, favos.length - 1);
        }
        this.favoNo = no;
        
        let favo = favos[this.favoNo];
        
        this.favoLabel.text = favo;
        
    },
    
    '_static': {
        'Favos': [
            '好きな食べもの：\n梅干し',
            '好きな食べもの：\nダブルチーズバーガー',
            '好きな寿司ネタ:\n生しらす',
            '好きな飲みもの：\nコーラゼロ',
            '好きな飲みもの：\nブラックコーヒー',
            '好きな飲みもの：\n甘酒',
            '好きな季節：\n冬',
            '好きな歌：\nダイヤモンドハッピー',
            '好きな魔法カード：\n融合派兵',
            '好きなブキ：\nドライブワイパー',
            '好きなブキ：\nヴァリアブルローラー',
            '好きな文芸部員：\nSayori',
            '好きなシャウト：\n揺るぎ無き力',
        ]
    }
})